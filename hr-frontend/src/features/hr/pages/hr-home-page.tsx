import { Users, FileText, Briefcase, Settings, Building2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useMyEmployee } from "@/features/hr/api/use-employees";
type ModuleCard = {
  id: string;
  label: string;
  icon: React.ReactNode;
  to?: string;
};

const MODULES: ModuleCard[] = [
  {
    id: "employees",
    label: "Employees",
    icon: <Users size={24} className="text-[#1a2535]" />,
    to: "/hr/employees",
  },
  {
    id: "organization",
    label: "Organization",
    icon: <Building2 size={24} className="text-[#1a2535]" />,
  },
  {
    id: "jobs",
    label: "Jobs",
    icon: <Briefcase size={24} className="text-[#1a2535]" />,
  },
  {
    id: "employment",
    label: "Employment",
    icon: <FileText size={24} className="text-[#1a2535]" />,
  },
  {
    id: "hr-settings",
    label: "HR Settings",
    icon: <Settings size={24} className="text-[#1a2535]" />,
  },
];

const today = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function HrHomePage() {
  const navigate = useNavigate();
  const { data: me } = useMyEmployee();
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Welcome Banner */}
      <div
        className="relative h-[120px] overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(174deg, #1a2535 25%, #243347 75%)",
        }}
      >
        <div className="absolute left-0 top-0 opacity-5">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <path
              d="M0 50H200M0 100H200M0 150H200M50 0V200M100 0V200M150 0V200"
              stroke="#F5841F"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="flex h-full items-center justify-between px-8">
        <div>
            <p className="font-['Inter',sans-serif] text-2xl font-bold text-white">
              {me?.displayName ?? 'HR Portal'}
            </p>
            <p className="font-['Inter',sans-serif] text-[15px] text-[#a4aab6]">
              {me?.positionTitle ?? me?.currentOrgUnitName ?? 'Human Resources Management'}
            </p>
          </div>
          <p className="font-['Inter',sans-serif] text-xl text-white">
            {today}
          </p>
          {me?.employeeNumber && (
            <div className="flex size-16 items-center justify-center rounded-full bg-[#f5841f]/20">
              <span className="font-['Space_Grotesk',sans-serif] text-sm font-bold text-white">
                {me.employeeNumber}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Module Cards */}
      <div className="rounded-xl bg-white p-6">
        <h2 className="mb-8 text-center font-['Inter',sans-serif] text-[18px] font-bold text-[#1a2535]">
          HR
        </h2>
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
          {MODULES.map((mod) => (
            <button
              key={mod.id}
              disabled={!mod.to}
              onClick={() => mod.to && navigate(mod.to)}
              className="flex h-[152px] flex-col items-center justify-center gap-3 rounded-lg border border-[#e5e7eb] bg-[#f4f6f9] p-4 transition-colors enabled:hover:border-[#f5841f] enabled:hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-white shadow-sm">
                {mod.icon}
              </div>
              <p className="text-center font-['Inter',sans-serif] text-[13px] font-semibold text-[#1a2535]">
                {mod.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
