import {
  ROLE_NAMES,
  RoleRepository,
  USER_STATUS,
  UserRepository,
} from '@app/common';
import { Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { DEFAULT_ROLES } from './roles/roles.config';
import * as bcrypt from 'bcrypt';

export class SystemInitService {
  private readonly logger = new Logger(SystemInitService.name);

  constructor(
    private readonly roleRepo: RoleRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async init() {
    await this.ensureDefaultRoles();
    await this.ensureRootUser();
  }

  private async ensureDefaultRoles() {
    const existing = await this.roleRepo.find({});
    if (existing.length > 0) {
      this.logger.log('Default roles already exist. Skipping...');
      return;
    }

    this.logger.log('⏳ Creating default roles...');
    const nameToIdMap = new Map<string, Types.ObjectId>();

    for (const role of DEFAULT_ROLES) {
      const created = await this.roleRepo.create({
        name: role.name,
        status: role.status,
        descendants: [],
      });
      nameToIdMap.set(role.name, created._id);
    }

    for (const role of DEFAULT_ROLES) {
      if (role.name === ROLE_NAMES.PLAYER) continue;

      const descendantIds = role.descendants
        .map((desc) => nameToIdMap.get(desc))
        .filter((id): id is Types.ObjectId => !!id);

      await this.roleRepo.findOneAndUpdate(
        { _id: nameToIdMap.get(role.name) },
        { descendants: descendantIds },
      );
    }

    this.logger.log('Default roles created.');
  }

  private async ensureRootUser() {
    const rootUsername = process.env.ROOT_USERNAME;
    const rootPassword = process.env.ROOT_PASSWORD;
    const rootName = process.env.ROOT_NAME;

    if (!rootName || !rootUsername || !rootPassword) {
      throw new Error(
        ' ROOT_NAME, ROOT_USERNAME, ROOT_PASSWORD are required in env.',
      );
    }

    const existing = await this.userRepo.findOne({ username: rootUsername });
    if (existing) {
      this.logger.log('Root user already exists. Skipping...');
      return;
    }

    const rootRole = await this.roleRepo.findOne({ name: ROLE_NAMES.ROOT });
    if (!rootRole) {
      throw new Error(' Root role not found. Cannot create root user.');
    }

    const hashedPassword = await bcrypt.hash(rootPassword, 10);

    await this.userRepo.create({
      name: rootName,
      username: rootUsername,
      password: hashedPassword,
      credits: Number.MAX_SAFE_INTEGER, // infinite
      role: rootRole._id,
      status: USER_STATUS.ACTIVE,
      path: [], // root has no parent
      resourcePermissions: [],
    });

    this.logger.log('Root user created successfully.');
  }
}
