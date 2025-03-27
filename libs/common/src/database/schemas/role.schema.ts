import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../abstract.schema';
import { Types } from 'mongoose';
import { ROLE_STATUS } from '@app/common/constants/status';
import { ROLE_NAMES } from '@app/common/constants/roles';

@Schema({ timestamps: true })
export class Role extends AbstractDocument {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Role' }], default: [] })
  descendants: Types.ObjectId[];

  @Prop({ enum: Object.values(ROLE_STATUS), default: ROLE_STATUS.ACTIVE })
  status: string;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.pre<Role>('save', function (next) {
  if (this.name === ROLE_NAMES.PLAYER && this.descendants.length > 0) {
    return next(new Error('The "player" role cannot have any descendants.'));
  }
  next();
});
