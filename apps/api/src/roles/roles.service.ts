import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Role, ROLE_NAMES, ROLE_STATUS, RoleRepository } from '@app/common';
import { Types } from 'mongoose';
import { CreateRoleDto } from './dto/create-role.dto';
import { DescendantsOperation, UpdateRoleDto } from './dto/update-role.dto';
import { FindAllRolesDto } from './dto/find-all-role.dto';
import { PaginatedResult } from '@app/common/dto/pagination-result.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(private readonly roleRepo: RoleRepository) {}

  async create(dto: CreateRoleDto) {
    const name = dto.name.trim();
    const isTaken = await this.roleRepo.isRoleNameTaken(name);
    if (isTaken) {
      throw new BadRequestException(`Role "${name}" already exists.`);
    }

    const descendants = (dto.descendants ?? []).map(
      (id) => new Types.ObjectId(id),
    );
    return this.roleRepo.create({
      name,
      status: dto.status ?? ROLE_STATUS.ACTIVE,
      descendants,
    });
  }

  async findOne(id: Types.ObjectId): Promise<Role> {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID "${id.toString()}" not found.`);
    }
    return role;
  }

  async findAll(params: FindAllRolesDto): Promise<PaginatedResult<Role>> {
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

    return this.roleRepo.findAdvanced({ filter, page, limit, sort });
  }

  async update(id: Types.ObjectId, dto: UpdateRoleDto) {
    const role = await this.findOne(id);

    const name = dto.name?.trim() ?? role.name;

    const protectedNames: string[] = [ROLE_NAMES.ROOT, ROLE_NAMES.PLAYER];
    const isProtected = protectedNames.includes(role.name);

    if (dto.name && isProtected && dto.name !== role.name) {
      throw new BadRequestException(
        `"${role.name}" role name cannot be changed.`,
      );
    }

    if (dto.name) {
      const isTaken = await this.roleRepo.isRoleNameTaken(name, id);
      if (isTaken) {
        throw new BadRequestException(`Role "${name}" already exists.`);
      }
    }

    if (name === ROLE_NAMES.PLAYER && dto.descendants) {
      throw new BadRequestException(`"Player" role cannot have descendants.`);
    }

    let updatedDescendants: Types.ObjectId[] | undefined;

    if (dto.descendants) {
      const descIds = dto.descendants.map((d) => new Types.ObjectId(d));
      if (descIds.some((desc) => desc.equals(id))) {
        throw new BadRequestException(`A role cannot be its own descendant.`);
      }
      await this.roleRepo.validateAllExist(descIds);

      const current = role.descendants.map((id) => id.toString());
      const incoming = descIds.map((id) => id.toString());

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
        default:
          updatedDescendants = descIds;
      }
    }

    return this.roleRepo.findOneAndUpdate(
      { _id: id },
      { ...dto, name, descendants: updatedDescendants },
    );
  }

  async remove(id: Types.ObjectId) {
    await this.findOne(id);
    return this.roleRepo.deleteOne({ _id: id });
  }
}
