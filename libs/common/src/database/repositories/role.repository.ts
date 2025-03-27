import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../abstract.repository';
import { Role } from '../schemas/role.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, FilterQuery, Model, SaveOptions, Types } from 'mongoose';
import { ROLE_NAMES } from '@app/common/constants/roles';
import { ROLE_STATUS } from '@app/common/constants/status';

@Injectable()
export class RoleRepository extends AbstractRepository<Role> {
  protected readonly logger = new Logger(RoleRepository.name);
  protected readonly deletedStatusValue = ROLE_STATUS.DELETED;

  constructor(
    @InjectModel(Role.name) roleModel: Model<Role>,
    @InjectConnection() connection: Connection,
  ) {
    super(roleModel, connection);
  }

  async findByName(name: string): Promise<Role | null> {
    return this.findOne({ name });
  }

  async findManyByIds(ids: Types.ObjectId[]): Promise<Role[]> {
    return this.find({ _id: { $in: ids } });
  }

  async isRoleNameTaken(
    name: string,
    excludeId?: Types.ObjectId,
  ): Promise<boolean> {
    const existing = await this.model.findOne({
      name,
      status: { $ne: ROLE_STATUS.DELETED },
    });
    return existing ? !excludeId || !existing._id.equals(excludeId) : false;
  }

  async validateAllExist(ids: Types.ObjectId[]): Promise<void> {
    const existing = await this.findManyByIds(ids);
    const existingIds = new Set(existing.map((r) => r._id.toString()));
    const missing = ids
      .map((id) => id.toString())
      .filter((id) => !existingIds.has(id));
    if (missing.length > 0) {
      throw new Error(
        `The following descendant roles do not exist: ${missing.join(', ')}`,
      );
    }
  }

  async create(
    document: Omit<Role, '_id'>,
    options?: SaveOptions,
  ): Promise<Role> {
    if (document.name === ROLE_NAMES.ROOT) {
      const existingRoot = await this.model.findOne({ name: ROLE_NAMES.ROOT });
      if (existingRoot) {
        throw new Error('Root role already exists.');
      }
    }

    const role = await super.create(document, options);
    if (role.name === ROLE_NAMES.ROOT) return role;

    const rootRole = await this.model.findOne({ name: ROLE_NAMES.ROOT });
    if (!rootRole) return role;

    const alreadyAdded = rootRole.descendants.some((id) => id.equals(role._id));
    if (!alreadyAdded) {
      rootRole.descendants.push(role._id);
      await rootRole.save();
      this.logger.log(`Added role "${role.name}" to root's descendants`);
    }

    return role;
  }

  async findOneAndUpdate(
    filter: FilterQuery<Role>,
    update: Partial<Role>,
    options?: SaveOptions,
  ): Promise<Role | null> {
    const isPlayer = update.name === ROLE_NAMES.PLAYER;
    const hasDescendants =
      Array.isArray(update.descendants) && update.descendants.length > 0;
    if (isPlayer && hasDescendants) {
      throw new Error('The "player" role cannot have any descendants.');
    }
    return super.findOneAndUpdate(filter, update, options);
  }

  async deleteOne(filter: FilterQuery<Role>): Promise<void> {
    const role = await this.model.findOne({
      ...filter,
      status: { $ne: ROLE_STATUS.DELETED },
    });
    if (!role) return;

    if (role.name === ROLE_NAMES.ROOT || role.name === ROLE_NAMES.PLAYER) {
      throw new BadRequestException(
        `The "${role.name}" role cannot be deleted.`,
      );
    }

    const renamed = `${role.name}__deleted__${new Date().toISOString()}`;
    await this.model.updateOne(
      { _id: role._id },
      {
        name: renamed,
        status: ROLE_STATUS.DELETED,
        deletedAt: new Date(),
      },
    );
  }
}
