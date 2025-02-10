import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IAP, MongoId } from '@invenira/schemas';
import { object } from 'zod';
import { ActivityProviderEntity } from './activity-provider.entity';
import { GoalEntity } from './goal.entity';

@Schema({ _id: true, collection: 'iaps', timestamps: true })
export class IAPEntity extends Document<MongoId, never, IAP> implements IAP {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    required: true,
    default: [],
    type: [ActivityProviderEntity],
  })
  activityProviders: ActivityProviderEntity[];

  @Prop({ required: true, default: false })
  isDeployed: boolean;

  @Prop({ required: true, type: object, default: {} })
  deployUrls: Record<string, string>;

  @Prop({
    required: true,
    default: [],
    type: [GoalEntity],
  })
  goals: GoalEntity[];

  createdAt: Date;

  @Prop({ required: true })
  createdBy: string;

  updatedAt: Date;

  @Prop({ required: true })
  updatedBy: string;
}

export const IapSchema = SchemaFactory.createForClass(IAPEntity);
