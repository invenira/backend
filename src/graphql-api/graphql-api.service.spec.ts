import { GraphqlApiService } from './graphql-api.service';
import { Types } from 'mongoose';

/* eslint-disable */
/* tslint-disable */

describe('GraphqlApiService', () => {
  let service: GraphqlApiService;
  let mockIapService: any;
  const someId = new Types.ObjectId();

  beforeEach(() => {
    // Create a mock IAPService with all methods stubbed.
    mockIapService = {
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
    service = new GraphqlApiService(mockIapService);
  });

  it('should return activities from iapService', async () => {
    const activities = [{ id: '1' }, { id: '2' }];
    mockIapService.getActivities.mockResolvedValue(activities);
    const result = await service.getActivities();
    expect(result).toBe(activities);
    expect(mockIapService.getActivities).toHaveBeenCalled();
  });

  it('should return a single activity from iapService', async () => {
    const activity = { id: someId };
    mockIapService.getActivity.mockResolvedValue(activity);
    const result = await service.getActivity(someId);
    expect(result).toBe(activity);
    expect(mockIapService.getActivity).toHaveBeenCalledWith(someId);
  });

  it('should return an activity provider from iapService', async () => {
    const ap = { id: someId };
    mockIapService.getActivityProvider.mockResolvedValue(ap);
    const result = await service.getActivityProvider(someId);
    expect(result).toBe(ap);
    expect(mockIapService.getActivityProvider).toHaveBeenCalledWith(someId);
  });

  it('should return activity provider activities from iapService', async () => {
    const activities = [{ id: 'a1' }, { id: 'a2' }];
    mockIapService.getActivityProviderActivities.mockResolvedValue(activities);
    const result = await service.getActivityProviderActivities(someId);
    expect(result).toBe(activities);
    expect(mockIapService.getActivityProviderActivities).toHaveBeenCalledWith(
      someId,
    );
  });

  it('should return all activity providers from iapService', async () => {
    const providers = [{ id: 'ap1' }, { id: 'ap2' }];
    mockIapService.getActivityProviders.mockResolvedValue(providers);
    const result = await service.getActivityProviders();
    expect(result).toBe(providers);
    expect(mockIapService.getActivityProviders).toHaveBeenCalled();
  });

  it('should return configuration interface URL from iapService', async () => {
    const configInterface = { url: 'https://ap.com/interface' };
    mockIapService.getConfigurationInterfaceUrl.mockResolvedValue(
      configInterface,
    );
    const result = await service.getConfigurationInterfaceUrl(someId);
    expect(result).toEqual(configInterface);
    expect(mockIapService.getConfigurationInterfaceUrl).toHaveBeenCalledWith(
      someId,
    );
  });

  it('should return configuration parameters from iapService', async () => {
    const params = ['param1', 'param2'];
    mockIapService.getConfigurationParameters.mockResolvedValue(params);
    const result = await service.getConfigurationParameters(someId);
    expect(result).toEqual(params);
    expect(mockIapService.getConfigurationParameters).toHaveBeenCalledWith(
      someId,
    );
  });

  it('should return a single IAP from iapService', async () => {
    const iap = { id: someId };
    mockIapService.getIAP.mockResolvedValue(iap);
    const result = await service.getIAP(someId);
    expect(result).toBe(iap);
    expect(mockIapService.getIAP).toHaveBeenCalledWith(someId);
  });

  it('should return all IAPs from iapService', async () => {
    const iaps = [{ id: 'iap1' }, { id: 'iap2' }];
    mockIapService.getIAPs.mockResolvedValue(iaps);
    const result = await service.getIAPs();
    expect(result).toBe(iaps);
    expect(mockIapService.getIAPs).toHaveBeenCalled();
  });

  it('should return required fields from iapService', async () => {
    const fields = ['field1', 'field2'];
    mockIapService.getActivityProviderRequiredFields.mockResolvedValue(fields);
    const result = await service.getActivityProviderRequiredFields(someId);
    expect(result).toEqual(fields);
    expect(
      mockIapService.getActivityProviderRequiredFields,
    ).toHaveBeenCalledWith(someId);
  });

  it('should return available metrics from iapService', async () => {
    const metrics = [{ name: 'metric1' }];
    mockIapService.getIAPAvailableMetrics.mockResolvedValue(metrics);
    const result = await service.getIAPAvailableMetrics(someId);
    expect(result).toBe(metrics);
    expect(mockIapService.getIAPAvailableMetrics).toHaveBeenCalledWith(someId);
  });

  describe('createActivityProvider', () => {
    it('should set createdBy and updatedBy and call iapService.createActivityProvider', async () => {
      const input = { name: 'AP', description: 'desc', url: 'https://ap.com' };
      const expectedInput = {
        ...input,
      };
      const provider = { id: 'ap1', ...expectedInput };
      mockIapService.createActivityProvider.mockResolvedValue(provider);
      const result = await service.createActivityProvider(input);
      expect(result).toEqual(provider);
      expect(mockIapService.createActivityProvider).toHaveBeenCalledWith(
        expectedInput,
      );
    });
  });

  describe('removeActivityProvider', () => {
    it('should call iapService.removeActivityProvider', async () => {
      mockIapService.removeActivityProvider.mockResolvedValue(undefined);
      await service.removeActivityProvider(someId);
      expect(mockIapService.removeActivityProvider).toHaveBeenCalledWith(
        someId,
      );
    });
  });

  describe('createActivity', () => {
    it('should set createdBy and updatedBy and call iapService.createActivity', async () => {
      const iapId = someId;
      const input = {
        name: 'Activity',
        description: 'desc',
        activityProviderId: someId,
        parameters: {},
      };
      const expectedInput = {
        ...input,
      };
      const activity = { id: 'act1', ...expectedInput };
      mockIapService.createActivity.mockResolvedValue(activity);
      const result = await service.createActivity(iapId, input);
      expect(result).toEqual(activity);
      expect(mockIapService.createActivity).toHaveBeenCalledWith(
        iapId,
        expectedInput,
      );
    });
  });

  describe('removeActivity', () => {
    it('should call iapService.removeActivity', async () => {
      mockIapService.removeActivity.mockResolvedValue(undefined);
      await service.removeActivity(someId);
      expect(mockIapService.removeActivity).toHaveBeenCalledWith(someId);
    });
  });

  describe('createGoal', () => {
    it('should set createdBy and updatedBy and call iapService.createGoal', async () => {
      const iapId = someId;
      const input = {
        name: 'Goal',
        description: 'desc',
        formula: '1+1',
        targetValue: 2,
      };
      const expectedInput = {
        ...input,
      };
      const goal = { id: 'goal1', ...expectedInput };
      mockIapService.createGoal.mockResolvedValue(goal);
      const result = await service.createGoal(iapId, input);
      expect(result).toEqual(goal);
      expect(mockIapService.createGoal).toHaveBeenCalledWith(
        iapId,
        expectedInput,
      );
    });
  });

  describe('removeGoal', () => {
    it('should call iapService.removeGoal', async () => {
      mockIapService.removeGoal.mockResolvedValue(undefined);
      await service.removeGoal(someId);
      expect(mockIapService.removeGoal).toHaveBeenCalledWith(someId);
    });
  });

  describe('createIap', () => {
    it('should set createdBy and updatedBy and call iapService.createIap', async () => {
      const input = { name: 'IAP', description: 'desc' };
      const expectedInput = {
        ...input,
      };
      const iap = { id: 'iap1', ...expectedInput };
      mockIapService.createIap.mockResolvedValue(iap);
      const result = await service.createIap(input);
      expect(result).toEqual(iap);
      expect(mockIapService.createIap).toHaveBeenCalledWith(expectedInput);
    });
  });

  describe('removeIap', () => {
    it('should call iapService.removeIap', async () => {
      mockIapService.removeIap.mockResolvedValue(undefined);
      await service.removeIap(someId);
      expect(mockIapService.removeIap).toHaveBeenCalledWith(someId);
    });
  });

  describe('deployIap', () => {
    it('should call iapService.deployIap', async () => {
      mockIapService.deployIap.mockResolvedValue(undefined);
      await service.deployIap(someId);
      expect(mockIapService.deployIap).toHaveBeenCalledWith(someId);
    });
  });
});
