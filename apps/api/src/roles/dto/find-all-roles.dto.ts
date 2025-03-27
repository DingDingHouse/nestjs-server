import {
  IsOptional,
  IsString,
  IsEnum,
  IsIn,
  IsInt,
  Min,
} from 'class-validator';
import { ROLE_STATUS } from '@app/common/constants/status';
import { Type } from 'class-transformer';

export class FindAllRolesDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(ROLE_STATUS)
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @IsIn(['createdAt', 'name', 'status'])
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
