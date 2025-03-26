import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RoleRepository } from '@app/common';
import { DEFAULT_ROLES } from './roles.config';
import { Types } from 'mongoose';
import { ROLE_NAMES } from '@app/common/constants/roles';

@Injectable()
export class RolesService implements OnModuleInit {
  private readonly logger = new Logger(RolesService.name);

  constructor(private readonly roleRepo: RoleRepository) {}

  async onModuleInit() {
    const existingRoles = await this.roleRepo.find({});
    if (existingRoles.length > 0) {
      this.logger.log('Default roles already exist. Skipping creation');
      return;
    }

    this.logger.log('Creating default roles...');

    const nameToIdMap = new Map<string, Types.ObjectId>();

    // 1. First create all roles (without descendants yet)
    for (const role of DEFAULT_ROLES) {
      const created = await this.roleRepo.create({
        name: role.name,
        status: role.status,
        descendants: [],
      });

      nameToIdMap.set(role.name, created._id);
    }

    // Step 2: Update descendants, skipping 'player'
    for (const role of DEFAULT_ROLES) {
      if (
        role.name.toLowerCase() === ROLE_NAMES.PLAYER &&
        role.descendants.length > 0
      ) {
        this.logger.warn('Skipping descendants for player role - not allowed.');
        continue;
      }

      const descendantIds = role.descendants
        .map((desc) => nameToIdMap.get(desc))
        .filter((id): id is Types.ObjectId => !!id);

      await this.roleRepo.findOneAndUpdate(
        { _id: nameToIdMap.get(role.name) },
        { descendants: descendantIds },
      );
    }
    this.logger.log('✅ Default roles created successfully.');
  }
}
