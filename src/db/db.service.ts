import { Activity, ActivityProvider, Goal, IAP } from '@invenira/schemas';
import {
  CreateActivityInput,
  CreateActivityProviderInput,
  CreateGoalInput,
  CreateIAPInput,
  MongoIdScalar,
} from '@invenira/schemas/dist/types/graphql.types';

export interface DbService {
  getActivityProviders(): Promise<ActivityProvider[]>;

  getActivityProvider(apId: MongoIdScalar): Promise<ActivityProvider>;

  getActivityProviderActivities(apId: MongoIdScalar): Promise<Activity[]>;

  getActivities(): Promise<Activity[]>;

  getActivity(activityId: MongoIdScalar): Promise<Activity>;

  getIAPs(): Promise<IAP[]>;

  getIAP(iapId: MongoIdScalar): Promise<IAP>;

  createActivityProvider(
    createActivityProviderInput: CreateActivityProviderInput,
  ): Promise<ActivityProvider>;

  removeActivityProvider(apId: MongoIdScalar): Promise<void>;

  createActivity(
    iapId: MongoIdScalar,
    createActivityInput: CreateActivityInput,
  ): Promise<Activity>;

  removeActivity(activityId: MongoIdScalar): Promise<void>;

  createGoal(
    iapId: MongoIdScalar,
    createGoalInput: CreateGoalInput,
  ): Promise<Goal>;

  removeGoal(goalId: MongoIdScalar): Promise<void>;

  createIap(createIapInput: CreateIAPInput): Promise<IAP>;

  removeIap(iapId: MongoIdScalar): Promise<void>;

  deployIap(iapId: MongoIdScalar): Promise<void>;
}

export const DB_SERVICE = 'INVENIRA_DB_SERVICE';
