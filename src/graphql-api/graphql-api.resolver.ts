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
  MetricGQLSchema,
  MongoId,
  MongoIdSchema,
} from '@invenira/schemas';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import {
  GqlAuthGuard,
  INSTRUCTOR_ROLES,
  Public,
  Roles,
  RolesGuard,
} from '../auth';
import { ZodValidationPipe } from '../pipes';
import { ContextInterceptor } from '../context/context.interceptor';

@Resolver('IAPGQLSchema')
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles(...INSTRUCTOR_ROLES)
@UseInterceptors(ContextInterceptor)
export class GraphqlApiResolver implements IQuery, IMutation {
  constructor(private readonly graphqlApiService: GraphqlApiService) {}

  @Query('getActivities')
  async getActivities(): Promise<Activity[]> {
    return this.graphqlApiService.getActivities();
  }

  @Query('getActivity')
  async getActivity(
    @Args('activityId', new ZodValidationPipe(MongoIdSchema))
    activityId: MongoId,
  ): Promise<Activity> {
    return this.graphqlApiService.getActivity(activityId);
  }

  @Query('getActivityProvider')
  async getActivityProvider(
    @Args('apId', new ZodValidationPipe(MongoIdSchema))
    apId: MongoId,
  ): Promise<ActivityProvider> {
    return this.graphqlApiService.getActivityProvider(apId);
  }

  @Query('getActivityProviderActivities')
  async getActivityProviderActivities(
    @Args('apId', new ZodValidationPipe(MongoIdSchema))
    apId: MongoId,
  ): Promise<Activity[]> {
    return this.graphqlApiService.getActivityProviderActivities(apId);
  }

  @Query('getActivityProviders')
  async getActivityProviders(): Promise<ActivityProvider[]> {
    return this.graphqlApiService.getActivityProviders();
  }

  @Query('getConfigurationInterfaceUrl')
  async getConfigurationInterfaceUrl(
    @Args('apId', new ZodValidationPipe(MongoIdSchema))
    apId: MongoId,
  ): Promise<ConfigInterface> {
    return this.graphqlApiService.getConfigurationInterfaceUrl(apId);
  }

  @Query('getConfigurationParameters')
  async getConfigurationParameters(
    @Args('apId', new ZodValidationPipe(MongoIdSchema))
    apId: MongoId,
  ): Promise<string[]> {
    return this.graphqlApiService.getConfigurationParameters(apId);
  }

  @Query('getIAP')
  async getIAP(
    @Args('iapId', new ZodValidationPipe(MongoIdSchema))
    iapId: MongoId,
  ): Promise<IAP> {
    return this.graphqlApiService.getIAP(iapId);
  }

  @Query('getIAPs')
  async getIAPs(): Promise<IAP[]> {
    return this.graphqlApiService.getIAPs();
  }

  @Query('getActivityProviderRequiredFields')
  async getActivityProviderRequiredFields(
    @Args('apId', new ZodValidationPipe(MongoIdSchema))
    apId: MongoId,
  ): Promise<string[]> {
    return this.graphqlApiService.getActivityProviderRequiredFields(apId);
  }

  @Query('getIAPAvailableMetrics')
  async getIAPAvailableMetrics(
    @Args('iapId', new ZodValidationPipe(MongoIdSchema))
    iapId: MongoId,
  ): Promise<MetricGQLSchema[]> {
    return this.graphqlApiService.getIAPAvailableMetrics(iapId);
  }

  @Mutation('createActivityProvider')
  async createActivityProvider(
    @Args(
      'createActivityProviderInput',
      new ZodValidationPipe(CreateActivityProviderSchema),
    )
    createActivityProvider: CreateActivityProvider,
  ): Promise<ActivityProvider> {
    return this.graphqlApiService.createActivityProvider(
      createActivityProvider,
    );
  }

  @Mutation('removeActivityProvider')
  async removeActivityProvider(
    @Args('apId', new ZodValidationPipe(MongoIdSchema))
    apId: MongoId,
  ): Promise<void> {
    return this.graphqlApiService.removeActivityProvider(apId);
  }

  @Mutation('createActivity')
  async createActivity(
    @Args('iapId', new ZodValidationPipe(MongoIdSchema))
    iapId: MongoId,
    @Args('createActivityInput', new ZodValidationPipe(CreateActivitySchema))
    createActivity: CreateActivity,
  ): Promise<Activity> {
    return this.graphqlApiService.createActivity(iapId, createActivity);
  }

  @Mutation('removeActivity')
  async removeActivity(
    @Args('activityId', new ZodValidationPipe(MongoIdSchema))
    activityId: MongoId,
  ): Promise<void> {
    return this.graphqlApiService.removeActivity(activityId);
  }

  @Mutation('createGoal')
  async createGoal(
    @Args('iapId', new ZodValidationPipe(MongoIdSchema))
    iapId: MongoId,
    @Args('createGoalInput', new ZodValidationPipe(CreateGoalSchema))
    createGoal: CreateGoal,
  ): Promise<Goal> {
    return this.graphqlApiService.createGoal(iapId, createGoal);
  }

  @Mutation('removeGoal')
  async removeGoal(
    @Args('goalId', new ZodValidationPipe(MongoIdSchema))
    goalId: MongoId,
  ): Promise<void> {
    return this.graphqlApiService.removeGoal(goalId);
  }

  @Mutation('createIap')
  async createIap(
    @Args('createIapInput', new ZodValidationPipe(CreateIAPSchema))
    createIap: CreateIAP,
  ): Promise<IAP> {
    return this.graphqlApiService.createIap(createIap);
  }

  @Mutation('removeIap')
  async removeIap(
    @Args('iapId', new ZodValidationPipe(MongoIdSchema))
    iapId: MongoId,
  ): Promise<void> {
    return this.graphqlApiService.removeIap(iapId);
  }

  @Mutation('deployIap')
  async deployIap(
    @Args('iapId', new ZodValidationPipe(MongoIdSchema))
    iapId: MongoId,
  ): Promise<void> {
    return this.graphqlApiService.deployIap(iapId);
  }

  @Public()
  @Roles()
  @Mutation('provideActivity')
  provideActivity(
    @Args('activityId', new ZodValidationPipe(MongoIdSchema))
    activityId: string,
    @Args('lmsUserId')
    lmsUserId: string,
  ): string | Promise<string> {
    // TODO: Fix schemas, activityId should be MongoIdScalar instead of String
    return this.graphqlApiService.provideActivity(activityId, lmsUserId);
  }
}
