import { Logger } from '@nestjs/common';
import { Model, Types, SaveOptions, Connection } from 'mongoose';
import { AbstractDocument } from './abstract.schema';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) {}

  private filterNotDeleted(filterQuery: Partial<TDocument> = {}) {
    return {
      ...filterQuery,
      status: { $ne: 'deleted' },
    };
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

  async findOne(filterQuery: Partial<TDocument>): Promise<TDocument | null> {
    return this.model.findOne(this.filterNotDeleted(filterQuery)).exec();
  }

  async find(filterQuery: Partial<TDocument> = {}): Promise<TDocument[]> {
    return this.model.find(this.filterNotDeleted(filterQuery)).exec();
  }

  async findById(id: string): Promise<TDocument | null> {
    return this.model
      .findOne(
        this.filterNotDeleted({
          _id: new Types.ObjectId(id),
        } as Partial<TDocument>),
      )
      .exec();
  }

  async findOneAndUpdate(
    filterQuery: Partial<TDocument>,
    update: Partial<TDocument>,
    options?: SaveOptions,
  ): Promise<TDocument | null> {
    return this.model
      .findOneAndUpdate(this.filterNotDeleted(filterQuery), update, {
        new: true,
        ...options,
      })
      .exec();
  }

  // TODO: we should also ensure that unique uniqueness even after deleted
  async deleteOne(filterQuery: Partial<TDocument>): Promise<void> {
    const doc = await this.model
      .findOne(this.filterNotDeleted(filterQuery))
      .exec();
    if (!doc) {
      this.logger.warn(`Soft delete: Document not found or already deleted`);
      return;
    }

    await this.model.updateOne({ _id: doc._id }, { status: 'deleted' }).exec();
  }

  async deleteMany(filterQuery: Partial<TDocument>): Promise<void> {
    const docs = await this.model
      .find(this.filterNotDeleted(filterQuery))
      .exec();
    const ids = docs.map((d) => d._id);
    if (!ids.length) {
      this.logger.warn(`Soft delete: No documents found or already deleted`);
      return;
    }

    await this.model
      .updateMany({ _id: { $in: ids } }, { status: 'deleted' })
      .exec();
  }

  async startTransaction() {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }
}
