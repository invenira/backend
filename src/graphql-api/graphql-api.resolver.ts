import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphqlApiService } from './graphql-api.service';
import {
  Activity,
  ActivityProvider,
  ConfigInterface,
  CreateActivity,
  CreateActivityProvider,
  CreateActivityProviderSchema,
  CreateActivitySchema,
  CreateGoal,
  CreateGoalSchema,
  CreateIAP,
  CreateIAPSchema,
  Goal,
  IAP,
  IMutation,
  IQuery,
  MongoId,
  MongoIdSchema,
} from '@invenira/schemas';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { INSTRUCTOR_ROLES, Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../pipes';

@Resolver('IAPGQLSchema')
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles(...INSTRUCTOR_ROLES)
export class GraphqlApiResolver implements IQuery, IMutation {
  constructor(private readonly activityProvidersService: GraphqlApiService) {}

  @Mutation('createActivity')
  async createActivity(
    @Args('apId', new ZodValidationPipe(MongoIdSchema))
    apId: MongoId,
    @Args('createActivityInput', new ZodValidationPipe(CreateActivitySchema))
    createActivity: CreateActivity,
  ): Promise<Activity> {
    return this.activityProvidersService.createActivity(apId, createActivity);
  }

  @Mutation('createActivityProvider')
  async createActivityProvider(
    @Args('iapId', new ZodValidationPipe(MongoIdSchema))
    iapId: MongoId,
    @Args(
      'createActivityProviderInput',
      new ZodValidationPipe(CreateActivityProviderSchema),
    )
    createActivityProvider: CreateActivityProvider,
  ): Promise<ActivityProvider> {
    return this.activityProvidersService.createActivityProvider(
      iapId,
      createActivityProvider,
    );
  }

  @Mutation('createGoal')
  async createGoal(
    @Args('iapId', new ZodValidationPipe(MongoIdSchema))
    iapId: MongoId,
    @Args('createGoalInput', new ZodValidationPipe(CreateGoalSchema))
    createGoal: CreateGoal,
  ): Promise<Goal> {
    return this.activityProvidersService.createGoal(iapId, createGoal);
  }

  @Mutation('createIap')
  async createIap(
    @Args('createIapInput', new ZodValidationPipe(CreateIAPSchema))
    createIap: CreateIAP,
  ): Promise<IAP> {
    return this.activityProvidersService.createIap(createIap);
  }

  @Mutation('deployIap')
  async deployIap(
    @Args('iapId', new ZodValidationPipe(MongoIdSchema))
    iapId: MongoId,
  ): Promise<void> {
    return this.activityProvidersService.deployIap(iapId);
  }

  @Query('getActivities')
  async getActivities(): Promise<Activity[]> {
    return this.activityProvidersService.getActivities();
  }

  @Query('getActivity')
  async getActivity(
    @Args('activityId', new ZodValidationPipe(MongoIdSchema))
    activityId: MongoId,
  ): Promise<Activity> {
    return this.activityProvidersService.getActivity(activityId);
  }

  @Query('getActivityProvider')
  async getActivityProvider(
    @Args('apId', new ZodValidationPipe(MongoIdSchema))
    apId: MongoId,
  ): Promise<ActivityProvider> {
    return this.activityProvidersService.getActivityProvider(apId);
  }

  @Query('getActivityProviderActivities')
  async getActivityProviderActivities(
    @Args('apId', new ZodValidationPipe(MongoIdSchema))
    apId: MongoId,
  ): Promise<Activity[]> {
    return this.activityProvidersService.getActivityProviderActivities(apId);
  }

  @Query('getActivityProviders')
  async getActivityProviders(): Promise<ActivityProvider[]> {
    return this.activityProvidersService.getActivityProviders();
  }

  @Query('getConfigurationInterfaceUrl')
  async getConfigurationInterfaceUrl(
    @Args('apId', new ZodValidationPipe(MongoIdSchema))
    apId: MongoId,
  ): Promise<ConfigInterface> {
    return this.activityProvidersService.getConfigurationInterfaceUrl(apId);
  }

  @Query('getConfigurationParameters')
  async getConfigurationParameters(
    @Args('apId', new ZodValidationPipe(MongoIdSchema))
    apId: MongoId,
  ): Promise<string[]> {
    return this.activityProvidersService.getConfigurationParameters(apId);
  }

  @Query('getIAP')
  async getIAP(
    @Args('iapId', new ZodValidationPipe(MongoIdSchema))
    iapId: MongoId,
  ): Promise<IAP> {
    return this.activityProvidersService.getIAP(iapId);
  }

  @Query('getIAPs')
  async getIAPs(): Promise<IAP[]> {
    return this.activityProvidersService.getIAPs();
  }

  @Mutation('removeActivity')
  async removeActivity(
    @Args('activityId', new ZodValidationPipe(MongoIdSchema))
    activityId: MongoId,
  ): Promise<void> {
    return this.activityProvidersService.removeActivity(activityId);
  }

  @Mutation('removeActivityProvider')
  async removeActivityProvider(
    @Args('apId', new ZodValidationPipe(MongoIdSchema))
    apId: MongoId,
  ): Promise<void> {
    return this.activityProvidersService.removeActivityProvider(apId);
  }

  @Mutation('removeGoal')
  async removeGoal(
    @Args('goalId', new ZodValidationPipe(MongoIdSchema))
    goalId: MongoId,
  ): Promise<void> {
    return this.activityProvidersService.removeGoal(goalId);
  }

  @Mutation('removeIap')
  async removeIap(
    @Args('iapId', new ZodValidationPipe(MongoIdSchema))
    iapId: MongoId,
  ): Promise<void> {
    return this.activityProvidersService.removeIap(iapId);
  }
}
