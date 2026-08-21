import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  TERMINATED: "bg-red-100 text-red-700",
  ON_LEAVE: "bg-amber-100 text-amber-700",
};

export function EmployeeStatusBadge({
  code,
  label,
  className,
}: {
  code?: string | null;
  label?: string | null;
  className?: string;
}) {
  const styles = (code && STATUS_STYLES[code]) || "bg-gray-200 text-gray-600";

  return (
    <Badge className={`border-0 ${styles} ${className ?? ""}`}>
      {label ?? code ?? "—"}
    </Badge>
  );
}
