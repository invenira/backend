import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MongoId } from '@invenira/schemas';

@Schema({ _id: true, collection: 'users', timestamps: true })
export class UserEntity extends Document<MongoId, never, UserEntity> {
  @Prop({ required: true, unique: true })
  lmsUserId: string;
}

export const UserEntitySchema = SchemaFactory.createForClass(UserEntity);
