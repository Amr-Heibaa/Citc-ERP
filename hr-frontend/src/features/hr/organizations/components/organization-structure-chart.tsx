import type {
  OrganizationTree,
  OrganizationUnitTreeNode,
} from "@/lib/api/generated/model";

function ChartUnit({
  unit,
}: {
  unit: OrganizationUnitTreeNode;
}) {
  const children = unit.children ?? [];

  return (
    <div className="flex min-w-max flex-col items-center">
      <div className="min-w-36 rounded-lg border border-sky-300 bg-sky-100 px-4 py-3 text-center">
        <p className="font-['Inter',sans-serif] text-sm font-medium text-sky-700">
          {unit.name ?? unit.code ?? "Unnamed unit"}
        </p>

        {unit.type && (
          <p className="mt-0.5 font-['Inter',sans-serif] text-[11px] text-sky-500">
            {unit.type}
          </p>
        )}
      </div>

      {children.length > 0 && (
        <>
          <div className="h-6 w-px bg-gray-300" />

          <div className="relative flex items-start gap-6 border-t border-gray-300 pt-6">
            {children.map((child, index) => (
              <div
                key={`${child.id ?? child.code ?? "unit"}-${index}`}
                className="relative"
              >
                <div className="absolute -top-6 left-1/2 h-6 w-px -translate-x-1/2 bg-gray-300" />

                <ChartUnit unit={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function OrganizationStructureChart({
  tree,
}: {
  tree: OrganizationTree;
}) {
  const units = tree.units ?? [];

  return (
    <div className="min-h-[390px] overflow-auto rounded-xl border border-gray-100 bg-white p-6">
      <div className="flex min-w-max flex-col items-center">
        <div className="min-w-72 rounded-lg border border-sky-400 bg-sky-100 px-6 py-4 text-center">
          <p className="font-['Inter',sans-serif] text-sm font-semibold text-sky-700">
            {tree.nameEn ?? tree.code ?? "Organization"}
          </p>

          {tree.nameAr && (
            <p
              dir="rtl"
              className="mt-1 font-['Inter',sans-serif] text-xs text-sky-500"
            >
              {tree.nameAr}
            </p>
          )}
        </div>

        {units.length > 0 && (
          <>
            <div className="h-8 w-px bg-gray-300" />

            <div className="relative flex items-start gap-8 border-t border-gray-300 pt-8">
              {units.map((unit, index) => (
                <div
                  key={`${unit.id ?? unit.code ?? "unit"}-${index}`}
                  className="relative"
                >
                  <div className="absolute -top-8 left-1/2 h-8 w-px -translate-x-1/2 bg-gray-300" />

                  <ChartUnit unit={unit} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {units.length === 0 && (
        <div className="flex h-64 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
          No organization units have been added.
        </div>
      )}
    </div>
  );
}