import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useEmployees } from "@/features/hr/employees/api/use-employees";
import {
  NO_WORK_LOCATION_ID,
  useEmployeesFiltersStore,
} from "@/features/hr/employees/store/employees-filters-store";

import { useWorkLocations } from "@/lib/api/generated/ems/reference-controller/reference-controller";

import type {
  EmployeeSummary,
  WorkLocationRef,
} from "@/lib/api/generated/model";

const NO_EMPLOYEES: EmployeeSummary[] = [];
const NO_LOCATIONS: WorkLocationRef[] = [];

type GroupCode =
  | "HQ_CSO"
  | "HQ_MAADI"
  | "CENTERS"
  | "OTHER";

type LocationRow = {
  id: number;
  code: string;
  name: string;
  count: number;
};

function getGroup(code: string): GroupCode {
  if (code === "HQ_CSO") {
    return "HQ_CSO";
  }

  if (code === "HQ_MAADI") {
    return "HQ_MAADI";
  }

  if (
    code === "CARD_PRODUCTION_CENTER" ||
    code.startsWith("CSC_") ||
    code.startsWith("ISS_")
  ) {
    return "CENTERS";
  }

  return "OTHER";
}

export function EmployeesBreakdownCard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [expandedGroup, setExpandedGroup] =
    useState<"CENTERS" | "OTHER" | null>(null);

  const employeesQuery = useEmployees();

  const workLocationsQuery = useWorkLocations();

  const setBranchFilter = useEmployeesFiltersStore(
    (state) => state.setBranchFilter,
  );

  const employees =
    employeesQuery.data ?? NO_EMPLOYEES;
    

  const workLocations =
    workLocationsQuery.data ?? NO_LOCATIONS;

  const isLoading =
    employeesQuery.isLoading ||
    workLocationsQuery.isLoading;

  const isArabic =
    i18n.language.toLowerCase().startsWith("ar");

  /*
   * IMPORTANT:
   * Current employee = no termination date.
   *
   * This prevents the old terminated employee
   * from being counted in Dashboard totals.
   */
  const currentEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const status =
        employee.statusCode?.toUpperCase();

      return (
        !employee.terminationDate &&
        status !== "TERMINATED"
      );
    });
  }, [employees]);

  const total = currentEmployees.length;

  /*
   * Convert employee data into:
   *
   * Work Location ID
   * Work Location Code
   * Work Location Name
   * Employee Count
   */
  const locations = useMemo<LocationRow[]>(() => {
    const refsById = new Map<
      number,
      WorkLocationRef
    >();

    workLocations.forEach((location) => {
      if (location.id != null) {
        refsById.set(location.id, location);
      }
    });

    const countByLocation = new Map<
      number,
      LocationRow
    >();

    let unassignedCount = 0;

    currentEmployees.forEach((employee) => {
      if (employee.workLocationId == null) {
        unassignedCount += 1;
        return;
      }

      const reference = refsById.get(
        employee.workLocationId,
      );

      const existing = countByLocation.get(
        employee.workLocationId,
      );

      if (existing) {
        existing.count += 1;
        return;
      }

      const name =
        employee.workLocationName ??
        (isArabic
          ? reference?.nameAr
          : reference?.name) ??
        reference?.nameAr ??
        reference?.name ??
        t("dashboard.otherLocation");

      countByLocation.set(
        employee.workLocationId,
        {
          id: employee.workLocationId,
          code: reference?.code ?? "OTHER",
          name,
          count: 1,
        },
      );
    });

    const result = [
      ...countByLocation.values(),
    ].sort((a, b) => b.count - a.count);

    if (unassignedCount > 0) {
      result.push({
        id: NO_WORK_LOCATION_ID,
        code: "UNASSIGNED",
        name: isArabic
          ? "غير محدد"
          : "Unassigned",
        count: unassignedCount,
      });
    }

    return result;
  }, [
    currentEmployees,
    workLocations,
    isArabic,
    t,
  ]);

  /*
   * Main Dashboard groups
   */
  const breakdown = useMemo(() => {
    const cso =
      locations.find(
        (location) =>
          getGroup(location.code) === "HQ_CSO",
      ) ?? null;

    const maadi =
      locations.find(
        (location) =>
          getGroup(location.code) ===
          "HQ_MAADI",
      ) ?? null;

    const centers = locations
      .filter(
        (location) =>
          getGroup(location.code) ===
          "CENTERS",
      )
      .sort((a, b) => b.count - a.count);

    const other = locations
      .filter(
        (location) =>
          getGroup(location.code) === "OTHER",
      )
      .sort((a, b) => b.count - a.count);

    return {
      cso,
      maadi,
      centers,
      other,

      centersCount: centers.reduce(
        (sum, location) =>
          sum + location.count,
        0,
      ),

      otherCount: other.reduce(
        (sum, location) =>
          sum + location.count,
        0,
      ),
    };
  }, [locations]);

  function handleLocationClick(
    location: LocationRow,
  ) {
    setBranchFilter(
      location.id,
      location.name,
    );

    navigate("/hr/employees");
  }

  function toggleGroup(
    group: "CENTERS" | "OTHER",
  ) {
    setExpandedGroup((current) =>
      current === group ? null : group,
    );
  }

  const expandedLocations =
    expandedGroup === "CENTERS"
      ? breakdown.centers
      : expandedGroup === "OTHER"
        ? breakdown.other
        : [];

  return (
    <div className="flex flex-1 flex-col gap-4 rounded-[12px] bg-white p-5 shadow-[0px_4px_6px_rgba(0,0,0,0.05)]">
      {/* Total employees */}
      <button
        type="button"
        onClick={() =>
          navigate("/hr/employees")
        }
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-[20px]"
            style={{
              backgroundColor: "#f5841f21",
            }}
          >
            <Users
              size={20}
              strokeWidth={2}
              style={{
                color: "#f5841f",
              }}
            />
          </div>

          <div>
            <p className="font-['Inter',sans-serif] text-[14px] font-medium text-[#6b7280]">
              {t(
                "dashboard.totalEmployees",
              )}
            </p>

            <p className="mt-0.5 font-['Inter',sans-serif] text-[11px] text-[#9ca3af]">
              {isArabic
                ? "عدد الموظفين الحاليين"
                : "Current employees"}
            </p>
          </div>
        </div>

        <p className="font-['Space_Grotesk',sans-serif] text-[28px] font-bold text-[#1a2535]">
          {isLoading ? "—" : total}
        </p>
      </button>

      {!isLoading && (
        <>
          {/* Main 4 groups */}
          <div className="grid grid-cols-1 gap-2 border-t border-gray-100 pt-3 sm:grid-cols-2">
            {/* Civil Status HQ */}
            <button
              type="button"
              disabled={!breakdown.cso}
              onClick={() => {
                if (breakdown.cso) {
                  handleLocationClick(
                    breakdown.cso,
                  );
                }
              }}
              className="group flex items-center justify-between rounded-xl bg-[#f7f8fa] px-4 py-3 text-left transition hover:bg-[#f5841f]/5 disabled:cursor-default disabled:opacity-50"
            >
              <div>
                <p className="font-['Inter',sans-serif] text-[13px] text-[#6b7280]">
                  {isArabic
                    ? "مقر الشركة بالأحوال"
                    : "Civil Status HQ"}
                </p>

                <p className="mt-1 font-['Space_Grotesk',sans-serif] text-[20px] font-bold text-[#1a2535]">
                  {breakdown.cso?.count ?? 0}
                </p>
              </div>

              <ChevronRight
                size={18}
                className="text-gray-400 transition group-hover:text-[#f5841f]"
              />
            </button>

            {/* Maadi HQ */}
            <button
              type="button"
              disabled={!breakdown.maadi}
              onClick={() => {
                if (breakdown.maadi) {
                  handleLocationClick(
                    breakdown.maadi,
                  );
                }
              }}
              className="group flex items-center justify-between rounded-xl bg-[#f7f8fa] px-4 py-3 text-left transition hover:bg-[#f5841f]/5 disabled:cursor-default disabled:opacity-50"
            >
              <div>
                <p className="font-['Inter',sans-serif] text-[13px] text-[#6b7280]">
                  {isArabic
                    ? "المقر الإداري بالمعادي"
                    : "Maadi HQ"}
                </p>

                <p className="mt-1 font-['Space_Grotesk',sans-serif] text-[20px] font-bold text-[#1a2535]">
                  {breakdown.maadi?.count ??
                    0}
                </p>
              </div>

              <ChevronRight
                size={18}
                className="text-gray-400 transition group-hover:text-[#f5841f]"
              />
            </button>

            {/* Centers */}
            <button
              type="button"
              onClick={() =>
                toggleGroup("CENTERS")
              }
              className="group flex items-center justify-between rounded-xl bg-[#f7f8fa] px-4 py-3 text-left transition hover:bg-[#f5841f]/5"
            >
              <div>
                <p className="font-['Inter',sans-serif] text-[13px] text-[#6b7280]">
                  {isArabic
                    ? "المراكز"
                    : "Centers"}
                </p>

                <p className="mt-1 font-['Space_Grotesk',sans-serif] text-[20px] font-bold text-[#1a2535]">
                  {breakdown.centersCount}
                </p>
              </div>

              {expandedGroup ===
              "CENTERS" ? (
                <ChevronDown
                  size={18}
                  className="text-[#f5841f]"
                />
              ) : (
                <ChevronRight
                  size={18}
                  className="text-gray-400 transition group-hover:text-[#f5841f]"
                />
              )}
            </button>

            {/* Other */}
            <button
              type="button"
              onClick={() =>
                toggleGroup("OTHER")
              }
              className="group flex items-center justify-between rounded-xl bg-[#f7f8fa] px-4 py-3 text-left transition hover:bg-[#f5841f]/5"
            >
              <div>
                <p className="font-['Inter',sans-serif] text-[13px] text-[#6b7280]">
                  {isArabic
                    ? "أخرى"
                    : "Other"}
                </p>

                <p className="mt-1 font-['Space_Grotesk',sans-serif] text-[20px] font-bold text-[#1a2535]">
                  {breakdown.otherCount}
                </p>
              </div>

              {expandedGroup ===
              "OTHER" ? (
                <ChevronDown
                  size={18}
                  className="text-[#f5841f]"
                />
              ) : (
                <ChevronRight
                  size={18}
                  className="text-gray-400 transition group-hover:text-[#f5841f]"
                />
              )}
            </button>
          </div>

          {/* Expanded Centers / Other */}
          {expandedGroup &&
            expandedLocations.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <div className="flex items-center justify-between bg-[#f4f6f9] px-4 py-2">
                  <p className="font-['Inter',sans-serif] text-[12px] font-semibold text-[#6b7280]">
                    {expandedGroup ===
                    "CENTERS"
                      ? isArabic
                        ? "تفاصيل المراكز"
                        : "Centers Details"
                      : isArabic
                        ? "المواقع الأخرى"
                        : "Other Locations"}
                  </p>

                  <p className="font-['Inter',sans-serif] text-[11px] text-gray-400">
                    {expandedLocations.length}{" "}
                    {isArabic
                      ? "موقع"
                      : "locations"}
                  </p>
                </div>

                <div className="max-h-[250px] divide-y divide-gray-100 overflow-y-auto">
                  {expandedLocations.map(
                    (location) => (
                      <button
                        key={location.id}
                        type="button"
                        onClick={() =>
                          handleLocationClick(
                            location,
                          )
                        }
                        className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[#f5841f]/5"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <MapPin
                            size={15}
                            className="shrink-0 text-[#f5841f]"
                          />

                          <span className="truncate font-['Inter',sans-serif] text-[13px] text-[#1a2535]">
                            {location.name}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <span className="font-['Inter',sans-serif] text-[13px] font-semibold text-[#1a2535]">
                            {location.count}
                          </span>

                          <ChevronRight
                            size={15}
                            className="text-gray-300 transition group-hover:text-[#f5841f]"
                          />
                        </div>
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
        </>
      )}
    </div>
  );
}