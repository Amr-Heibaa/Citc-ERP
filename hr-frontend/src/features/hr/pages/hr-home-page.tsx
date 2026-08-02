import {
  Building2,
  GitBranch,
  LayoutGrid,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router";
import { EmployeeBanner } from '@/features/hr/components/employee-banner'
type HrCard = {
  label: string;
  icon: typeof UserPlus;
  to?: string;
  disabled?: boolean;
};

const cards: HrCard[] = [
  { label: "Employees", icon: UserPlus, to: "/hr/employees" },
  { label: "Organization", icon: Building2, to: "/hr/organizations" },
{ label: 'Departments', icon: LayoutGrid, to: '/hr/departments' },
  { label: "Hiring Stage", icon: UserCheck, disabled: true },
  { label: "Permission for rest allowance", icon: GitBranch, disabled: true },
];

export function HrHomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <EmployeeBanner />

      <div className="rounded-xl bg-white p-5 md:p-8">
        <h2 className="mb-6 text-center font-['Space_Grotesk',sans-serif] text-[18px] font-bold text-[#1a2535]">
          HR
        </h2>


        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <button
              key={card.label}
              disabled={card.disabled}
              onClick={() => card.to && navigate(card.to)}
              className="flex h-[150px] flex-col items-center justify-center gap-3 rounded-xl border border-[#e5e7eb] bg-[#f4f6f9] p-4 transition-all enabled:cursor-pointer enabled:hover:-translate-y-0.5 enabled:hover:border-[#f5841f]/50 enabled:hover:bg-[#f5841f]/5 enabled:hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-white shadow-sm">
                <card.icon size={24} className="text-[#1a2535]" />
              </div>
              <p className="text-center font-['Inter',sans-serif] text-[13px] font-semibold leading-tight text-[#1a2535]">
                {card.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
