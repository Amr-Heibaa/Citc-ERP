import { AlertCircle, Inbox, Lock, RefreshCw, SearchX } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiStatus } from "@/features/security/utils/security-errors";

function StateFrame({
  icon,
  title,
  description,
  action,
  tone = "muted",
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "muted" | "danger";
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className="flex min-h-56 flex-col items-center justify-center gap-3 p-6 text-center"
    >
      <span
        className={`flex size-12 items-center justify-center rounded-full ${
          tone === "danger" ? "bg-red-50 text-red-400" : "bg-[#f4f6f9] text-gray-400"
        }`}
      >
        {icon}
      </span>

      <div className="max-w-md">
        <p className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">{title}</p>
        {description && (
          <p className="mt-1 font-['Inter',sans-serif] text-sm text-gray-400">{description}</p>
        )}
      </div>

      {action}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return <StateFrame icon={<Inbox className="size-6" />} title={title} description={description} />;
}

export function NoMatchesState() {
  const { t } = useTranslation();
  return (
    <StateFrame
      icon={<SearchX className="size-6" />}
      title={t("security.states.noMatches")}
      description={t("security.states.noMatchesHint")}
    />
  );
}

/** Error panel that distinguishes forbidden/not-found from generic failures. */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { t } = useTranslation();
  const status = getApiStatus(error);

  if (status === 403) {
    return (
      <StateFrame
        icon={<Lock className="size-6" />}
        title={t("security.errors.forbiddenTitle")}
        description={t("security.errors.forbidden")}
      />
    );
  }

  return (
    <StateFrame
      tone="danger"
      icon={<AlertCircle className="size-6" />}
      title={t("security.states.unableToLoad")}
      description={error instanceof Error ? error.message : undefined}
      action={
        onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="size-4" />
            {t("security.states.tryAgain")}
          </Button>
        )
      }
    />
  );
}

export function PanelSkeleton({ rows = 5 }: { rows?: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2 p-4" aria-busy="true" aria-label={t("common.loading")}>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-11 rounded-lg bg-gray-100" />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6" aria-busy="true" aria-label={t("common.loading")}>
      <Skeleton className="h-[104px] rounded-2xl bg-gray-200" />
      <Skeleton className="h-10 w-80 max-w-full rounded-lg bg-gray-100" />
      <Skeleton className="h-64 rounded-xl bg-gray-100" />
    </div>
  );
}

export function AccessDeniedState({ description }: { description?: string }) {
  const { t } = useTranslation();

  return (
    <div className="p-4 md:p-6">
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <StateFrame
          icon={<Lock className="size-6" />}
          title={t("security.accessDenied.title")}
          description={description ?? t("security.accessDenied.description")}
          action={
            <Button asChild variant="outline">
              <Link to="/">{t("security.accessDenied.backToDashboard")}</Link>
            </Button>
          }
        />
      </div>
    </div>
  );
}

/** Full-page state for a detail route whose resource failed to load. */
export function DetailErrorState({
  error,
  backTo,
  backLabel,
  onRetry,
}: {
  error: unknown;
  backTo: string;
  backLabel: string;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const status = getApiStatus(error);

  if (status === 403) return <AccessDeniedState description={t("security.errors.forbidden")} />;

  return (
    <div className="p-4 md:p-6">
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        {status === 404 ? (
          <StateFrame
            icon={<SearchX className="size-6" />}
            title={t("security.errors.notFoundTitle")}
            description={t("security.errors.notFound")}
            action={
              <Button asChild variant="outline">
                <Link to={backTo}>{backLabel}</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState error={error} onRetry={onRetry} />
        )}
      </div>
    </div>
  );
}
