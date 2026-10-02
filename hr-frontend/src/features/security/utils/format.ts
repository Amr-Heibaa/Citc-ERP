const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "lastLoginAt" -> "Last login at", "ip_address" -> "Ip address". */
export function humanizeKey(key: string): string {
  const words = key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
}

// Never render credential material, whatever an endpoint happens to return.
const SENSITIVE_KEY = /pass(word)?|hash|secret|token|credential/i;

export function isDisplayableKey(key: string): boolean {
  return !SENSITIVE_KEY.test(key);
}

export function formatScalar(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return ISO_DATE_TIME.test(value) ? formatDateTime(value) : value;
  if (typeof value === "number") return value.toLocaleString("en-US");
  if (typeof value === "boolean") return value ? "✓" : "✗";
  return "—";
}

export function isScalar(value: unknown): boolean {
  return value === null || ["string", "number", "boolean", "undefined"].includes(typeof value);
}
