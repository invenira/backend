import { Injectable } from '@nestjs/common';
import {
  Activity,
  ActivityProvider,
  ConfigInterface,
  CreateActivity,
  CreateActivityProvider,
  CreateGoal,
  CreateIAP,
  Goal,
  IAP,
  IMutation,
  IQuery,
  MetricGQLSchema,
  MongoId,
} from '@invenira/schemas';
import { IAPService } from '../iap/iap.service';

@Injectable()
export class GraphqlApiService implements IQuery, IMutation {
  constructor(private readonly iapService: IAPService) {}

  async getActivities(): Promise<Activity[]> {
    return this.iapService.getActivities();
  }

  async getActivity(activityId: MongoId): Promise<Activity> {
    return this.iapService.getActivity(activityId);
  }

  async getActivityProvider(apId: MongoId): Promise<ActivityProvider> {
    return this.iapService.getActivityProvider(apId);
  }

  async getActivityProviderActivities(apId: MongoId): Promise<Activity[]> {
    return this.iapService.getActivityProviderActivities(apId);
  }

  async getActivityProviders(): Promise<ActivityProvider[]> {
    return this.iapService.getActivityProviders();
  }

  async getConfigurationInterfaceUrl(apId: MongoId): Promise<ConfigInterface> {
    return this.iapService.getConfigurationInterfaceUrl(apId);
  }

  async getConfigurationParameters(apId: MongoId): Promise<string[]> {
    return this.iapService.getConfigurationParameters(apId);
  }

  async getIAP(iapId: MongoId): Promise<IAP> {
    return this.iapService.getIAP(iapId);
  }

  async getIAPs(): Promise<IAP[]> {
    return this.iapService.getIAPs();
  }

  async getActivityProviderRequiredFields(apId: MongoId): Promise<string[]> {
    return this.iapService.getActivityProviderRequiredFields(apId);
  }

  async getIAPAvailableMetrics(iapId: MongoId): Promise<MetricGQLSchema[]> {
    return this.iapService.getIAPAvailableMetrics(iapId);
  }

  async createActivityProvider(
    createActivityProvider: CreateActivityProvider,
  ): Promise<ActivityProvider> {
    return this.iapService.createActivityProvider(createActivityProvider);
  }

  async removeActivityProvider(apId: MongoId): Promise<void> {
    await this.iapService.removeActivityProvider(apId);
  }

  async createActivity(
    iapId: MongoId,
    createActivity: CreateActivity,
  ): Promise<Activity> {
    return this.iapService.createActivity(iapId, createActivity);
  }

  async removeActivity(activityId: MongoId): Promise<void> {
    await this.iapService.removeActivity(activityId);
  }

  async createGoal(iapId: MongoId, createGoal: CreateGoal): Promise<Goal> {
    return this.iapService.createGoal(iapId, createGoal);
  }

  async removeGoal(goalId: MongoId): Promise<void> {
    await this.iapService.removeGoal(goalId);
  }

  async createIap(createIap: CreateIAP): Promise<IAP> {
    return this.iapService.createIap(createIap);
  }

  async removeIap(iapId: MongoId): Promise<void> {
    await this.iapService.removeIap(iapId);
  }

  async deployIap(iapId: MongoId): Promise<void> {
    await this.iapService.deployIap(iapId);
  }

  async provideActivity(
    activityId: string,
    lmsUserId: string,
  ): Promise<string> {
    // TODO: Fix schemas, activityId should be MongoIdScalar instead of String
    return this.iapService.provideActivity(activityId, lmsUserId);
  }
}
