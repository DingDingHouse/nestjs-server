import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Role, ROLE_NAMES, ROLE_STATUS, RoleRepository } from '@app/common';
import { DEFAULT_ROLES } from './roles.config';
import { Types } from 'mongoose';
import { CreateRoleDto } from './dto/create-role.dto';
import { DescendantsOperation, UpdateRoleDto } from './dto/update-role.dto';
import { FindAllRolesDto } from './dto/find-all-roles.dto';
import { PaginatedResult } from '@app/common/dto/pagination-result.dto';
import { Lean } from '@app/common/types/lean-document';

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
      if (role.name === ROLE_NAMES.PLAYER) continue;

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

  async create(dto: CreateRoleDto) {
    const isTaken = await this.roleRepo.isRoleNameTaken(dto.name);
    if (isTaken) {
      throw new BadRequestException(
        `Role with name "${dto.name}" already exists.`,
      );
    }

    return this.roleRepo.create({
      name: dto.name,
      status: dto.status ?? ROLE_STATUS.ACTIVE,
      descendants: (dto.descendants ?? []).map((id) => new Types.ObjectId(id)),
    });
  }

  async findOne(id: Types.ObjectId) {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with id "${id.toString()}" not found`);
    }
    return role;
  }

  async findAll(params: FindAllRolesDto): Promise<PaginatedResult<Lean<Role>>> {
    const {
      name,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const filter: Record<string, any> = {};

    if (name) filter.name = new RegExp(name, 'i');
    if (status) filter.status = status;

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    return this.roleRepo.findAdvanced({
      filter,
      page,
      limit,
      sort,
    });
  }

  async update(id: Types.ObjectId, dto: UpdateRoleDto) {
    const role = await this.findOne(id);
    const trimmedName = dto.name?.trim();
    const newName = trimmedName ?? role.name;

    const protectedNames: string[] = [ROLE_NAMES.ROOT, ROLE_NAMES.PLAYER];
    const isProtected = protectedNames.includes(role.name);

    if (trimmedName && isProtected && trimmedName !== role.name) {
      throw new BadRequestException(
        `The "${role.name}" role name is protected and cannot be changed.`,
      );
    }

    if (trimmedName) {
      const isTaken = await this.roleRepo.isRoleNameTaken(trimmedName, id);
      if (isTaken) {
        throw new BadRequestException(
          `Role with name "${trimmedName}" already exists.`,
        );
      }
    }

    if (newName === ROLE_NAMES.PLAYER && dto.descendants !== undefined) {
      throw new BadRequestException(
        `The "player" role cannot have any descendants.`,
      );
    }

    let updatedDescendants: Types.ObjectId[] | undefined;

    if (dto.descendants) {
      const descendantIds = dto.descendants.map((d) => new Types.ObjectId(d));
      if (descendantIds.some((descId) => descId.equals(id))) {
        throw new BadRequestException(
          `A role cannot be a descendant of itself.`,
        );
      }
      await this.roleRepo.validateAllExist(descendantIds);

      const current = role.descendants.map((id) => id.toString());
      const incoming = descendantIds.map((id) => id.toString());

      switch (dto.operation) {
        case DescendantsOperation.ADD:
          updatedDescendants = Array.from(
            new Set([...current, ...incoming]),
          ).map((id) => new Types.ObjectId(id));
          break;
        case DescendantsOperation.REMOVE:
          updatedDescendants = current
            .filter((id) => !incoming.includes(id))
            .map((id) => new Types.ObjectId(id));
          break;
        case DescendantsOperation.REPLACE:
        case undefined:
          updatedDescendants = descendantIds;
          break;
      }
    }

    return this.roleRepo.findOneAndUpdate(
      { _id: id },
      { ...dto, name: newName, descendants: updatedDescendants },
    );
  }

  async remove(id: Types.ObjectId) {
    await this.findOne(id);
    return this.roleRepo.deleteOne({ _id: id });
  }
}
