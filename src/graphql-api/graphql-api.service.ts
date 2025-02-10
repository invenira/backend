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
  MongoId,
} from '@invenira/schemas';
import { IAPService } from '../iap/iap.service';
import { getCurrentUser } from '../current-user';

@Injectable()
export class GraphqlApiService implements IQuery, IMutation {
  constructor(private readonly iapService: IAPService) {}

  async createActivity(
    apId: MongoId,
    createActivity: CreateActivity,
  ): Promise<Activity> {
    createActivity.createdBy = getCurrentUser();
    createActivity.updatedBy = getCurrentUser();
    return this.iapService.createActivity(apId, createActivity);
  }

  async createActivityProvider(
    iapId: MongoId,
    createActivityProvider: CreateActivityProvider,
  ): Promise<ActivityProvider> {
    createActivityProvider.createdBy = getCurrentUser();
    createActivityProvider.updatedBy = getCurrentUser();
    return this.iapService.createActivityProvider(
      iapId,
      createActivityProvider,
    );
  }

  async createGoal(iapId: MongoId, createGoal: CreateGoal): Promise<Goal> {
    createGoal.createdBy = getCurrentUser();
    createGoal.updatedBy = getCurrentUser();
    return this.iapService.createGoal(iapId, createGoal);
  }

  async createIap(createIap: CreateIAP): Promise<IAP> {
    createIap.createdBy = getCurrentUser();
    createIap.updatedBy = getCurrentUser();
    return this.iapService.createIap(createIap);
  }

  async deployIap(iapId: MongoId): Promise<void> {
    await this.iapService.deployIap(iapId);
  }

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
    return this.getActivityProvider(apId).then((ap) => ap.activities);
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

  async removeActivity(activityId: MongoId): Promise<void> {
    await this.iapService.removeActivity(activityId);
  }

  async removeActivityProvider(apId: MongoId): Promise<void> {
    await this.iapService.removeActivityProvider(apId);
  }

  async removeGoal(goalId: MongoId): Promise<void> {
    await this.iapService.removeGoal(goalId);
  }

  async removeIap(iapId: MongoId): Promise<void> {
    await this.iapService.removeIap(iapId);
  }
}
