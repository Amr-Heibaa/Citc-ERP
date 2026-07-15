package com.citec.ems.iam.security;

import com.citec.ems.iam.domain.UserSession;
import com.citec.ems.iam.infrastructure.UserSessionRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class AccessTokenAuthenticationFilter extends OncePerRequestFilter {

    private final AccessTokenService accessTokenService;
    private final UserSessionRepository userSessionRepository;

    public AccessTokenAuthenticationFilter(
            AccessTokenService accessTokenService,
            UserSessionRepository userSessionRepository) {
        this.accessTokenService = accessTokenService;
        this.userSessionRepository = userSessionRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            AccessTokenClaims claims = accessTokenService.parse(header.substring(7));
            UserSession session = userSessionRepository.findBySessionUuid(claims.sessionUuid()).orElse(null);
            if (session != null
                    && session.getRevokedAt() == null
                    && session.getExpiresAt().isAfter(LocalDateTime.now())
                    && SecurityContextHolder.getContext().getAuthentication() == null) {
                AuthenticatedUser principal = new AuthenticatedUser(
                        claims.userId(),
                        claims.username(),
                        claims.sessionUuid(),
                        claims.roles(),
                        claims.permissions());
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        authorities(claims.roles(), claims.permissions()));
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (RuntimeException ex) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private List<SimpleGrantedAuthority> authorities(List<String> roles, List<String> permissions) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        roles.forEach(role -> authorities.add(new SimpleGrantedAuthority("ROLE_" + role)));
        permissions.forEach(permission -> authorities.add(new SimpleGrantedAuthority("PERMISSION_" + permission)));
        return authorities;
    }
}



