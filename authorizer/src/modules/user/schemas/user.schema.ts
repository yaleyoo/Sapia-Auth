import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserStatus } from '../../../enum/UserStatus';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {

  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  creation_date: string;

  @Prop()
  last_login: string;

  @Prop()
  status: UserStatus;
}

export const UserSchema = SchemaFactory.createForClass(User);