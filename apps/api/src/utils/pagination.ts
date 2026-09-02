import type { FilterQuery } from 'mongoose';

export interface ListOptions {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface ListResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/** Standard pagination + sorting + simple filtering for list endpoints. */
export function buildListOptions(query: Record<string, unknown>): ListOptions {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));
  return { page, limit, sort: typeof query.sort === 'string' ? query.sort : '-createdAt' };
}

export function paginatedResult<T>(data: T[], total: number, opts: ListOptions): ListResult<T> {
  const totalPages = Math.max(1, Math.ceil(total / opts.limit!));
  return {
    data,
    pagination: {
      page: opts.page!,
      limit: opts.limit!,
      total,
      totalPages,
      hasNext: opts.page! < totalPages,
      hasPrev: opts.page! > 1,
    },
  };
}

/** Whitelist query params → mongoose filter (injection-safe). */
export function safeFilter<T>(query: Record<string, unknown>, allowed: string[]): FilterQuery<T> {
  const filter: Record<string, unknown> = {};
  for (const key of allowed) {
    const value = query[key];
    if (value !== undefined && value !== '' && typeof value !== 'object') {
      filter[key] = value;
    }
  }
  return filter as FilterQuery<T>;
}
