import { Test, TestingModule } from '@nestjs/testing';
import { GraphqlApiResolver } from './graphql-api.resolver';
import { GraphqlApiService } from './graphql-api.service';
import { IAPService } from '../iap/iap.service';
import { Types } from 'mongoose';
import { createMock } from '@golevelup/ts-jest';

/* eslint-disable */
/* tslint-disable */

// Stub getCurrentUser to always return "testUser"
jest.mock('../current-user', () => ({
  getCurrentUser: () => 'testUser',
}));

const sampleId = new Types.ObjectId();

describe('GraphqlApiModule', () => {
  let resolver: GraphqlApiResolver;
  let iapService: IAPService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GraphqlApiResolver,
        GraphqlApiService,
        { provide: IAPService, useValue: createMock<IAPService>() },
      ],
    }).compile();

    resolver = module.get<GraphqlApiResolver>(GraphqlApiResolver);
    iapService = module.get<IAPService>(IAPService);
  });

  describe('Queries', () => {
    it('should return activities', async () => {
      const activities = [{ id: 'act1' }];
      (iapService.getActivities as jest.Mock).mockResolvedValue(activities);
      const result = await resolver.getActivities();
      expect(result).toEqual(activities);
      expect(iapService.getActivities).toHaveBeenCalled();
    });

    it('should return an activity', async () => {
      const activity = { id: 'act1' };
      (iapService.getActivity as jest.Mock).mockResolvedValue(activity);
      const result = await resolver.getActivity(sampleId);
      expect(result).toEqual(activity);
      expect(iapService.getActivity).toHaveBeenCalledWith(sampleId);
    });

    it('should return an activity provider', async () => {
      const provider = { id: 'ap1' };
      (iapService.getActivityProvider as jest.Mock).mockResolvedValue(provider);
      const result = await resolver.getActivityProvider(sampleId);
      expect(result).toEqual(provider);
      expect(iapService.getActivityProvider).toHaveBeenCalledWith(sampleId);
    });

    it('should return configuration interface URL', async () => {
      const configInterface = { url: 'https://ap.com/interface' };
      (iapService.getConfigurationInterfaceUrl as jest.Mock).mockResolvedValue(
        configInterface,
      );
      const result = await resolver.getConfigurationInterfaceUrl(sampleId);
      expect(result).toEqual(configInterface);
      expect(iapService.getConfigurationInterfaceUrl).toHaveBeenCalledWith(
        sampleId,
      );
    });

    // Additional query tests can be added here...
  });

  describe('Mutations', () => {
    it('should create an activity provider', async () => {
      const input = { name: 'AP', description: 'desc', url: 'https://ap.com' };
      // The GraphqlApiService will enrich the input with createdBy/updatedBy.
      const expectedInput = {
        ...input,
        createdBy: 'testUser',
        updatedBy: 'testUser',
      };
      const provider = { id: 'ap1', ...expectedInput };
      (iapService.createActivityProvider as jest.Mock).mockResolvedValue(
        provider,
      );
      const result = await resolver.createActivityProvider(input);
      expect(result).toEqual(provider);
      expect(iapService.createActivityProvider).toHaveBeenCalledWith(
        expectedInput,
      );
    });

    it('should remove an activity provider', async () => {
      (iapService.removeActivityProvider as jest.Mock).mockResolvedValue(
        undefined,
      );
      await resolver.removeActivityProvider(sampleId);
      expect(iapService.removeActivityProvider).toHaveBeenCalledWith(sampleId);
    });

    it('should create an activity', async () => {
      const iapId = new Types.ObjectId();
      const input = {
        name: 'Activity',
        description: 'desc',
        activityProviderId: iapId,
        parameters: {},
      };
      const expectedInput = {
        ...input,
        createdBy: 'testUser',
        updatedBy: 'testUser',
      };
      const activity = { id: 'act1', ...expectedInput };
      (iapService.createActivity as jest.Mock).mockResolvedValue(activity);
      const result = await resolver.createActivity(iapId, input);
      expect(result).toEqual(activity);
      expect(iapService.createActivity).toHaveBeenCalledWith(
        iapId,
        expectedInput,
      );
    });

    it('should remove an activity', async () => {
      (iapService.removeActivity as jest.Mock).mockResolvedValue(undefined);
      await resolver.removeActivity(sampleId);
      expect(iapService.removeActivity).toHaveBeenCalledWith(sampleId);
    });

    it('should create a goal', async () => {
      const iapId = new Types.ObjectId();
      const input = {
        name: 'Goal',
        description: 'desc',
        formula: '1+1',
        targetValue: 2,
      };
      const expectedInput = {
        ...input,
        createdBy: 'testUser',
        updatedBy: 'testUser',
      };
      const goal = { id: 'goal1', ...expectedInput };
      (iapService.createGoal as jest.Mock).mockResolvedValue(goal);
      const result = await resolver.createGoal(iapId, input);
      expect(result).toEqual(goal);
      expect(iapService.createGoal).toHaveBeenCalledWith(iapId, expectedInput);
    });

    it('should remove a goal', async () => {
      (iapService.removeGoal as jest.Mock).mockResolvedValue(undefined);
      await resolver.removeGoal(sampleId);
      expect(iapService.removeGoal).toHaveBeenCalledWith(sampleId);
    });

    it('should create an IAP', async () => {
      const input = { name: 'IAP', description: 'desc' };
      const expectedInput = {
        ...input,
        createdBy: 'testUser',
        updatedBy: 'testUser',
      };
      const iap = { id: 'iap1', ...expectedInput };
      (iapService.createIap as jest.Mock).mockResolvedValue(iap);
      const result = await resolver.createIap(input);
      expect(result).toEqual(iap);
      expect(iapService.createIap).toHaveBeenCalledWith(expectedInput);
    });

    it('should remove an IAP', async () => {
      (iapService.removeIap as jest.Mock).mockResolvedValue(undefined);
      await resolver.removeIap(sampleId);
      expect(iapService.removeIap).toHaveBeenCalledWith(sampleId);
    });

    it('should deploy an IAP', async () => {
      (iapService.deployIap as jest.Mock).mockResolvedValue(undefined);
      await resolver.deployIap(sampleId);
      expect(iapService.deployIap).toHaveBeenCalledWith(sampleId);
    });
  });
});
