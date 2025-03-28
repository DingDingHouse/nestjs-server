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

    // Automatically add to ROOT descendants
    if (role.name !== ROLE_NAMES.ROOT) {
      const rootRole = await this.model.findOne({ name: ROLE_NAMES.ROOT });
      if (rootRole && !rootRole.descendants.some((id) => id.equals(role._id))) {
        rootRole.descendants.push(role._id);
        await rootRole.save();
        this.logger.log(`Added "${role.name}" as descendant to ROOT`);
      }
    }

    return role;
  }

  async validateAllExist(ids: Types.ObjectId[]): Promise<void> {
    const found = await this.find({ _id: { $in: ids } });
    const foundIds = new Set(found.map((r) => r._id.toString()));
    const missing = ids
      .map((id) => id.toString())
      .filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw new BadRequestException(`Missing role IDs: ${missing.join(', ')}`);
    }
  }

  async isRoleNameTaken(
    name: string,
    excludeId?: Types.ObjectId,
  ): Promise<boolean> {
    const existing = await this.model.findOne({ name });
    return !!existing && (!excludeId || !existing._id.equals(excludeId));
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

    const renamed = `${role.name}__deleted__${Date.now()}`;
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
