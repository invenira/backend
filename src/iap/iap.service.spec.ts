import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { IAPService } from './iap.service';
import { Types } from 'mongoose';
import { createActivityProviderClient } from '@invenira/schemas';

/* eslint-disable */
/* tslint-disable */

// Define a fake AP client to be used in the mock.
const fakeClient = {
  getConfigInterface: jest
    .fn()
    .mockResolvedValue({ interfaceUrl: 'https://ap.com/interface' }),
  getConfigParameters: jest.fn().mockResolvedValue([{ name: 'param1' }]),
  getAnalyticsContract: jest.fn().mockResolvedValue({
    qualAnalytics: [{ name: 'metric1', type: 'string' }],
    quantAnalytics: [{ name: 'metric2', type: 'number' }],
  }),
  deploy: jest.fn().mockResolvedValue(undefined),
};

// Mock the external functions from '@invenira/schemas'
jest.mock('@invenira/schemas', () => {
  const actual = jest.requireActual('@invenira/schemas');
  return {
    ...actual,
    createActivityProviderClient: jest.fn(() => fakeClient),
    createDynamicSchema: jest.fn((parameters: { name: string }[]) => {
      // Build a zod schema requiring each parameter name to be a string.
      const shape: Record<string, any> = {};
      parameters.forEach((p) => {
        shape[p.name] = z.string();
      });
      return z.object(shape);
    }),
  };
});

const mockDbService = {
  getActivities: jest.fn(),
  getActivity: jest.fn(),
  getActivityProvider: jest.fn(),
  getActivityProviderActivities: jest.fn(),
  getActivityProviders: jest.fn(),
  getIAP: jest.fn(),
  getIAPs: jest.fn(),
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

const id = new Types.ObjectId();

describe('IAPService', () => {
  // Create a new instance of the service for each test.
  let service: IAPService;
  beforeEach(() => {
    // Clear all previous invocations.
    jest.clearAllMocks();
    service = new IAPService(mockDbService as any);
  });

  it('should return activities from dbService', async () => {
    const activities = [{ id: '1' }, { id: '2' }];
    mockDbService.getActivities.mockResolvedValue(activities);
    const result = await service.getActivities();
    expect(result).toBe(activities);
    expect(mockDbService.getActivities).toHaveBeenCalled();
  });

  it('should return a single activity', async () => {
    const activity = { id };
    mockDbService.getActivity.mockResolvedValue(activity);
    const result = await service.getActivity(id);
    expect(result).toBe(activity);
    expect(mockDbService.getActivity).toHaveBeenCalledWith(id);
  });

  it('should return an activity provider', async () => {
    const ap = { url: 'https://ap.com' };
    mockDbService.getActivityProvider.mockResolvedValue(ap);
    const result = await service.getActivityProvider(id);
    expect(result).toBe(ap);
    expect(mockDbService.getActivityProvider).toHaveBeenCalledWith(id);
  });

  it('should return activities for a given activity provider', async () => {
    const activities = [{ id: 'act1' }, { id: 'act2' }];
    mockDbService.getActivityProviderActivities.mockResolvedValue(activities);
    const result = await service.getActivityProviderActivities(id);
    expect(result).toBe(activities);
    expect(mockDbService.getActivityProviderActivities).toHaveBeenCalledWith(
      id,
    );
  });

  it('should return all activity providers', async () => {
    const providers = [{ id: 'ap1' }, { id: 'ap2' }];
    mockDbService.getActivityProviders.mockResolvedValue(providers);
    const result = await service.getActivityProviders();
    expect(result).toBe(providers);
    expect(mockDbService.getActivityProviders).toHaveBeenCalled();
  });

  it('should return configuration interface URL from the AP client', async () => {
    const ap = { url: 'https://ap.com' };
    mockDbService.getActivityProvider.mockResolvedValue(ap);
    const result = await service.getConfigurationInterfaceUrl(id);
    expect(result).toEqual({ url: 'https://ap.com/interface' });
    expect(fakeClient.getConfigInterface).toHaveBeenCalled();
  });

  it('should return configuration parameters names from the AP client', async () => {
    const ap = { url: 'https://ap.com' };
    mockDbService.getActivityProvider.mockResolvedValue(ap);
    fakeClient.getConfigParameters.mockResolvedValue([
      { name: 'param1' },
      { name: 'param2' },
    ]);
    const result = await service.getConfigurationParameters(id);
    expect(result).toEqual(['param1', 'param2']);
  });

  it('should return required fields from the AP client', async () => {
    const ap = { url: 'https://ap.com' };
    mockDbService.getActivityProvider.mockResolvedValue(ap);
    fakeClient.getConfigParameters.mockResolvedValue([
      { name: 'requiredField' },
    ]);
    const result = await service.getActivityProviderRequiredFields(id);
    expect(result).toEqual(['requiredField']);
  });

  it('should return a single IAP', async () => {
    const iap = { id: 'iap1' };
    mockDbService.getIAP.mockResolvedValue(iap);
    const result = await service.getIAP(id);
    expect(result).toBe(iap);
    expect(mockDbService.getIAP).toHaveBeenCalledWith(id);
  });

  it('should return all IAPs', async () => {
    const iaps = [{ id: 'iap1' }, { id: 'iap2' }];
    mockDbService.getIAPs.mockResolvedValue(iaps);
    const result = await service.getIAPs();
    expect(result).toBe(iaps);
    expect(mockDbService.getIAPs).toHaveBeenCalled();
  });

  it('should return available metrics for an IAP', async () => {
    // Setup an IAP with one activity.
    const iap = { activityIds: ['act1'] };
    const activity = {
      _id: { toString: () => 'act1' },
      name: 'Test Activity',
      activityProviderId: 'ap1',
    };
    const ap = { url: 'https://ap.com' };
    mockDbService.getIAP.mockResolvedValue(iap);
    mockDbService.getActivity.mockResolvedValue(activity);
    mockDbService.getActivityProvider.mockResolvedValue(ap);
    fakeClient.getAnalyticsContract.mockResolvedValue({
      qualAnalytics: [{ name: 'metric1', type: 'string' }],
      quantAnalytics: [{ name: 'metric2', type: 'number' }],
    });
    let metrics = await service.getIAPAvailableMetrics(id);
    expect(metrics).toEqual([
      { name: 'Test_Activity.metric1', description: '', type: 'string' },
      { name: 'Test_Activity.metric2', description: '', type: 'number' },
    ]);
    fakeClient.getAnalyticsContract.mockResolvedValue({
      qualAnalytics: [{ name: 'metric1' }],
      quantAnalytics: [{ name: 'metric2' }],
    });
    metrics = await service.getIAPAvailableMetrics(id);
    expect(metrics).toEqual([
      { name: 'Test_Activity.metric1', description: '', type: '' },
      { name: 'Test_Activity.metric2', description: '', type: '' },
    ]);
  });

  describe('createActivityProvider', () => {
    const providerData = {
      name: 'test',
      description: 'test',
      url: 'https://ap.com',
    };

    it('should create an activity provider if config parameters are accessible', async () => {
      fakeClient.getConfigParameters.mockResolvedValue([{ name: 'param1' }]);
      mockDbService.createActivityProvider.mockResolvedValue(providerData);
      const result = await service.createActivityProvider(providerData);
      expect(result).toEqual(providerData);
      expect(fakeClient.getConfigParameters).toHaveBeenCalled();
      expect(mockDbService.createActivityProvider).toHaveBeenCalledWith(
        providerData,
      );
    });

    it('should throw BadRequestException if unable to contact AP', async () => {
      fakeClient.getConfigParameters.mockRejectedValue(
        new Error('Connection error'),
      );
      await expect(
        service.createActivityProvider(providerData),
      ).rejects.toThrow(BadRequestException);
    });
  });

  it('should remove an activity provider', async () => {
    mockDbService.removeActivityProvider.mockResolvedValue(undefined);
    await service.removeActivityProvider(id);
    expect(mockDbService.removeActivityProvider).toHaveBeenCalledWith(id);
  });

  describe('createActivity', () => {
    const createActivityData = {
      name: 'test',
      description: 'test',
      activityProviderId: new Types.ObjectId(),
      parameters: { param1: 'validValue' },
    };

    it('should create an activity if parameters are valid', async () => {
      const iapId = new Types.ObjectId();
      const ap = { url: 'https://ap.com' };
      // getActivityProvider will return the AP for the given ID.
      mockDbService.getActivityProvider.mockResolvedValue(ap);
      fakeClient.getConfigParameters.mockResolvedValue([{ name: 'param1' }]);
      const createdActivity = { id: 'act1' };
      mockDbService.createActivity.mockResolvedValue(createdActivity);

      const result = await service.createActivity(iapId, createActivityData);
      expect(result).toEqual(createdActivity);
      expect(mockDbService.createActivity).toHaveBeenCalledWith(
        iapId,
        createActivityData,
      );
    });

    it('should throw BadRequestException if activity parameter validation fails', async () => {
      const ap = { url: 'https://ap.com' };
      mockDbService.getActivityProvider.mockResolvedValue(ap);
      fakeClient.getConfigParameters.mockResolvedValue([
        { name: 'param1', type: 'string' },
      ]);
      // Pass an invalid parameter type (number instead of string).
      const invalidActivityData = {
        name: 'test',
        description: 'test',
        activityProviderId: new Types.ObjectId(),
        parameters: { param1: 123 },
      };

      await expect(
        service.createActivity(new Types.ObjectId(), invalidActivityData),
      ).rejects.toThrow(BadRequestException);
    });
  });

  it('should remove an activity', async () => {
    mockDbService.removeActivity.mockResolvedValue(undefined);
    await service.removeActivity(id);
    expect(mockDbService.removeActivity).toHaveBeenCalledWith(id);
  });

  it('should create a goal', async () => {
    const goalData = {
      name: 'goal',
      description: 'goal',
      formula: '1+1',
      targetValue: 2,
    };

    const createdGoal = {
      name: 'goal',
      description: 'goal',
      formula: '1+1',
      targetValue: 2,
    };
    mockDbService.createGoal.mockResolvedValue(createdGoal);
    const result = await service.createGoal(id, goalData);
    expect(result).toEqual(createdGoal);
    expect(mockDbService.createGoal).toHaveBeenCalledWith(id, goalData);
  });

  it('should remove a goal', async () => {
    mockDbService.removeGoal.mockResolvedValue(undefined);
    await service.removeGoal(id);
    expect(mockDbService.removeGoal).toHaveBeenCalledWith(id);
  });

  it('should create an IAP', async () => {
    const createIapData = {
      name: 'test',
      description: 'test',
    };
    const createdIap = { id: 'iap1' };
    mockDbService.createIap.mockResolvedValue(createdIap);
    const result = await service.createIap(createIapData);
    expect(result).toEqual(createdIap);
    expect(mockDbService.createIap).toHaveBeenCalledWith(createIapData);
  });

  it('should remove an IAP', async () => {
    mockDbService.removeIap.mockResolvedValue(undefined);
    await service.removeIap(id);
    expect(mockDbService.removeIap).toHaveBeenCalledWith(id);
  });

  describe('deployIap', () => {
    it('should deploy IAP successfully', async () => {
      // Setup an IAP with one activity.
      const iap = { activityIds: ['act1'] };
      const activity = {
        _id: { toString: () => 'act1' },
        name: 'Deploy Activity',
        activityProviderId: 'ap1',
        parameters: { param: 'value' },
      };
      const ap = { url: 'https://ap.com' };

      mockDbService.getIAP.mockResolvedValue(iap);
      mockDbService.getActivity.mockResolvedValue(activity);
      mockDbService.getActivityProvider.mockResolvedValue(ap);
      fakeClient.deploy.mockResolvedValue(undefined);
      mockDbService.deployIap.mockResolvedValue(undefined);

      await service.deployIap(id);
      expect(fakeClient.deploy).toHaveBeenCalledWith(
        { parameters: activity.parameters },
        { params: { id: 'act1' } },
      );
      expect(mockDbService.deployIap).toHaveBeenCalledWith(id);
    });

    it('should throw BadRequestException if deploy fails', async () => {
      const iap = { activityIds: ['act1'] };
      const activity = {
        _id: { toString: () => 'act1' },
        name: 'Deploy Activity',
        activityProviderId: 'ap1',
        parameters: { param: 'value' },
      };
      const ap = { url: 'https://ap.com' };

      mockDbService.getIAP.mockResolvedValue(iap);
      mockDbService.getActivity.mockResolvedValue(activity);
      mockDbService.getActivityProvider.mockResolvedValue(ap);
      fakeClient.deploy.mockRejectedValue(new Error('Deploy error'));

      await expect(service.deployIap(id)).rejects.toThrow(BadRequestException);
    });
  });

  it('should cache the AP client instance and not create a new one', async () => {
    const ap = { url: 'https://ap.com' };
    mockDbService.getActivityProvider.mockResolvedValue(ap);
    fakeClient.getConfigInterface.mockResolvedValue({
      interfaceUrl: 'https://ap.com/interface',
    });
    // Clear any previous invocations
    jest.clearAllMocks();

    // Call getConfigurationInterfaceUrl twice; the first call should create a new client,
    // while the second should reuse it.
    await service.getConfigurationInterfaceUrl(id);
    await service.getConfigurationInterfaceUrl(id);

    // createActivityProviderClient is mocked from @invenira/schemas,
    // so we can assert it was called only once for the same URL.
    expect(createActivityProviderClient).toHaveBeenCalledTimes(1);
  });

  it('should return an empty metrics array if no analytics contract data is provided', async () => {
    const iap = { activityIds: ['act1'] };
    const activity = {
      _id: { toString: () => 'act1' },
      name: 'Test Activity With Special!@# Characters',
      activityProviderId: 'ap1',
      parameters: {},
    };
    const ap = { url: 'https://ap.com' };

    mockDbService.getIAP.mockResolvedValue(iap);
    mockDbService.getActivity.mockResolvedValue(activity);
    mockDbService.getActivityProvider.mockResolvedValue(ap);
    // Simulate a contract with no analytics arrays.
    fakeClient.getAnalyticsContract.mockResolvedValue({});

    const metrics = await service.getIAPAvailableMetrics(id);
    expect(metrics).toEqual([]);
  });

  it('should throw BadRequestException in createActivity if getConfigParameters fails', async () => {
    const createActivityData = {
      name: 'test',
      description: 'test',
      activityProviderId: new Types.ObjectId(),
      parameters: { param1: 'validValue' },
    };
    const ap = { url: 'https://ap.com' };

    mockDbService.getActivityProvider.mockResolvedValue(ap);
    // Force getConfigParameters to reject, simulating a connection error.
    fakeClient.getConfigParameters.mockRejectedValue(
      new Error('Connection error'),
    );

    await expect(
      service.createActivity(new Types.ObjectId(), createActivityData),
    ).rejects.toThrow(BadRequestException);
  });
});
