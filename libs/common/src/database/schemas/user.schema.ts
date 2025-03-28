import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../abstract.schema';
import { Types } from 'mongoose';
import { USER_STATUS } from '@app/common/constants/status';

export type ResourcePermission = {
  resource: string;
  permissions: string;
};

@Schema({ timestamps: true })
export class User extends AbstractDocument {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  role: Types.ObjectId;

  @Prop({ default: 0 })
  credits: number;

  @Prop({ enum: Object.values(USER_STATUS), default: USER_STATUS.ACTIVE })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy?: Types.ObjectId;

  @Prop({ default: null })
  lastLogin?: Date;

  @Prop({ default: null })
  token?: string;

  @Prop({ type: [String], default: [] }) // e.g. ['root/admin/user']
  path: string[];

  @Prop({
    type: [{ resource: String, permission: String }],
    default: [],
  })
  resourcePermissions: ResourcePermission[];

  @Prop({ default: null })
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
