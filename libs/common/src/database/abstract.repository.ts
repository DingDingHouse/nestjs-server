import { Logger } from '@nestjs/common';
import { Model, Types, SaveOptions, Connection } from 'mongoose';
import { AbstractDocument } from './abstract.schema';

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
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (
      await createdDocument.save(options)
    ).toJSON() as unknown as TDocument;
  }

  async findOne(filterQuery: Partial<TDocument>): Promise<TDocument | null> {
    return this.model.findOne(filterQuery).exec();
  }

  async find(filterQuery: Partial<TDocument>): Promise<TDocument[]> {
    return this.model.find(filterQuery).exec();
  }

  async findById(id: string): Promise<TDocument | null> {
    return this.model.findById(id).exec();
  }

  async findOneAndUpdate(
    filterQuery: Partial<TDocument>,
    update: Partial<TDocument>,
    options?: SaveOptions,
  ): Promise<TDocument | null> {
    return this.model
      .findOneAndUpdate(filterQuery, update, { new: true, ...options })
      .exec();
  }

  async deleteOne(filterQuery: Partial<TDocument>): Promise<void> {
    await this.model.deleteOne(filterQuery).exec();
  }

  async deleteMany(filterQuery: Partial<TDocument>): Promise<void> {
    await this.model.deleteMany(filterQuery).exec();
  }

  async startTransaction() {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }
}
