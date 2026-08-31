import { FileBarChart2, Settings, ShieldCheck, UserPlus, Users, UserX } from "lucide-react";
import { useNavigate } from "react-router";

import { StatCard } from "@/features/dashboard/components/stat-card";
import { formatDate } from "@/features/hr/shared/utils/format";
import { useUserStore } from "@/stores/user-store";
import { useListEmployees, useListDeletedEmployees } from "@/lib/api/generated/ems/employee-controller/employee-controller";
import { useListGrants } from "@/lib/api/generated/ems/hr-access-controller/hr-access-controller";
import { useListHistory } from "@/lib/api/generated/ems/hr-settings-controller/hr-settings-controller";

const today = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const quickActions = [
  { id: "add-employee", label: "Add Employee", icon: UserPlus, to: "/hr/employees/new" },
  { id: "grant-access", label: "Grant HR Access", icon: ShieldCheck, to: "/hr/settings/access-delegation" },
  { id: "reports", label: "HR Reports", icon: FileBarChart2, to: "/hr/reports" },
  { id: "settings", label: "HR Settings", icon: Settings, to: "/hr/settings" },
];

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const username = useUserStore((s) => s.user?.username);

  const employees = useListEmployees();
  const deletedEmployees = useListDeletedEmployees();
  const grants = useListGrants();
  const history = useListHistory({ size: 5 });

  const activeGrants = (grants.data ?? []).filter((grant) => grant.effective).length;
  const recentEvents = history.data?.content ?? [];

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Welcome banner */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{ backgroundImage: "linear-gradient(174deg, #1a2535 25%, #243347 75%)" }}
      >
        <div className="pointer-events-none absolute -left-12 -top-12 size-[200px] opacity-5">
          <svg viewBox="0 0 200 200" fill="none">
            <path
              d="M10 10 L190 10 M10 50 L190 50 M10 90 L190 90 M10 130 L190 130 M10 170 L190 170 M10 10 L10 190 M50 10 L50 190 M90 10 L90 190 M130 10 L130 190 M170 10 L170 190"
              stroke="#F5841F"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="flex flex-col items-start justify-between gap-3 px-5 py-5 sm:flex-row sm:items-center md:h-[120px] md:px-8 md:py-0">
          <div className="flex flex-col gap-1">
            <p className="font-['Inter',sans-serif] text-[20px] font-bold text-white md:text-[28px]">
              {username ?? "Admin"}
            </p>
            <p className="font-['Inter',sans-serif] text-[13px] text-[#a4aab6] md:text-[15px]">
              Admin Control Center
            </p>
          </div>
          <p className="hidden font-['Inter',sans-serif] text-[13px] text-white md:block md:text-[20px]">
            {today}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
        <StatCard
          label="Total Employees"
          value={employees.isLoading ? "—" : String((employees.data ?? []).length)}
          color="#f5841f"
          icon={Users}
          onClick={() => navigate("/hr/employees")}
        />

        <StatCard
          label="Active HR Delegations"
          value={grants.isLoading ? "—" : String(activeGrants)}
          color="#2ecc71"
          icon={ShieldCheck}
          onClick={() => navigate("/hr/settings/access-delegation")}
        />

        <StatCard
          label="Deleted Employees"
          value={deletedEmployees.isLoading ? "—" : String((deletedEmployees.data ?? []).length)}
          color="#e74c3c"
          icon={UserX}
          onClick={() => navigate("/hr/employees/deleted")}
        />
      </div>

      {/* Recent Activity */}
      <div className="flex flex-col gap-4 rounded-xl bg-white p-4 md:p-6">
        <div className="flex items-center justify-between">
          <p className="font-['Inter',sans-serif] text-[16px] font-bold text-[#1a2535] md:text-[18px]">
            Recent HR Activity
          </p>

          <button
            type="button"
            onClick={() => navigate("/hr/settings/history")}
            className="font-['Inter',sans-serif] text-sm font-medium text-[#f5841f] hover:underline"
          >
            View All
          </button>
        </div>

        {history.isLoading ? (
          <p className="font-['Inter',sans-serif] text-sm text-gray-400">Loading activity…</p>
        ) : recentEvents.length === 0 ? (
          <p className="font-['Inter',sans-serif] text-sm text-gray-400">No recent HR activity.</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {recentEvents.map((event) => (
              <div key={event.hrSettingEventId} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-['Inter',sans-serif] text-sm text-[#1a2535]">
                    <span className="font-semibold">{event.performedByName ?? "System"}</span>{" "}
                    {event.description}
                  </p>
                  <p className="font-['Inter',sans-serif] text-xs text-gray-400">
                    {formatDate(event.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-col gap-5 rounded-xl bg-white p-4 md:gap-8 md:p-6">
        <p className="font-['Inter',sans-serif] text-[16px] font-bold text-[#1a2535] md:text-[18px]">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => navigate(action.to)}
              className="flex h-[130px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-[#e5e7eb] bg-[#f4f6f9] p-4 transition-all hover:-translate-y-0.5 hover:border-[#f5841f]/50 hover:bg-[#f5841f]/5 hover:shadow-sm md:h-[152px]"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm md:size-11">
                <action.icon size={24} className="text-[#1a2535]" />
              </div>
              <p className="text-center font-['Inter',sans-serif] text-[12px] font-semibold leading-tight text-[#1a2535] md:text-[13px]">
                {action.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
