import { Layers, Users } from "lucide-react";
import { useNavigate } from "react-router";

import { useJobPositionStatistics } from "@/features/hr/jobs/api/use-job-positions";

export function JobsHomePage() {
  const navigate = useNavigate();
  const statistics = useJobPositionStatistics();

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
          Jobs
        </h1>

        <p className="mt-0.5 font-['Inter',sans-serif] text-sm text-gray-400">
          Manage job grades and organizational positions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate("/hr/jobs/positions")}
          className="flex flex-col items-start gap-3 rounded-xl border border-gray-100 bg-white p-5 text-left transition-shadow hover:shadow-md"
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#f5841f]/10">
            <Users className="size-5 text-[#f5841f]" />
          </div>

          <div>
            <p className="font-['Inter',sans-serif] text-base font-semibold text-[#1a2535]">
              Job Positions
            </p>

            <p className="mt-0.5 font-['Inter',sans-serif] text-sm text-gray-400">
              {statistics.isLoading
                ? "Loading…"
                : `${statistics.data?.totalPositions ?? 0} total · ${
                    statistics.data?.occupiedPositions ?? 0
                  } occupied · ${statistics.data?.openPositions ?? 0} open`}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("/hr/jobs/grades")}
          className="flex flex-col items-start gap-3 rounded-xl border border-gray-100 bg-white p-5 text-left transition-shadow hover:shadow-md"
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#f5841f]/10">
            <Layers className="size-5 text-[#f5841f]" />
          </div>

          <div>
            <p className="font-['Inter',sans-serif] text-base font-semibold text-[#1a2535]">
              Job Grades
            </p>

            <p className="mt-0.5 font-['Inter',sans-serif] text-sm text-gray-400">
              {statistics.isLoading
                ? "Loading…"
                : `${statistics.data?.activeGrades ?? 0} active grades`}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
