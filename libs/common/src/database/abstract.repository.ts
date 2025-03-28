import { Logger } from '@nestjs/common';
import {
  Model,
  Types,
  SaveOptions,
  Connection,
  FilterQuery,
  QueryOptions,
} from 'mongoose';
import { AbstractDocument } from './abstract.schema';
import { PaginatedResult } from '../dto/pagination-result.dto';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) {}

  async create(
    document: Omit<TDocument, '_id'>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const created = new this.model({ ...document, _id: new Types.ObjectId() });
    return created.save(options);
  }

  async findOne(filter: FilterQuery<TDocument>): Promise<TDocument | null> {
    return this.model.findOne(filter).exec();
  }

  async find(filter: FilterQuery<TDocument> = {}): Promise<TDocument[]> {
    return this.model.find(filter).exec();
  }

  async findById(id: Types.ObjectId): Promise<TDocument | null> {
    return this.model.findById(id).exec();
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
  }): Promise<PaginatedResult<TDocument>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneAndUpdate(
    filter: FilterQuery<TDocument>,
    update: Partial<TDocument>,
    options?: QueryOptions,
  ): Promise<TDocument | null> {
    return this.model
      .findOneAndUpdate(filter, update, { new: true, ...options })
      .exec();
  }

  async deleteOne(filter: FilterQuery<TDocument>): Promise<void> {
    await this.model.deleteOne(filter).exec();
  }

  async deleteMany(filter: FilterQuery<TDocument>): Promise<void> {
    await this.model.deleteMany(filter).exec();
  }

  async startTransaction() {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }
}
