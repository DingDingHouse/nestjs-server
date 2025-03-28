import { AbstractRepository } from './abstract.repository';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { AbstractDocument } from './abstract.schema';
import { PaginatedResult } from '../dto/pagination-result.dto';

export abstract class SoftDeletableRepository<
  TDocument extends AbstractDocument,
> extends AbstractRepository<TDocument> {
  protected abstract readonly deletedStatusValue: string;
  protected readonly statusField = 'status';
  protected readonly deletedAtField = 'deletedAt';

  protected getSoftDeleteFilter(): FilterQuery<TDocument> {
    return {
      [this.statusField]: { $ne: this.deletedStatusValue },
    } as FilterQuery<TDocument>;
  }

  override async findOne(filter: FilterQuery<TDocument>) {
    return super.findOne({ ...filter, ...this.getSoftDeleteFilter() });
  }

  override async find(filter: FilterQuery<TDocument> = {}) {
    return super.find({ ...filter, ...this.getSoftDeleteFilter() });
  }

  override async findById(id: Types.ObjectId) {
    return super.findOne({ _id: id, ...this.getSoftDeleteFilter() });
  }

  override async findAdvanced({
    filter = {},
    page = 1,
    limit = 10,
    sort = {},
  }: {
    filter?: FilterQuery<TDocument>;
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
  }): Promise<PaginatedResult<TDocument>> {
    const skip = (page - 1) * limit;
    const finalFilter = {
      ...filter,
      ...this.getSoftDeleteFilter(),
    };

    const [data, total] = await Promise.all([
      this.model.find(finalFilter).sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(finalFilter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  override async findOneAndUpdate(
    filter: FilterQuery<TDocument>,
    update: Partial<TDocument>,
    options = {},
  ) {
    return super.findOneAndUpdate(
      { ...filter, ...this.getSoftDeleteFilter() },
      update,
      options,
    );
  }

  override async deleteOne(filter: FilterQuery<TDocument>) {
    const update: Record<string, unknown> = {
      [this.statusField]: this.deletedStatusValue,
      [this.deletedAtField]: new Date(),
    };
    await this.model
      .updateOne(
        { ...filter, ...this.getSoftDeleteFilter() },
        update as UpdateQuery<TDocument>,
      )
      .exec();
  }

  override async deleteMany(filter: FilterQuery<TDocument>) {
    const update: Record<string, unknown> = {
      [this.statusField]: this.deletedStatusValue,
      [this.deletedAtField]: new Date(),
    };
    await this.model
      .updateMany(
        { ...filter, ...this.getSoftDeleteFilter() },
        update as UpdateQuery<TDocument>,
      )
      .exec();
  }

  async softDelete(id: Types.ObjectId): Promise<void> {
    const update: Record<string, unknown> = {
      [this.statusField]: this.deletedStatusValue,
      [this.deletedAtField]: new Date(),
    };
    await this.model
      .updateOne({ _id: id }, update as UpdateQuery<TDocument>)
      .exec();
  }
}
