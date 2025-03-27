import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';
import {
  IsEnum,
  IsOptional,
  ValidateIf,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  IsArray,
  IsMongoId,
} from 'class-validator';
import { ROLE_STATUS, RoleStatus } from '@app/common';

export enum DescendantsOperation {
  ADD = 'add',
  REMOVE = 'remove',
  REPLACE = 'replace',
}

@ValidatorConstraint({ name: 'DescendantsWithOp', async: false })
export class DescendantsWithOpValidator
  implements ValidatorConstraintInterface
{
  validate(_: any, args: ValidationArguments): boolean {
    const object = args.object as UpdateRoleDto;
    return object.descendants ? !!object.operation : true;
  }

  defaultMessage(): string {
    return `If "descendants" is provided, "operation" must also be one of: add, remove, replace.`;
  }
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsOptional()
  @IsEnum(ROLE_STATUS, {
    message: `status must be one of: ${Object.values(ROLE_STATUS).join(', ')}`,
  })
  status?: RoleStatus;

  @IsOptional()
  @IsEnum(DescendantsOperation, {
    message: 'operation must be one of: add, remove, replace',
  })
  @ValidateIf((o: Partial<UpdateRoleDto>) => o.descendants !== undefined)
  operation?: DescendantsOperation;

  @IsOptional()
  @IsArray()
  @IsMongoId({
    each: true,
    message: 'Each descendant must be a valid ObjectId',
  })
  descendants?: string[];

  @Validate(DescendantsWithOpValidator)
  _descendantsOpValidator?: unknown;
}
