import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PROBATION: "bg-blue-100 text-blue-700",
  ON_LEAVE: "bg-amber-100 text-amber-700",
  TERMINATED: "bg-red-100 text-red-700",
  RESIGNED: "bg-red-100 text-red-700",
  RETIRED: "bg-gray-200 text-gray-600",
  CONTRACT_END: "bg-red-100 text-red-700",
  INACTIVE: "bg-gray-200 text-gray-600",
};

export function EmploymentStatusBadge({
  code,
  label,
}: {
  code?: string | null;
  label?: string | null;
}) {
  const styles = (code && STATUS_STYLES[code]) || "bg-gray-200 text-gray-600";

  return <Badge className={`border-0 ${styles}`}>{label ?? code ?? "—"}</Badge>;
}
