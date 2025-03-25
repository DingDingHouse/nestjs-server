import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../abstract.schema';

@Schema({ timestamps: true })
export class UserDocument extends AbstractDocument {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  role: string;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: null })
  lastLogin?: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
