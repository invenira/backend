import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MongoId } from '@invenira/schemas';
import { object } from 'zod';

@Schema({ _id: true, collection: 'iaps', timestamps: true })
export class IAPEntity extends Document<MongoId, never, IAPEntity> {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'activities' }],
    default: [],
  })
  activityIds: MongoId[];

  @Prop({ required: true, default: false })
  isDeployed: boolean;

  @Prop({ required: true, type: object, default: {} })
  deployUrls: Record<string, string>;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'goals' }],
    default: [],
  })
  goalIds: MongoId[];

  createdAt: Date;

  @Prop({ required: true })
  createdBy: string;

  updatedAt: Date;

  @Prop({ required: true })
  updatedBy: string;
}

export const IapSchema = SchemaFactory.createForClass(IAPEntity);
