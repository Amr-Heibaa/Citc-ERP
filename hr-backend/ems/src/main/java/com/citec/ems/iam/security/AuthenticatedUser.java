package com.citec.ems.iam.security;

import java.util.List;
import java.util.UUID;

public record AuthenticatedUser(
        Long userId,
        String username,
        UUID sessionUuid,
        List<String> roles,
        List<String> permissions) {
}



