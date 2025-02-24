import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Goal, MongoId } from '@invenira/schemas';

@Schema({ _id: true, collection: 'goals', timestamps: true })
export class GoalEntity extends Document<MongoId, never, Goal> implements Goal {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  formula: string;

  @Prop({ required: true })
  targetValue: number;

  createdAt: Date;

  @Prop({ required: true })
  createdBy: string;

  updatedAt: Date;

  @Prop({ required: true })
  updatedBy: string;
}

export const GoalEntitySchema = SchemaFactory.createForClass(GoalEntity);
