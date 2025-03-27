import { ROLE_STATUS, RoleStatus } from '@app/common';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateRoleDto {
  @Transform(({ value }): string =>
    typeof value === 'string' ? value.trim() : '',
  )
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name cannot be empty or whitespace only' })
  name: string;

  @IsArray()
  @IsOptional()
  @IsMongoId({
    each: true,
    message: 'Each descendant must be a valid Mongo ObjectId',
  })
  descendants?: string[];

  @IsEnum(ROLE_STATUS)
  @IsOptional()
  status?: RoleStatus;
}
