import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getEmployeePhoto } from "@/lib/api/generated/ems/employee-controller/employee-controller";
import { initials } from "@/features/hr/shared/utils/format";

const AVATAR_COLORS = [
  "bg-[#f5841f]",
  "bg-[#3498db]",
  "bg-[#9b59b6]",
  "bg-[#2ecc71]",
];

function avatarColor(employeeId: number | null | undefined) {
  return AVATAR_COLORS[(employeeId ?? 0) % AVATAR_COLORS.length];
}

// The employee list/summary endpoints no longer embed photo bytes (they
// only expose `hasPhoto`), so the image has to be fetched separately per
// employee from the dedicated photo endpoint, lazily and only when present.
function useEmployeePhotoUrl(
  employeeId: number | null | undefined,
  hasPhoto: boolean | undefined,
) {
  const enabled = Boolean(hasPhoto) && Number.isInteger(employeeId) && (employeeId ?? 0) > 0;

  const query = useQuery({
    queryKey: ["employee-photo", employeeId],
    queryFn: () =>
      getEmployeePhoto(employeeId as number, { responseType: "blob" }) as unknown as Promise<Blob>,
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const url = useMemo(
    () => (query.data ? URL.createObjectURL(query.data) : undefined),
    [query.data],
  );

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return url;
}

export function EmployeeAvatar({
  employeeId,
  hasPhoto,
  displayName,
  className = "size-10",
}: {
  employeeId: number | null | undefined;
  hasPhoto: boolean | undefined;
  displayName: string | null | undefined;
  className?: string;
}) {
  const photoUrl = useEmployeePhotoUrl(employeeId, hasPhoto);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full ${avatarColor(employeeId)} ${className}`}
    >
      {photoUrl ? (
        <img src={photoUrl} alt={displayName ?? ""} className="size-full object-cover" />
      ) : (
        <span className="font-['Inter',sans-serif] text-sm font-bold text-white">
          {initials(displayName)}
        </span>
      )}
    </div>
  );
}
