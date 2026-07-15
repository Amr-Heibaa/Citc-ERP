package com.citec.ems.iam.security;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AccessTokenClaims(
        Long userId,
        String username,
        UUID sessionUuid,
        Instant expiresAt,
        List<String> roles,
        List<String> permissions) {
}



