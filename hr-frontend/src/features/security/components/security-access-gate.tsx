import type { ReactNode } from "react";
import { Outlet } from "react-router";

import { useSecurityAccess } from "@/features/security/api/use-security-access";
import {
  AccessDeniedState,
  ErrorState,
  PageSkeleton,
} from "@/features/security/components/security-states";
import type { SecurityCapabilities } from "@/features/security/utils/security-access";

/**
 * Route guard for /security/**. Renders an Access Denied state instead of
 * redirecting, so direct navigation by an unauthorized user cannot loop.
 * 401s are handled globally by the Axios interceptor.
 */
export function SecurityAccessGate() {
  const access = useSecurityAccess();

  if (access.isLoading) return <PageSkeleton />;

  if (access.isError) {
    return (
      <div className="p-4 md:p-6">
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <ErrorState error={access.error} onRetry={() => access.refetch()} />
        </div>
      </div>
    );
  }

  if (!access.capabilities.canReadSecurity) return <AccessDeniedState />;

  return <Outlet />;
}

/** Narrower guard for routes that need a specific capability (e.g. audit). */
export function RequireSecurityCapability({
  capability,
  children,
}: {
  capability: keyof Omit<SecurityCapabilities, "hasRole" | "hasPermission">;
  children: ReactNode;
}) {
  const { capabilities } = useSecurityAccess();

  if (!capabilities[capability]) return <AccessDeniedState />;

  return children;
}
