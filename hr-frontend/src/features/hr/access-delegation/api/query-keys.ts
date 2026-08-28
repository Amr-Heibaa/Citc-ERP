const HR_ACCESS_PREFIX = "/api/hr/access";

export function isHrAccessQueryKey(queryKey: readonly unknown[]): boolean {
  const [first] = queryKey;

  return typeof first === "string" && first.startsWith(HR_ACCESS_PREFIX);
}
