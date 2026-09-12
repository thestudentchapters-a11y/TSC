import type { FilterQuery, Model } from 'mongoose';
import { ApiError } from '../utils/apiError';
import { slugify } from '../utils/slugify';
import { buildListOptions, paginatedResult, safeFilter, type ListResult } from '../utils/pagination';

/**
 * Generic content service — list/get/create/update/delete with pagination,
 * filtering, sorting, slug handling and soft status management.
 * Used by every editorial collection (news, stories, campuses, …).
 */
export function createContentService<T = Record<string, unknown>>(
  model: Model<any>,
  filterKeys: string[] = ['status', 'category', 'type', 'city', 'state', 'mode']
) {
  return {
    async list(query: Record<string, unknown>): Promise<ListResult<T>> {
      const opts = buildListOptions(query);
      const filter = safeFilter<T>(query, filterKeys);
      // Public list endpoints default to published content only.
      if (query.public === '1' || query.public === true) {
        (filter as Record<string, unknown>).status = 'published';
      }
      const [data, total] = await Promise.all([
        model.find(filter as never).sort(opts.sort).skip((opts.page! - 1) * opts.limit!).limit(opts.limit!).lean(),
        model.countDocuments(filter as never),
      ]);
      return paginatedResult(data as T[], total, opts);
    },

    async getBySlug(slug: string): Promise<T> {
      const doc = await model.findOne({ slug }).lean();
      if (!doc) throw ApiError.notFound(`${model.modelName} not found`);
      return doc as T;
    },

    async getById(id: string): Promise<T> {
      const isOid = /^[a-f\d]{24}$/i.test(id);
      const doc = isOid
        ? await model.findById(id).lean()
        : await model.findOne({ $or: [{ slug: id }, { id }] }).lean();
      if (!doc) throw ApiError.notFound(`${model.modelName} not found`);
      return doc as T;
    },

    async create(payload: Record<string, unknown>): Promise<T> {
      const data = { ...payload } as Record<string, unknown>;
      if (!data.slug && typeof data.title === 'string') data.slug = slugify(data.title);
      // ensure slug uniqueness
      const existing = await model.exists({ slug: data.slug });
      if (existing) data.slug = `${data.slug}-${Date.now().toString(36)}`;
      const created = await model.create(data);
      return created.toObject() as T;
    },

    async update(id: string, payload: Record<string, unknown>): Promise<T> {
      const data: Record<string, unknown> = { ...payload, updatedAt: new Date() };
      if (data.slug === '') delete data.slug;
      const isOid = /^[a-f\d]{24}$/i.test(id);
      let updated;
      if (isOid) {
        updated = await model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
      } else {
        updated = await model.findOneAndUpdate(
          { $or: [{ slug: id }, { id }] },
          data,
          { new: true, runValidators: true, upsert: true }
        ).lean();
      }
      if (!updated) throw ApiError.notFound(`${model.modelName} not found`);
      return updated as T;
    },

    async remove(id: string): Promise<void> {
      const isOid = /^[a-f\d]{24}$/i.test(id);
      const res = isOid
        ? await model.findByIdAndDelete(id)
        : await model.findOneAndDelete({ $or: [{ slug: id }, { id }] });
      if (!res) throw ApiError.notFound(`${model.modelName} not found`);
    },

    async count(filter: FilterQuery<T> = {}): Promise<number> {
      return model.countDocuments(filter);
    },
  };
}
