export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB");
}

export function formatDuration(startDate: string | null | undefined): string {
  if (!startDate) {
    return "—";
  }

  const start = new Date(startDate);

  if (Number.isNaN(start.getTime())) {
    return "—";
  }

  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();

  if (now.getDate() < start.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years <= 0 && months <= 0) {
    return "Less than a month";
  }

  const parts: string[] = [];

  if (years > 0) {
    parts.push(`${years} Year${years === 1 ? "" : "s"}`);
  }

  if (months > 0) {
    parts.push(`${months} Month${months === 1 ? "" : "s"}`);
  }

  return parts.join(", ");
}

export function ageFromBirthDate(
  birthDate: string | null | undefined,
  asOf: Date = new Date(),
): number | null {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  let age = asOf.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    asOf.getMonth() > birth.getMonth() ||
    (asOf.getMonth() === birth.getMonth() && asOf.getDate() >= birth.getDate());

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  return age;
}

export function initials(name: string | null | undefined): string {
  if (!name) {
    return "NA";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
