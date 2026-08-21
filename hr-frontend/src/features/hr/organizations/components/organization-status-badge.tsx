import { Badge } from "@/components/ui/badge";

export function OrganizationStatusBadge({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) {
  const isActive = status?.toLowerCase() !== "inactive";

  const styles = isActive
    ? "bg-emerald-100 text-emerald-700"
    : "bg-gray-200 text-gray-600";

  return (
    <Badge className={`border-0 ${styles} ${className ?? ""}`}>
      {status ?? (isActive ? "Active" : "Inactive")}
    </Badge>
  );
}
