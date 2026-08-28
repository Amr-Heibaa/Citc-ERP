import { Users, FileText, Briefcase, Settings, Building2, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useMyEmployee } from "@/features/hr/employees/api/use-employees";
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
    to: "/hr/organizations",
  },
  {
    id: "jobs",
    label: "Jobs",
    icon: <Briefcase size={24} className="text-[#1a2535]" />,
    to: "/hr/jobs",
  },
  {
    id: "employment",
    label: "Employment",
    icon: <FileText size={24} className="text-[#1a2535]" />,
    to: "/hr/employment",
  },
  {
    id: "hr-settings",
    label: "HR Settings",
    icon: <Settings size={24} className="text-[#1a2535]" />,
    to: "/hr/settings",
  },
  {
    id: "reports",
    label: "Reports",
    icon: <BarChart2 size={24} className="text-[#1a2535]" />,
    to: "/hr/reports",
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

  const displayName =
    me?.displayName ??
    "User";

  const department =
    me?.currentOrgUnitName ??
    "";

  const employeeNumber =
    me?.employeeNumber ??
    "—";

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Welcome Banner */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{ backgroundImage: 'linear-gradient(174deg, #1a2535 25%, #243347 75%)' }}
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
              {displayName}
            </p>
            <p className="font-['Inter',sans-serif] text-[13px] text-[#a4aab6] md:text-[15px]">
              {department}
            </p>
          </div>
          <p className="hidden font-['Inter',sans-serif] text-[13px] text-white md:block md:text-[20px]">
            {today}
          </p>
          <div className="relative hidden sm:block">
            <div className="flex">
              <div className="size-16 rounded-full bg-[#f5841f]/20 md:size-20" />
              <div className="-ml-8 size-16 rounded-full bg-[#2ecc71]/20 md:-ml-10 md:size-20" />
            </div>
            <p className="absolute inset-0 flex items-center justify-center font-['Inter',sans-serif] text-[14px] font-bold text-white md:text-[16px]">
              {employeeNumber}
            </p>
          </div>
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
