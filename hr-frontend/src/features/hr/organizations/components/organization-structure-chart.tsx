import { Minus, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type {
  OrganizationTree,
  OrganizationUnitTreeNode,
} from "@/lib/api/generated/model";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.1;

function ChartUnit({
  unit,
}: {
  unit: OrganizationUnitTreeNode;
}) {
  const { t } = useTranslation();
  const children = unit.children ?? [];

  return (
    <div className="flex min-w-max flex-col items-center">
      <div className="min-w-36 rounded-[10px] border border-gray-200 bg-white px-4 py-3 text-center shadow-[0px_2px_4px_rgba(0,0,0,0.04)]">
        <p className="font-['Inter',sans-serif] text-sm font-medium text-[#1a2535]">
          {unit.name ?? unit.code ?? t("organizations.structure.chart.unnamedUnit")}
        </p>

        {unit.type && (
          <p className="mt-0.5 font-['Inter',sans-serif] text-[11px] text-[#f5841f]">
            {unit.type}
          </p>
        )}
      </div>

      {children.length > 0 && (
        <>
          <div className="h-6 w-px bg-gray-200" />

          <div className="relative flex items-start gap-6 border-t border-gray-200 pt-6">
            {children.map((child, index) => (
              <div
                key={`${child.id ?? child.code ?? "unit"}-${index}`}
                className="relative"
              >
                <div className="absolute -top-6 left-1/2 h-6 w-px -translate-x-1/2 bg-gray-200" />

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
  const { t } = useTranslation();
  const units = tree.units ?? [];
  const [zoom, setZoom] = useState(1);

  function zoomIn() {
    setZoom((value) => Math.min(MAX_ZOOM, Number((value + ZOOM_STEP).toFixed(2))));
  }

  function zoomOut() {
    setZoom((value) => Math.max(MIN_ZOOM, Number((value - ZOOM_STEP).toFixed(2))));
  }

  function resetZoom() {
    setZoom(1);
  }

  return (
    <div className="relative h-[600px] overflow-auto rounded-xl border border-gray-100 bg-[#f8f9fb] p-6">
      <div className="sticky top-0 z-10 flex justify-end">
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-[0px_2px_6px_rgba(0,0,0,0.08)]">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            title={t("organizations.structure.chart.zoomOut")}
            className="flex size-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>

          <span className="min-w-10 text-center font-['Inter',sans-serif] text-xs font-medium text-[#1a2535]">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            title={t("organizations.structure.chart.zoomIn")}
            className="flex size-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>

          <div className="mx-1 h-4 w-px bg-gray-200" />

          <button
            type="button"
            onClick={resetZoom}
            title={t("organizations.structure.chart.resetZoom")}
            className="flex size-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>

      <div
        className="flex min-w-max origin-top justify-center pb-6"
        style={{ transform: `scale(${zoom})` }}
      >
        <div className="flex min-w-max flex-col items-center">
          <div className="min-w-72 rounded-[10px] border border-[#f5841f]/30 bg-white px-6 py-4 text-center shadow-[0px_2px_4px_rgba(0,0,0,0.04)]">
            <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
              {tree.nameEn ?? tree.code ?? t("organizations.structure.chart.organizationFallback")}
            </p>

            {tree.nameAr && (
              <p
                dir="rtl"
                className="mt-1 font-['Inter',sans-serif] text-xs text-gray-500"
              >
                {tree.nameAr}
              </p>
            )}
          </div>

          {units.length > 0 && (
            <>
              <div className="h-8 w-px bg-gray-200" />

              <div className="relative flex items-start gap-8 border-t border-gray-200 pt-8">
                {units.map((unit, index) => (
                  <div
                    key={`${unit.id ?? unit.code ?? "unit"}-${index}`}
                    className="relative"
                  >
                    <div className="absolute -top-8 left-1/2 h-8 w-px -translate-x-1/2 bg-gray-200" />

                    <ChartUnit unit={unit} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {units.length === 0 && (
        <div className="flex h-64 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
          {t("organizations.structure.chart.noUnits")}
        </div>
      )}
    </div>
  );
}
