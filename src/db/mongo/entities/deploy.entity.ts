import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MongoId } from '@invenira/schemas';

@Schema({ _id: true, collection: 'deploy', timestamps: true })
export class DeployEntity extends Document<MongoId, never, DeployEntity> {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'users',
  })
  userId: MongoId;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'activities',
  })
  activityId: MongoId;

  @Prop({ required: true, unique: true })
  deployUrl: string;
}

export const DeployEntitySchema = SchemaFactory.createForClass(DeployEntity);
