package com.citec.ems.iam.web;


import com.citec.ems.iam.application.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class IamDtos {

    private IamDtos() {
    }

    public record LoginRequest(
            @NotBlank String usernameOrEmail,
            @NotBlank String password,
            String clientCode,
            String applicationCode,
            UUID deviceUuid) {
    }

    public record RefreshRequest(@NotBlank String refreshToken) {
    }

    public record LogoutRequest(String refreshToken) {
    }

    public record AuthResponse(
            String tokenType,
            String accessToken,
            String refreshToken,
            LocalDateTime accessTokenExpiresAt,
            LocalDateTime refreshTokenExpiresAt,
            AuthUserResponse user,
            List<String> roles,
            List<String> permissions) {
    }

    public record AuthUserResponse(Long userId, String username, String email, String statusCode) {
    }

    public record UserSummary(
            Long userId,
            String username,
            String email,
            String statusCode,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record UserCreateRequest(
            @NotBlank @Size(max = 50) String username,
            @NotBlank @Email @Size(max = 255) String email,
            @NotBlank @Size(min = 8, max = 128) String password,
            Short userStatusId) {
    }

    public record UserRoleAssignRequest(
            @NotNull Long roleId,
            LocalDate startDate,
            LocalDate endDate,
            Long assignedByUserId) {
    }

    public record RoleResponse(Long roleId, String roleCode, String roleName, String description, Boolean active) {
    }

    public record RoleCreateRequest(
            @NotBlank @Size(max = 50) String roleCode,
            @NotBlank @Size(max = 100) String roleName,
            @Size(max = 255) String description,
            Boolean active) {
    }

    public record PermissionResponse(
            Long permissionId,
            Integer applicationModuleId,
            String permissionCode,
            String permissionName,
            String description,
            Boolean active) {
    }

    public record PermissionCreateRequest(
            Integer applicationModuleId,
            @NotBlank @Size(max = 100) String permissionCode,
            @NotBlank @Size(max = 255) String permissionName,
            @Size(max = 255) String description,
            Boolean active) {
    }

    public record RolePermissionGrantRequest(
            @NotNull Long permissionId,
            LocalDate startDate,
            LocalDate endDate,
            Boolean allowed,
            Boolean active,
            Long grantedByUserId) {
    }

    public record UserDetail(
            Long userId,
            String username,
            String email,
            String statusCode,
            List<String> roles,
            List<String> permissions,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record LoginIpRuleCreateRequest(
            @NotNull Long userId,
            Integer applicationModuleId,
            String ipAddress,
            String ipRange,
            @NotNull Short ruleType,
            Boolean active,
            LocalDate startDate,
            LocalDate endDate) {
    }

    public record DeviceRegisterRequest(
            @NotNull Long userId,
            @NotNull Short clientApplicationId,
            @NotNull UUID deviceUuid,
            String deviceName,
            String platform,
            String osVersion,
            String appVersion,
            String pushToken,
            String deviceFingerprintHash) {
    }
}




