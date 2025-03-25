import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../abstract.repository';
import { UserDocument } from '../schemas/user.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

@Injectable()
export class UserRepository extends AbstractRepository<UserDocument> {
  protected readonly logger = new Logger(UserRepository.name);

  constructor(
    @InjectModel(UserDocument.name) userModel: Model<UserDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(userModel, connection);
  }
}
