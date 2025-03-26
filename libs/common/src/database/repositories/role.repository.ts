import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../abstract.repository';
import { Role } from '../schemas/role.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, SaveOptions } from 'mongoose';
import { ROLE_NAMES } from '@app/common/constants/roles';

@Injectable()
export class RoleRepository extends AbstractRepository<Role> {
  protected readonly logger = new Logger(RoleRepository.name);

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
        throw new Error('Root role already exists. Cannot create another one.');
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
}
