import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Activity, MongoId } from '@invenira/schemas';
import { object } from 'zod';

@Schema({ _id: true, timestamps: true })
export class ActivityEntity
  extends Document<MongoId, never, Activity>
  implements Activity
{
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: object, default: {} })
  parameters: Record<string, never>;

  createdAt: Date;

  @Prop({ required: true })
  createdBy: string;

  updatedAt: Date;

  @Prop({ required: true })
  updatedBy: string;
}
