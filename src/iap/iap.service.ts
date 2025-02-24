import {
  Activity,
  ActivityProvider,
  ActivityProviderAPI,
  ConfigInterface,
  CreateActivity,
  CreateActivityProvider,
  createActivityProviderClient,
  createDynamicSchema,
  CreateGoal,
  CreateIAP,
  Goal,
  IAP,
  IMutation,
  IQuery,
  MetricGQLSchema,
  MongoId,
} from '@invenira/schemas';
import { BadRequestException, Inject } from '@nestjs/common';
import { DB_SERVICE, DbService } from '../db/db.service';

export class IAPService implements IQuery, IMutation {
  private readonly apClients: Map<string, typeof ActivityProviderAPI> =
    new Map();

  constructor(@Inject(DB_SERVICE) private readonly dbService: DbService) {}

  async getActivities(): Promise<Activity[]> {
    return this.dbService.getActivities();
  }

  async getActivity(activityId: MongoId): Promise<Activity> {
    return this.dbService.getActivity(activityId);
  }

  async getActivityProvider(apId: MongoId): Promise<ActivityProvider> {
    return this.dbService.getActivityProvider(apId);
  }

  async getActivityProviderActivities(apId: MongoId): Promise<Activity[]> {
    return this.dbService.getActivityProviderActivities(apId);
  }

  async getActivityProviders(): Promise<ActivityProvider[]> {
    return this.dbService.getActivityProviders();
  }

  async getConfigurationInterfaceUrl(apId: MongoId): Promise<ConfigInterface> {
    const ap = await this.getActivityProvider(apId);

    return this.getApClient(ap.url)
      .getConfigInterface()
      .then((configInterface) => {
        return { url: configInterface.interfaceUrl };
      });
  }

  async getConfigurationParameters(apId: MongoId): Promise<string[]> {
    const ap = await this.getActivityProvider(apId);

    return this.getApClient(ap.url)
      .getConfigParameters()
      .then((parameters) => parameters.map((par) => par.name));
  }

  async getIAP(iapId: MongoId): Promise<IAP> {
    return this.dbService.getIAP(iapId);
  }

  async getIAPs(): Promise<IAP[]> {
    return this.dbService.getIAPs();
  }

  async getActivityProviderRequiredFields(apId: MongoId): Promise<string[]> {
    const ap = await this.getActivityProvider(apId);

    return this.getApClient(ap.url)
      .getConfigParameters()
      .then((parameters) => parameters.map((par) => par.name));
  }

  async getIAPAvailableMetrics(iapId: MongoId): Promise<MetricGQLSchema[]> {
    const iap = await this.getIAP(iapId);

    return await Promise.all(
      iap.activityIds.map(async (activityId) => {
        const activity = await this.getActivity(activityId);

        const ap = await this.getActivityProvider(activity.activityProviderId);

        // TODO: Buffer response, more than one activity might use the same AP
        const contract = await this.getApClient(ap.url).getAnalyticsContract();

        return [
          contract.qualAnalytics?.map((metric) => ({
            name: this.sanitizeString(activity.name) + '.' + metric.name,
            description: '',
            type: metric.type || '',
          })) || [],
          contract.quantAnalytics?.map((metric) => ({
            name: this.sanitizeString(activity.name) + '.' + metric.name,
            description: '',
            type: metric.type || '',
          })) || [],
        ];
      }),
    ).then((contracts) => contracts.flat(2));
  }

  async createActivityProvider(
    createActivityProvider: CreateActivityProvider,
  ): Promise<ActivityProvider> {
    try {
      await this.getApClient(createActivityProvider.url).getConfigParameters();
    } catch (error) {
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Unable to contact Activity Provider: ${error.message}`,
      );
    }

    return this.dbService.createActivityProvider(createActivityProvider);
  }

  async removeActivityProvider(apId: MongoId): Promise<void> {
    await this.dbService.removeActivityProvider(apId);
  }

  async createActivity(
    iapId: MongoId,
    createActivity: CreateActivity,
  ): Promise<Activity> {
    const ap = await this.getActivityProvider(
      createActivity.activityProviderId,
    );

    const atSchema = await this.getApClient(ap.url)
      .getConfigParameters()
      .then((parameters) => createDynamicSchema(parameters))
      .catch((err: { message: string }) => {
        throw new BadRequestException(
          `Unable to contact Activity Provider: ${err.message}`,
        );
      });

    try {
      atSchema.parse(createActivity.parameters);
    } catch (e: unknown) {
      throw new BadRequestException(
        `Activity parameter validation failed: ${(
          e as { errors: { message: string }[] }
        ).errors
          .map((e: { message: string }) => e.message)
          .join('; ')}`,
      );
    }

    return this.dbService.createActivity(iapId, createActivity);
  }

  async removeActivity(activityId: MongoId): Promise<void> {
    await this.dbService.removeActivity(activityId);
  }

  async createGoal(iapId: MongoId, createGoal: CreateGoal): Promise<Goal> {
    return this.dbService.createGoal(iapId, createGoal);
  }

  async removeGoal(goalId: MongoId): Promise<void> {
    await this.dbService.removeGoal(goalId);
  }

  async createIap(createIap: CreateIAP): Promise<IAP> {
    return this.dbService.createIap(createIap);
  }

  async removeIap(iapId: MongoId): Promise<void> {
    await this.dbService.removeIap(iapId);
  }

  async deployIap(iapId: MongoId): Promise<void> {
    const iap = await this.getIAP(iapId);

    for (const activityId of iap.activityIds) {
      const activity = await this.getActivity(activityId);
      const ap = await this.getActivityProvider(activity.activityProviderId);

      await this.getApClient(ap.url)
        .deploy(
          { parameters: activity.parameters },
          { params: { id: activity._id.toString() } },
        )
        .catch((err: { message: string }) => {
          throw new BadRequestException(
            `Unable to contact Activity Provider: ${err.message}`,
          );
        });
      // TODO: add an endpoint to AP API to "un-deploy" an activity in case
      //   something goes wrong and we need to "un-deploy" the already deployed
      //   ones.
    }

    await this.dbService.deployIap(iapId);
  }

  private getApClient(url: string): typeof ActivityProviderAPI {
    let client = this.apClients.get(url);

    if (!client) {
      client = createActivityProviderClient(url);
      this.apClients.set(url, client);
    }

    return client;
  }

  private sanitizeString(input: string): string {
    const withUnderscores = input.replace(/\s+/g, '_');

    return withUnderscores.replace(/[^A-Za-z0-9_]/g, '');
  }
}
