import type { Pageable } from "@/lib/api/generated/model";

// Spring's Pageable binder reads flat `page`/`size`/`sort` query params.
// Orval generates a single nested `pageable` object parameter for this
// endpoint, and axios's default serializer would send it as
// `pageable[page]=0`, which Spring silently ignores in favor of its own
// defaults. This flattens it to what Spring actually expects.
export const pageableParamsSerializer = {
  serialize: (params: { pageable?: Pageable }) => {
    const search = new URLSearchParams();
    const { page, size, sort } = params.pageable ?? {};

    if (page !== undefined) search.set("page", String(page));
    if (size !== undefined) search.set("size", String(size));
    sort?.forEach((value) => search.append("sort", value));

    return search.toString();
  },
};
