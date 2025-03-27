import { Logger } from '@nestjs/common';
import {
  Model,
  Types,
  SaveOptions,
  Connection,
  FilterQuery,
  UpdateQuery,
} from 'mongoose';
import { AbstractDocument } from './abstract.schema';
import { PaginatedResult } from '../dto/pagination-result.dto';
import { Lean } from '../types/lean-document';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;
  protected abstract readonly deletedStatusValue: string;
  protected readonly statusField: string = 'status';
  protected readonly deletedAtField: string = 'deletedAt';

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) {}

  private getSoftDeleteFilter(): FilterQuery<TDocument> {
    return {
      [this.statusField]: { $ne: this.deletedStatusValue },
    } as FilterQuery<TDocument>;
  }
  async create(
    document: Omit<TDocument, '_id'>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (
      await createdDocument.save(options)
    ).toJSON() as unknown as TDocument;
  }

  async findOne(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument | null> {
    return this.model
      .findOne({ ...filterQuery, ...this.getSoftDeleteFilter() })
      .exec();
  }

  async find(filterQuery: FilterQuery<TDocument> = {}): Promise<TDocument[]> {
    return this.model
      .find({ ...filterQuery, ...this.getSoftDeleteFilter() })
      .exec();
  }

  async findById(id: Types.ObjectId): Promise<TDocument | null> {
    return this.model
      .findOne({ _id: id, ...this.getSoftDeleteFilter() })
      .exec();
  }

  async findAdvanced({
    filter = {},
    page = 1,
    limit = 10,
    sort = {},
  }: {
    filter?: FilterQuery<TDocument>;
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
  }): Promise<PaginatedResult<Lean<TDocument>>> {
    const skip = (page - 1) * limit;

    const finalFilter = {
      ...filter,
      ...this.getSoftDeleteFilter(),
    };

    const [data, total] = await Promise.all([
      this.model
        .find(finalFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.model.countDocuments(finalFilter),
    ]);

    return {
      data: data as Lean<TDocument>[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: Partial<TDocument>,
    options?: SaveOptions,
  ): Promise<TDocument | null> {
    return this.model
      .findOneAndUpdate(
        { ...filterQuery, ...this.getSoftDeleteFilter() },
        update,
        { new: true, ...options },
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

  async deleteOne(filterQuery: FilterQuery<TDocument>): Promise<void> {
    const update: Record<string, unknown> = {
      [this.statusField]: this.deletedStatusValue,
      [this.deletedAtField]: new Date(),
    };

    await this.model
      .updateOne(
        { ...filterQuery, ...this.getSoftDeleteFilter() },
        update as UpdateQuery<TDocument>,
      )
      .exec();
  }

  async deleteMany(filterQuery: FilterQuery<TDocument>): Promise<void> {
    const update: Record<string, unknown> = {
      [this.statusField]: this.deletedStatusValue,
      [this.deletedAtField]: new Date(),
    };

    await this.model
      .updateMany(
        { ...filterQuery, ...this.getSoftDeleteFilter() },
        update as UpdateQuery<TDocument>,
      )
      .exec();
  }

  async startTransaction() {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }
}
