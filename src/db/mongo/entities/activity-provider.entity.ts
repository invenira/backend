import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ActivityProvider, MongoId } from '@invenira/schemas';
import { ActivityEntity } from './activity.entity';

@Schema({ _id: true, timestamps: true })
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

  @Prop({
    required: true,
    default: [],
    type: [ActivityEntity],
  })
  activities: ActivityEntity[];

  createdAt: Date;

  @Prop({ required: true })
  createdBy: string;

  updatedAt: Date;

  @Prop({ required: true })
  updatedBy: string;
}
