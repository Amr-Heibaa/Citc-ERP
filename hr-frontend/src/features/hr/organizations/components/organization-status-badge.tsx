import { Badge } from "@/components/ui/badge";

export function OrganizationStatusBadge({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) {
  const normalized =
    status?.trim().toLowerCase();

  if (!normalized) {
    return (
      <Badge
        className={`border-0 bg-gray-100 text-gray-500 ${className ?? ""}`}
      >
        —
      </Badge>
    );
  }

  const active =
    normalized === "active";

  return (
    <Badge
      className={`border-0 ${
        active
          ? "bg-emerald-100 text-emerald-700"
          : "bg-gray-200 text-gray-600"
      } ${className ?? ""}`}
    >
      {status}
    </Badge>
  );
}