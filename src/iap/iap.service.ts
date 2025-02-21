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

  async createActivity(
    apId: MongoId,
    createActivity: CreateActivity,
  ): Promise<Activity> {
    const ap = await this.getActivityProvider(apId);

    if (
      ap.activities.some(
        (activity) =>
          activity.name === createActivity.name ||
          activity.description === createActivity.description,
      )
    ) {
      throw new BadRequestException('Activity already exists');
    }

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

    return this.dbService.createActivity(apId, createActivity);
  }

  async createActivityProvider(
    iapId: MongoId,
    createActivityProvider: CreateActivityProvider,
  ): Promise<ActivityProvider> {
    const iap = await this.getIAP(iapId);

    try {
      await this.getApClient(createActivityProvider.url).getConfigParameters();
    } catch (error) {
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Unable to contact Activity Provider: ${error.message}`,
      );
    }

    if (
      iap.activityProviders.some(
        (provider) =>
          provider.name === createActivityProvider.name ||
          provider.url === createActivityProvider.url,
      )
    ) {
      throw new BadRequestException('Activity Provider already exists');
    }

    return this.dbService.createActivityProvider(iapId, createActivityProvider);
  }

  async createGoal(iapId: MongoId, createGoal: CreateGoal): Promise<Goal> {
    const iap = await this.getIAP(iapId);

    if (
      iap.goals.some(
        (provider) =>
          provider.name === createGoal.name ||
          provider.formula === createGoal.formula,
      )
    ) {
      throw new BadRequestException('Goal already exists');
    }

    // TODO: Contact middleware to validate Goal Formula

    return this.dbService.createGoal(iapId, createGoal);
  }

  async createIap(createIap: CreateIAP): Promise<IAP> {
    return this.dbService.createIap(createIap);
  }

  async deployIap(iapId: MongoId): Promise<void> {
    const iap = await this.getIAP(iapId);

    for (const ap of iap.activityProviders) {
      const apClient = this.getApClient(ap.url);

      for (const activity of ap.activities) {
        await apClient
          .deploy(
            { parameters: activity.parameters },
            { params: { id: activity._id.toString() } },
          )
          .catch((err: { message: string }) => {
            throw new BadRequestException(
              `Unable to contact Activity Provider: ${err.message}`,
            );
          });
      }
    }

    await this.dbService.deployIap(iapId);
  }

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
    return this.getActivityProvider(apId).then((ap) => ap.activities);
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
    const contracts = await Promise.all(
      iap.activityProviders.map((ap) =>
        this.getApClient(ap.url)
          .getAnalyticsContract()
          .then((contract) => {
            const contracts: {
              qualAnalytics: MetricGQLSchema[];
              quantAnalytics: MetricGQLSchema[];
            }[] = [];

            ap.activities.forEach((activity) => {
              contracts.push({
                qualAnalytics:
                  contract.qualAnalytics?.map((metric) => ({
                    name:
                      this.sanitizeString(activity.name) + '.' + metric.name,
                    description: '',
                    type: metric.type || '',
                  })) || [],
                quantAnalytics:
                  contract.quantAnalytics?.map((metric) => ({
                    name:
                      this.sanitizeString(activity.name) + '.' + metric.name,
                    description: '',
                    type: metric.type || '',
                  })) || [],
              });
            });

            return contracts;
          }),
      ),
    ).then((contracts) => contracts.flat());

    const metrics: MetricGQLSchema[] = [];
    contracts.forEach((contract) => {
      contract.qualAnalytics?.forEach((qualAnalytic) =>
        metrics.push({
          name: qualAnalytic.name || '',
          type: (qualAnalytic.type as string) || 'string',
          description: '',
        }),
      );
      contract.quantAnalytics?.forEach((quantAnalytic) =>
        metrics.push({
          name: quantAnalytic.name || '',
          type: (quantAnalytic.type as string) || 'string',
          description: '',
        }),
      );
    });

    return metrics;
  }

  async removeActivity(activityId: MongoId): Promise<void> {
    await this.dbService.removeActivity(activityId);
  }

  async removeActivityProvider(apId: MongoId): Promise<void> {
    const ap = await this.getActivityProvider(apId);

    if (ap.activities.length > 0) {
      throw new BadRequestException('Activity Provider contains Activities');
    }

    await this.dbService.removeActivityProvider(apId);
  }

  async removeGoal(goalId: MongoId): Promise<void> {
    await this.dbService.removeGoal(goalId);
  }

  async removeIap(iapId: MongoId): Promise<void> {
    await this.dbService.removeIap(iapId);
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
