import { Navigate, Outlet } from "react-router";

import { useMyHrAccess } from "@/features/hr/access-delegation/api/use-hr-access";

export function HrAccessGate() {
  const access = useMyHrAccess();

  if (access.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
        Checking access…
      </div>
    );
  }

  if (access.isError || !access.data?.canViewHr) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
