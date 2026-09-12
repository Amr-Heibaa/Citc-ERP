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

// The backend rejects any page size over 100 ("Page size must not exceed
// 100"), so "give me everything" call sites can't just ask for one huge
// page — they need to walk every page at the max size and concatenate.
export const MAX_PAGE_SIZE = 100;

type PageLike<T> = {
  content?: T[] | null;
  last?: boolean;
};

export async function fetchAllPages<T>(
  fetchPage: (page: number, size: number) => Promise<PageLike<T>>,
  size: number = MAX_PAGE_SIZE,
): Promise<T[]> {
  const all: T[] = [];
  let page = 0;

  while (true) {
    const result = await fetchPage(page, size);
    all.push(...(result.content ?? []));

    if (result.last !== false) break;
    page += 1;
  }

  return all;
}
