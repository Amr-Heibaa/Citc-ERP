package com.citec.ems.iam.web;


import com.citec.ems.iam.application.*;
import com.citec.ems.iam.web.IamDtos.AuthResponse;
import com.citec.ems.iam.web.IamDtos.LoginRequest;
import com.citec.ems.iam.web.IamDtos.LogoutRequest;
import com.citec.ems.iam.web.IamDtos.RefreshRequest;
import com.citec.ems.iam.security.AuthenticatedUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        return authService.login(request, servletRequest);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return authService.refresh(request.refreshToken());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestBody(required = false) LogoutRequest request) {
        authService.logout(authenticatedUser, request == null ? null : request.refreshToken());
    }
}




