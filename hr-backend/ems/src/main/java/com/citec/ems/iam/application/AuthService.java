package com.citec.ems.iam.application;


import com.citec.ems.iam.domain.*;
import com.citec.ems.iam.infrastructure.*;
import com.citec.ems.shared.BadRequestException;
import com.citec.ems.iam.web.IamDtos.AuthResponse;
import com.citec.ems.iam.web.IamDtos.AuthUserResponse;
import com.citec.ems.iam.web.IamDtos.LoginRequest;
import com.citec.ems.iam.security.AccessTokenService;
import com.citec.ems.iam.security.AccessTokenService.GeneratedAccessToken;
import com.citec.ems.iam.security.AuthenticatedUser;
import com.citec.ems.iam.security.EmsSecurityProperties;
import com.citec.ems.iam.security.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final String WEB_CLIENT = "WEB_APPLICATION";
    private static final String MOBILE_CLIENT = "MOBILE_APPLICATION";
    private static final String DEFAULT_APPLICATION = "ADMIN";

    private final UserRepository userRepository;
    private final ClientApplicationRepository clientApplicationRepository;
    private final UserDeviceRepository userDeviceRepository;
    private final UserSessionRepository userSessionRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccessTokenService accessTokenService;
    private final RefreshTokenService refreshTokenService;
    private final EmsSecurityProperties securityProperties;
    private final IpRuleService ipRuleService;

    public AuthService(
            UserRepository userRepository,
            ClientApplicationRepository clientApplicationRepository,
            UserDeviceRepository userDeviceRepository,
            UserSessionRepository userSessionRepository,
            RefreshTokenRepository refreshTokenRepository,
            LoginAttemptRepository loginAttemptRepository,
            UserRoleRepository userRoleRepository,
            RolePermissionRepository rolePermissionRepository,
            PasswordEncoder passwordEncoder,
            AccessTokenService accessTokenService,
            RefreshTokenService refreshTokenService,
            EmsSecurityProperties securityProperties,
            IpRuleService ipRuleService) {
        this.userRepository = userRepository;
        this.clientApplicationRepository = clientApplicationRepository;
        this.userDeviceRepository = userDeviceRepository;
        this.userSessionRepository = userSessionRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.loginAttemptRepository = loginAttemptRepository;
        this.userRoleRepository = userRoleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.passwordEncoder = passwordEncoder;
        this.accessTokenService = accessTokenService;
        this.refreshTokenService = refreshTokenService;
        this.securityProperties = securityProperties;
        this.ipRuleService = ipRuleService;
    }

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletRequest servletRequest) {
        String identifier = request.usernameOrEmail().trim();
        String clientCode = request.clientCode() == null || request.clientCode().isBlank()
                ? WEB_CLIENT
                : request.clientCode().trim();
        ClientApplication clientApplication = activeClientApplication(clientCode);
        User user = userRepository.findByUsernameOrEmail(identifier).orElse(null);
        String ipAddress = clientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");

        if (user == null) {
            logAttempt(identifier, null, request.deviceUuid(), false, "USER_NOT_FOUND", ipAddress, userAgent, clientApplication);
            throw invalidCredentials();
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            logAttempt(identifier, user, request.deviceUuid(), false, "WRONG_PASSWORD", ipAddress, userAgent, clientApplication);
            throw invalidCredentials();
        }
        if (!UserStatus.ACTIVE.equalsIgnoreCase(user.getStatus().getStatusCode())) {
            logAttempt(identifier, user, request.deviceUuid(), false, "USER_INACTIVE", ipAddress, userAgent, clientApplication);
            throw new BadRequestException("User is not active.");
        }

        UserDevice userDevice = null;
        if (MOBILE_CLIENT.equalsIgnoreCase(clientApplication.getClientCode())) {
            userDevice = authorizedDevice(user, request.deviceUuid(), clientApplication);
        } else {
            String applicationCode = request.applicationCode() == null || request.applicationCode().isBlank()
                    ? DEFAULT_APPLICATION
                    : request.applicationCode().trim();
            ipRuleService.assertLoginAllowed(user.getUserId(), applicationCode, ipAddress);
        }

        LocalDate today = LocalDate.now();
        List<String> roles = userRoleRepository.findActiveRoleCodesByUserId(user.getUserId(), today);
        List<String> permissions = rolePermissionRepository.findAllowedPermissionCodesByUserId(user.getUserId(), today);
        LocalDateTime now = LocalDateTime.now();

        UserSession session = new UserSession();
        session.setUser(user);
        session.setClientApplication(clientApplication);
        session.setUserDevice(userDevice);
        session.setSessionUuid(UUID.randomUUID());
        session.setIpAddress(ipAddress);
        session.setUserAgent(userAgent);
        session.setLastSeenAt(now);
        session.setExpiresAt(now.plus(securityProperties.refreshTokenTtl()));
        userSessionRepository.save(session);

        String rawRefreshToken = refreshTokenService.generateRawToken();
        RefreshToken refreshToken = createRefreshToken(user, session, rawRefreshToken, UUID.randomUUID(), now);
        refreshTokenRepository.save(refreshToken);

        GeneratedAccessToken accessToken = accessTokenService.generate(user, session.getSessionUuid(), roles, permissions, now);
        logAttempt(identifier, user, request.deviceUuid(), true, null, ipAddress, userAgent, clientApplication);

        return response(user, roles, permissions, accessToken, rawRefreshToken, refreshToken.getExpiresAt());
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        String tokenHash = refreshTokenService.hash(rawRefreshToken);
        RefreshToken currentToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token."));
        LocalDateTime now = LocalDateTime.now();
        if (currentToken.getRevokedAt() != null || currentToken.getExpiresAt().isBefore(now)) {
            throw new BadCredentialsException("Refresh token is no longer valid.");
        }
        if (currentToken.getUsedAt() != null) {
            revokeSession(currentToken.getUserSession(), "REFRESH_TOKEN_REUSED");
            throw new BadCredentialsException("Refresh token has already been used.");
        }

        User user = currentToken.getUser();
        UserSession session = currentToken.getUserSession();
        if (session.getRevokedAt() != null || session.getExpiresAt().isBefore(now)) {
            throw new BadCredentialsException("Session is no longer valid.");
        }

        LocalDate today = LocalDate.now();
        List<String> roles = userRoleRepository.findActiveRoleCodesByUserId(user.getUserId(), today);
        List<String> permissions = rolePermissionRepository.findAllowedPermissionCodesByUserId(user.getUserId(), today);

        currentToken.setUsedAt(now);
        String nextRawRefreshToken = refreshTokenService.generateRawToken();
        RefreshToken nextToken = createRefreshToken(
                user,
                session,
                nextRawRefreshToken,
                currentToken.getTokenFamilyUuid(),
                now);
        refreshTokenRepository.save(nextToken);
        currentToken.setReplacedByToken(nextToken);
        session.setLastSeenAt(now);

        GeneratedAccessToken accessToken = accessTokenService.generate(user, session.getSessionUuid(), roles, permissions, now);
        return response(user, roles, permissions, accessToken, nextRawRefreshToken, nextToken.getExpiresAt());
    }

    @Transactional
    public void logout(AuthenticatedUser authenticatedUser, String rawRefreshToken) {
        LocalDateTime now = LocalDateTime.now();
        if (authenticatedUser != null) {
            userSessionRepository.findBySessionUuid(authenticatedUser.sessionUuid())
                    .ifPresent(session -> {
                        session.setRevokedAt(now);
                        session.setRevokeReason("LOGOUT");
                    });
        }
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            refreshTokenRepository.findByTokenHash(refreshTokenService.hash(rawRefreshToken))
                    .ifPresent(token -> {
                        token.setRevokedAt(now);
                        token.setRevokeReason("LOGOUT");
                    });
        }
    }

    private RefreshToken createRefreshToken(
            User user,
            UserSession session,
            String rawToken,
            UUID tokenFamilyUuid,
            LocalDateTime now) {
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setUserSession(session);
        token.setTokenHash(refreshTokenService.hash(rawToken));
        token.setTokenFamilyUuid(tokenFamilyUuid);
        token.setExpiresAt(now.plus(securityProperties.refreshTokenTtl()));
        return token;
    }

    private ClientApplication activeClientApplication(String clientCode) {
        ClientApplication clientApplication = clientApplicationRepository.findByClientCodeIgnoreCase(clientCode)
                .orElseThrow(() -> new BadRequestException("Unknown client application."));
        if (!Boolean.TRUE.equals(clientApplication.getActive())) {
            throw new BadRequestException("Client application is not active.");
        }
        return clientApplication;
    }

    private UserDevice authorizedDevice(User user, UUID deviceUuid, ClientApplication clientApplication) {
        if (deviceUuid == null) {
            throw new BadRequestException("Mobile login requires a device UUID.");
        }
        UserDevice userDevice = userDeviceRepository.findByDeviceUuid(deviceUuid)
                .orElseThrow(() -> new BadRequestException("Device is not authorized."));
        if (!userDevice.getUser().getUserId().equals(user.getUserId())
                || !userDevice.getClientApplication().getClientApplicationId().equals(clientApplication.getClientApplicationId())
                || !Short.valueOf(UserDevice.AUTHORIZED).equals(userDevice.getAuthorizationStatus())) {
            throw new BadRequestException("Device is not authorized.");
        }
        return userDevice;
    }

    private void logAttempt(
            String identifier,
            User user,
            UUID deviceUuid,
            boolean success,
            String failureReason,
            String ipAddress,
            String userAgent,
            ClientApplication clientApplication) {
        LoginAttempt attempt = new LoginAttempt();
        attempt.setUsernameOrEmail(identifier);
        attempt.setUser(user);
        attempt.setDeviceUuid(deviceUuid);
        attempt.setSuccess(success);
        attempt.setFailureReason(failureReason);
        attempt.setIpAddress(ipAddress);
        attempt.setUserAgent(userAgent);
        attempt.setClientApplication(clientApplication);
        loginAttemptRepository.save(attempt);
    }

    private BadCredentialsException invalidCredentials() {
        return new BadCredentialsException("Invalid username/email or password.");
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor;
        }
        return request.getRemoteAddr();
    }

    private void revokeSession(UserSession session, String reason) {
        session.setRevokedAt(LocalDateTime.now());
        session.setRevokeReason(reason);
    }

    private AuthResponse response(
            User user,
            List<String> roles,
            List<String> permissions,
            GeneratedAccessToken accessToken,
            String refreshToken,
            LocalDateTime refreshTokenExpiresAt) {
        return new AuthResponse(
                "Bearer",
                accessToken.token(),
                refreshToken,
                accessToken.expiresAt(),
                refreshTokenExpiresAt,
                new AuthUserResponse(
                        user.getUserId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getStatus().getStatusCode()),
                roles,
                permissions);
    }
}




