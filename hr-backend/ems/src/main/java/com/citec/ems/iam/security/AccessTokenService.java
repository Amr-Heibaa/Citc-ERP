package com.citec.ems.iam.security;

import com.citec.ems.iam.domain.User;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

@Service
public class AccessTokenService {

    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();
    private static final String HEADER = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";

    private final EmsSecurityProperties properties;

    public AccessTokenService(EmsSecurityProperties properties) {
        this.properties = properties;
    }

    public GeneratedAccessToken generate(
            User user,
            UUID sessionUuid,
            List<String> roles,
            List<String> permissions,
            LocalDateTime now) {
        Instant issuedAt = now.atZone(ZoneId.systemDefault()).toInstant();
        Instant expiresAt = issuedAt.plus(properties.accessTokenTtl());

        String payload = "{"
                + "\"sub\":" + user.getUserId()
                + ",\"username\":\"" + escape(user.getUsername()) + "\""
                + ",\"sid\":\"" + sessionUuid + "\""
                + ",\"iat\":" + issuedAt.getEpochSecond()
                + ",\"exp\":" + expiresAt.getEpochSecond()
                + ",\"roles\":" + jsonArray(roles)
                + ",\"permissions\":" + jsonArray(permissions)
                + "}";

        String unsignedToken = encode(HEADER) + "." + encode(payload);
        String signature = sign(unsignedToken);
        return new GeneratedAccessToken(unsignedToken + "." + signature, LocalDateTime.ofInstant(expiresAt, ZoneId.systemDefault()));
    }

    public AccessTokenClaims parse(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new BadCredentialsException("Invalid access token.");
        }

        String unsignedToken = parts[0] + "." + parts[1];
        if (!constantTimeEquals(sign(unsignedToken), parts[2])) {
            throw new BadCredentialsException("Invalid access token signature.");
        }

        try {
            String payload = new String(DECODER.decode(parts[1]), StandardCharsets.UTF_8);
            Instant expiresAt = Instant.ofEpochSecond(number(payload, "exp"));
            if (expiresAt.isBefore(Instant.now())) {
                throw new BadCredentialsException("Access token has expired.");
            }

            return new AccessTokenClaims(
                    number(payload, "sub"),
                    string(payload, "username"),
                    UUID.fromString(string(payload, "sid")),
                    expiresAt,
                    stringArray(payload, "roles"),
                    stringArray(payload, "permissions"));
        } catch (BadCredentialsException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadCredentialsException("Invalid access token.", ex);
        }
    }

    private String encode(String value) {
        return ENCODER.encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(properties.tokenSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return ENCODER.encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to sign access token.", ex);
        }
    }

    private boolean constantTimeEquals(String left, String right) {
        byte[] leftBytes = left.getBytes(StandardCharsets.UTF_8);
        byte[] rightBytes = right.getBytes(StandardCharsets.UTF_8);
        if (leftBytes.length != rightBytes.length) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < leftBytes.length; i++) {
            result |= leftBytes[i] ^ rightBytes[i];
        }
        return result == 0;
    }

    private String jsonArray(List<String> values) {
        return values.stream()
                .map(value -> "\"" + escape(value) + "\"")
                .collect(java.util.stream.Collectors.joining(",", "[", "]"));
    }

    private long number(String json, String field) {
        Matcher matcher = Pattern.compile("\"" + Pattern.quote(field) + "\"\\s*:\\s*(\\d+)").matcher(json);
        if (!matcher.find()) {
            throw new BadCredentialsException("Invalid access token payload.");
        }
        return Long.parseLong(matcher.group(1));
    }

    private String string(String json, String field) {
        Matcher matcher = Pattern.compile("\"" + Pattern.quote(field) + "\"\\s*:\\s*\"((?:\\\\.|[^\"])*)\"").matcher(json);
        if (!matcher.find()) {
            throw new BadCredentialsException("Invalid access token payload.");
        }
        return unescape(matcher.group(1));
    }

    private List<String> stringArray(String json, String field) {
        Matcher matcher = Pattern.compile("\"" + Pattern.quote(field) + "\"\\s*:\\s*\\[(.*?)]").matcher(json);
        if (!matcher.find()) {
            return List.of();
        }
        Matcher itemMatcher = Pattern.compile("\"((?:\\\\.|[^\"])*)\"").matcher(matcher.group(1));
        java.util.ArrayList<String> values = new java.util.ArrayList<>();
        while (itemMatcher.find()) {
            values.add(unescape(itemMatcher.group(1)));
        }
        return values;
    }

    private String escape(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String unescape(String value) {
        StringBuilder result = new StringBuilder(value.length());
        boolean escaped = false;
        for (int i = 0; i < value.length(); i++) {
            char current = value.charAt(i);
            if (escaped) {
                result.append(current);
                escaped = false;
            } else if (current == '\\') {
                escaped = true;
            } else {
                result.append(current);
            }
        }
        return result.toString();
    }

    public record GeneratedAccessToken(String token, LocalDateTime expiresAt) {
    }
}



