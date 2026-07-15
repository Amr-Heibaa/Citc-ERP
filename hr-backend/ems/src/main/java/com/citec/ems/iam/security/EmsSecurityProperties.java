package com.citec.ems.iam.security;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ems.security")
public record EmsSecurityProperties(
        String tokenSecret,
        Duration accessTokenTtl,
        Duration refreshTokenTtl) {

    public EmsSecurityProperties {
        if (tokenSecret == null || tokenSecret.isBlank()) {
            tokenSecret = "change-this-local-development-secret-before-production";
        }
        if (accessTokenTtl == null) {
            accessTokenTtl = Duration.ofMinutes(15);
        }
        if (refreshTokenTtl == null) {
            refreshTokenTtl = Duration.ofDays(7);
        }
    }
}



