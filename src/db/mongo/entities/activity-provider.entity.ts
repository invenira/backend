import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ActivityProvider, MongoId } from '@invenira/schemas';

@Schema({ _id: true, collection: 'activity-providers', timestamps: true })
export class ActivityProviderEntity
  extends Document<MongoId, never, ActivityProvider>
  implements ActivityProvider
{
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, unique: true })
  url: string;

  createdAt: Date;

  @Prop({ required: true })
  createdBy: string;

  updatedAt: Date;

  @Prop({ required: true })
  updatedBy: string;
}

export const ActivityProviderEntitySchema = SchemaFactory.createForClass(
  ActivityProviderEntity,
);
