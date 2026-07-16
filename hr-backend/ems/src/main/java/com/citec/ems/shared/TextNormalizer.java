package com.citec.ems.shared;

/**
 * Normalizes user-supplied text BEFORE validation and persistence.
 *
 * The golden rule: normalize first, then validate, then save the SAME value.
 * Never validate the raw request and save a transformed value — that lets
 * " hr01 " pass a duplicate check and get stored as "HR01".
 */
public final class TextNormalizer {

    private TextNormalizer() {
    }

    /** Trims and upper-cases a code (e.g. " hr01 " -> "HR01"). Null-safe. */
    public static String code(String value) {
        String trimmed = trim(value);
        return trimmed == null ? null : trimmed.toUpperCase();
    }

    /** Trims and lower-cases an email (e.g. " Admin@X.COM " -> "admin@x.com"). Null-safe. */
    public static String email(String value) {
        String trimmed = trim(value);
        return trimmed == null ? null : trimmed.toLowerCase();
    }

    /** Trims a plain text value, collapsing blank strings to null. Null-safe. */
    public static String trim(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}