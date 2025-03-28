import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ResourcePermissionDto {
  @IsString()
  resource: string;

  @IsString()
  permission: string;
}

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsMongoId()
  role: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourcePermissionDto)
  resourcePermissions?: ResourcePermissionDto[];

  @IsOptional()
  @IsMongoId()
  createdBy?: string;
}
