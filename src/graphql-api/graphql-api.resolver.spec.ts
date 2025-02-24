import { GraphqlApiResolver } from './graphql-api.resolver';
import { GraphqlApiService } from './graphql-api.service';
import { Types } from 'mongoose';

/* tslint-disable */

describe('GraphqlApiResolver', () => {
  let resolver: GraphqlApiResolver;
  let mockService: Partial<GraphqlApiService>;
  const sampleId = new Types.ObjectId();

  beforeEach(() => {
    // Create a mock GraphqlApiService with all methods stubbed.
    mockService = {
      getActivities: jest.fn(),
      getActivity: jest.fn(),
      getActivityProvider: jest.fn(),
      getActivityProviderActivities: jest.fn(),
      getActivityProviders: jest.fn(),
      getConfigurationInterfaceUrl: jest.fn(),
      getConfigurationParameters: jest.fn(),
      getIAP: jest.fn(),
      getIAPs: jest.fn(),
      getActivityProviderRequiredFields: jest.fn(),
      getIAPAvailableMetrics: jest.fn(),
      createActivityProvider: jest.fn(),
      removeActivityProvider: jest.fn(),
      createActivity: jest.fn(),
      removeActivity: jest.fn(),
      createGoal: jest.fn(),
      removeGoal: jest.fn(),
      createIap: jest.fn(),
      removeIap: jest.fn(),
      deployIap: jest.fn(),
    };
    resolver = new GraphqlApiResolver(mockService as GraphqlApiService);
  });

  describe('Queries', () => {
    it('getActivities should delegate to service.getActivities', async () => {
      const activities = [{ id: 'act1' }];
      (mockService.getActivities as jest.Mock).mockResolvedValue(activities);
      const result = await resolver.getActivities();
      expect(result).toEqual(activities);
      expect(mockService.getActivities).toHaveBeenCalled();
    });

    it('getActivity should delegate to service.getActivity', async () => {
      const activity = { id: sampleId };
      (mockService.getActivity as jest.Mock).mockResolvedValue(activity);
      const result = await resolver.getActivity(sampleId);
      expect(result).toEqual(activity);
      expect(mockService.getActivity).toHaveBeenCalledWith(sampleId);
    });

    it('getActivityProvider should delegate to service.getActivityProvider', async () => {
      const provider = { id: sampleId };
      (mockService.getActivityProvider as jest.Mock).mockResolvedValue(
        provider,
      );
      const result = await resolver.getActivityProvider(sampleId);
      expect(result).toEqual(provider);
      expect(mockService.getActivityProvider).toHaveBeenCalledWith(sampleId);
    });

    it('getActivityProviderActivities should delegate to service.getActivityProviderActivities', async () => {
      const activities = [{ id: 'act1' }];
      (
        mockService.getActivityProviderActivities as jest.Mock
      ).mockResolvedValue(activities);
      const result = await resolver.getActivityProviderActivities(sampleId);
      expect(result).toEqual(activities);
      expect(mockService.getActivityProviderActivities).toHaveBeenCalledWith(
        sampleId,
      );
    });

    it('getActivityProviders should delegate to service.getActivityProviders', async () => {
      const providers = [{ id: 'ap1' }];
      (mockService.getActivityProviders as jest.Mock).mockResolvedValue(
        providers,
      );
      const result = await resolver.getActivityProviders();
      expect(result).toEqual(providers);
      expect(mockService.getActivityProviders).toHaveBeenCalled();
    });

    it('getConfigurationInterfaceUrl should delegate to service.getConfigurationInterfaceUrl', async () => {
      const configInterface = { url: 'https://ap.com/interface' };
      (mockService.getConfigurationInterfaceUrl as jest.Mock).mockResolvedValue(
        configInterface,
      );
      const result = await resolver.getConfigurationInterfaceUrl(sampleId);
      expect(result).toEqual(configInterface);
      expect(mockService.getConfigurationInterfaceUrl).toHaveBeenCalledWith(
        sampleId,
      );
    });

    it('getConfigurationParameters should delegate to service.getConfigurationParameters', async () => {
      const params = ['param1', 'param2'];
      (mockService.getConfigurationParameters as jest.Mock).mockResolvedValue(
        params,
      );
      const result = await resolver.getConfigurationParameters(sampleId);
      expect(result).toEqual(params);
      expect(mockService.getConfigurationParameters).toHaveBeenCalledWith(
        sampleId,
      );
    });

    it('getIAP should delegate to service.getIAP', async () => {
      const iap = { id: sampleId };
      (mockService.getIAP as jest.Mock).mockResolvedValue(iap);
      const result = await resolver.getIAP(sampleId);
      expect(result).toEqual(iap);
      expect(mockService.getIAP).toHaveBeenCalledWith(sampleId);
    });

    it('getIAPs should delegate to service.getIAPs', async () => {
      const iaps = [{ id: 'iap1' }];
      (mockService.getIAPs as jest.Mock).mockResolvedValue(iaps);
      const result = await resolver.getIAPs();
      expect(result).toEqual(iaps);
      expect(mockService.getIAPs).toHaveBeenCalled();
    });

    it('getActivityProviderRequiredFields should delegate to service.getActivityProviderRequiredFields', async () => {
      const fields = ['field1', 'field2'];
      (
        mockService.getActivityProviderRequiredFields as jest.Mock
      ).mockResolvedValue(fields);
      const result = await resolver.getActivityProviderRequiredFields(sampleId);
      expect(result).toEqual(fields);
      expect(
        mockService.getActivityProviderRequiredFields,
      ).toHaveBeenCalledWith(sampleId);
    });

    it('getIAPAvailableMetrics should delegate to service.getIAPAvailableMetrics', async () => {
      const metrics = [{ name: 'metric1' }];
      (mockService.getIAPAvailableMetrics as jest.Mock).mockResolvedValue(
        metrics,
      );
      const result = await resolver.getIAPAvailableMetrics(sampleId);
      expect(result).toEqual(metrics);
      expect(mockService.getIAPAvailableMetrics).toHaveBeenCalledWith(sampleId);
    });
  });

  describe('Mutations', () => {
    it('createActivityProvider should delegate to service.createActivityProvider', async () => {
      const input = { name: 'AP', description: 'desc', url: 'https://ap.com' };
      const provider = { id: sampleId, ...input };
      (mockService.createActivityProvider as jest.Mock).mockResolvedValue(
        provider,
      );
      const result = await resolver.createActivityProvider(input);
      expect(result).toEqual(provider);
      expect(mockService.createActivityProvider).toHaveBeenCalledWith(input);
    });

    it('removeActivityProvider should delegate to service.removeActivityProvider', async () => {
      (mockService.removeActivityProvider as jest.Mock).mockResolvedValue(
        undefined,
      );
      await resolver.removeActivityProvider(sampleId);
      expect(mockService.removeActivityProvider).toHaveBeenCalledWith(sampleId);
    });

    it('createActivity should delegate to service.createActivity', async () => {
      const iapId = sampleId;
      const input = {
        name: 'Activity',
        description: 'desc',
        activityProviderId: sampleId,
        parameters: {},
      };
      const activity = { id: sampleId, ...input };
      (mockService.createActivity as jest.Mock).mockResolvedValue(activity);
      const result = await resolver.createActivity(iapId, input);
      expect(result).toEqual(activity);
      expect(mockService.createActivity).toHaveBeenCalledWith(iapId, input);
    });

    it('removeActivity should delegate to service.removeActivity', async () => {
      (mockService.removeActivity as jest.Mock).mockResolvedValue(undefined);
      await resolver.removeActivity(sampleId);
      expect(mockService.removeActivity).toHaveBeenCalledWith(sampleId);
    });

    it('createGoal should delegate to service.createGoal', async () => {
      const iapId = sampleId;
      const input = {
        name: 'Goal',
        description: 'desc',
        formula: '1+1',
        targetValue: 2,
      };
      const goal = { id: sampleId, ...input };
      (mockService.createGoal as jest.Mock).mockResolvedValue(goal);
      const result = await resolver.createGoal(iapId, input);
      expect(result).toEqual(goal);
      expect(mockService.createGoal).toHaveBeenCalledWith(iapId, input);
    });

    it('removeGoal should delegate to service.removeGoal', async () => {
      (mockService.removeGoal as jest.Mock).mockResolvedValue(undefined);
      await resolver.removeGoal(sampleId);
      expect(mockService.removeGoal).toHaveBeenCalledWith(sampleId);
    });

    it('createIap should delegate to service.createIap', async () => {
      const input = { name: 'IAP', description: 'desc' };
      const iap = { id: sampleId, ...input };
      (mockService.createIap as jest.Mock).mockResolvedValue(iap);
      const result = await resolver.createIap(input);
      expect(result).toEqual(iap);
      expect(mockService.createIap).toHaveBeenCalledWith(input);
    });

    it('removeIap should delegate to service.removeIap', async () => {
      (mockService.removeIap as jest.Mock).mockResolvedValue(undefined);
      await resolver.removeIap(sampleId);
      expect(mockService.removeIap).toHaveBeenCalledWith(sampleId);
    });

    it('deployIap should delegate to service.deployIap', async () => {
      (mockService.deployIap as jest.Mock).mockResolvedValue(undefined);
      await resolver.deployIap(sampleId);
      expect(mockService.deployIap).toHaveBeenCalledWith(sampleId);
    });
  });
});
