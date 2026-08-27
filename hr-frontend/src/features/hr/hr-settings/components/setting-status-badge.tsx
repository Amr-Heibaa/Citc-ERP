export function SettingStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-['Inter',sans-serif] text-xs font-medium ${
        active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
