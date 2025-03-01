import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { Connection, Types } from 'mongoose';
import { MongoService } from './mongo.service';

/* eslint-disable */
/* tslint:disable */

// Stub getCurrentUser to always return "testUser"
jest.mock('../../context/context.service', () => ({
  get: () => 'testUser',
}));

describe('MongoService - Updated', () => {
  let service: MongoService;
  let fakeGoalModel: any;
  let fakeActivityProviderModel: any;
  let fakeActivityModel: any;
  let fakeIapModel: any;
  let fakeUserModel: any;
  let fakeDeployModel: any;
  let fakeConnection: any;
  let fakeSession: any;
  let fakeContext: any;

  beforeEach(() => {
    fakeContext = {
      get: jest.fn().mockReturnValue({ userId: 'testUser' }),
    };

    fakeSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      abortTransaction: jest.fn().mockResolvedValue(undefined),
      endSession: jest.fn().mockResolvedValue(undefined),
    };

    fakeConnection = {
      startSession: jest.fn().mockResolvedValue(fakeSession), // Simulate that the connection has loaded models
      modelNames: jest
        .fn()
        .mockReturnValue([
          'GoalEntity',
          'ActivityProviderEntity',
          'ActivityEntity',
          'IAPEntity',
          'UserEntity',
          'DeployEntity',
        ]),
    };

    fakeActivityModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      findByIdAndDelete: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    };

    fakeActivityProviderModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      findByIdAndDelete: jest.fn(),
      create: jest.fn(),
    };

    fakeIapModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn(),
      findByIdAndDelete: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };

    fakeGoalModel = {
      find: jest.fn(),
      create: jest.fn(),
      findByIdAndDelete: jest.fn(),
      deleteMany: jest.fn(),
    };

    fakeUserModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    fakeDeployModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    service = new MongoService(
      fakeContext,
      fakeGoalModel,
      fakeActivityProviderModel,
      fakeActivityModel,
      fakeIapModel,
      fakeUserModel,
      fakeDeployModel,
      fakeConnection,
    );
  });

  // Helper to simulate the chain: .lean().exec()
  function mockChain(result: any) {
    const exec = jest.fn().mockResolvedValue(result);
    return { lean: () => ({ exec }) };
  }

  describe('Read methods', () => {
    it('getActivities should return activities', async () => {
      const expected = [{ id: 'act1' }];
      fakeActivityModel.find.mockReturnValue(mockChain(expected));
      const result = await service.getActivities();
      expect(result).toEqual(expected);
      expect(fakeActivityModel.find).toHaveBeenCalled();
    });

    it('getActivity should return an activity if found', async () => {
      const id = new Types.ObjectId();
      const expected = { _id: id, name: 'Test Activity' };
      fakeActivityModel.findOne.mockReturnValue(mockChain(expected));
      const result = await service.getActivity(id);
      expect(result).toEqual(expected);
      expect(fakeActivityModel.findOne).toHaveBeenCalledWith({ _id: id });
    });

    it('getActivity should throw NotFoundException if not found', async () => {
      const id = new Types.ObjectId();
      fakeActivityModel.findOne.mockReturnValue(mockChain(null));
      await expect(service.getActivity(id)).rejects.toThrow(NotFoundException);
    });

    it('getActivityProvider should return provider with activities', async () => {
      const apId = new Types.ObjectId();
      const fakeProvider = { _id: apId, id: apId.toString(), name: 'Provider' };
      const fakeActivities = [
        {
          _id: new Types.ObjectId(),
          activityProviderId: fakeProvider.id,
          name: 'Activity 1',
        },
      ];
      fakeActivityProviderModel.findOne.mockReturnValue(
        mockChain(fakeProvider),
      );
      fakeActivityModel.find.mockReturnValue(mockChain(fakeActivities));
      const result = await service.getActivityProvider(apId);
      expect(result).toEqual({ ...fakeProvider, activities: fakeActivities });
      expect(fakeActivityProviderModel.findOne).toHaveBeenCalledWith({
        _id: apId,
      });
      expect(fakeActivityModel.find).toHaveBeenCalledWith({
        activityProviderId: fakeProvider.id,
      });
    });

    it('getActivityProvider should throw NotFoundException if provider not found', async () => {
      const apId = new Types.ObjectId();
      fakeActivityProviderModel.findOne.mockReturnValue(mockChain(null));
      await expect(service.getActivityProvider(apId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('getActivityProviderActivities should return activities for a provider', async () => {
      const apId = new Types.ObjectId();
      // getActivityProvider call inside returns a valid provider
      const fakeProvider = { _id: apId, id: apId.toString(), name: 'Provider' };
      fakeActivityProviderModel.findOne.mockReturnValue(
        mockChain(fakeProvider),
      );
      const expectedActivities = [
        {
          _id: new Types.ObjectId(),
          activityProviderId: apId,
          name: 'Activity 1',
        },
      ];
      fakeActivityModel.find.mockReturnValue(mockChain(expectedActivities));
      const result = await service.getActivityProviderActivities(apId);
      expect(result).toEqual(expectedActivities);
      expect(fakeActivityModel.find).toHaveBeenCalledWith({
        activityProviderId: apId,
      });
    });

    it('getActivityProviders should return all providers with their activities', async () => {
      const apId = new Types.ObjectId();
      const fakeProviders = [{ _id: apId, id: apId, name: 'Provider' }];
      fakeActivityProviderModel.find.mockReturnValue(mockChain(fakeProviders));
      const fakeActivities = [
        {
          _id: new Types.ObjectId(),
          activityProviderId: apId,
          name: 'Activity 1',
        },
      ];
      fakeActivityModel.find.mockReturnValue(mockChain(fakeActivities));
      const result = await service.getActivityProviders();
      expect(result).toEqual([
        { ...fakeProviders[0], activities: fakeActivities },
      ]);
      expect(fakeActivityProviderModel.find).toHaveBeenCalled();
      expect(fakeActivityModel.find).toHaveBeenCalledWith({
        activityProviderId: apId,
      });
    });

    it('getIAP should return an IAP with activityProviders and goals', async () => {
      const iapId = new Types.ObjectId();
      const fakeIAP = {
        _id: iapId,
        activityIds: ['act1', 'act2'],
        goalIds: ['goal1'],
      };
      fakeIapModel.findOne.mockReturnValue(mockChain(fakeIAP));

      const fakeActivities = [
        {
          _id: new Types.ObjectId(),
          activityProviderId: new Types.ObjectId(),
          name: 'Activity 1',
        },
        {
          _id: new Types.ObjectId(),
          activityProviderId: new Types.ObjectId(),
          name: 'Activity 2',
        },
      ];
      fakeActivityModel.find.mockReturnValueOnce(mockChain(fakeActivities));

      const fakeProviders = [
        { _id: new Types.ObjectId(), id: 'ap1', name: 'Provider 1' },
        { _id: new Types.ObjectId(), id: 'ap2', name: 'Provider 2' },
      ];
      fakeActivityProviderModel.find.mockReturnValueOnce(
        mockChain(fakeProviders),
      );

      const fakeGoals = [{ _id: new Types.ObjectId(), name: 'Goal 1' }];
      fakeGoalModel.find = jest.fn().mockReturnValue(mockChain(fakeGoals));

      const result = await service.getIAP(iapId);
      expect(result).toEqual({
        ...fakeIAP,
        activityProviders: [
          {
            ...fakeProviders[0],
            activities: fakeActivities.filter((a) =>
              a.activityProviderId.equals('ap1'),
            ),
          },
          {
            ...fakeProviders[1],
            activities: fakeActivities.filter((a) =>
              a.activityProviderId.equals('ap2'),
            ),
          },
        ],
        goals: fakeGoals,
      });
      expect(fakeIapModel.findOne).toHaveBeenCalledWith({ _id: iapId });
      expect(fakeActivityModel.find).toHaveBeenCalledWith({
        _id: { $in: fakeIAP.activityIds },
      });
      expect(fakeActivityProviderModel.find).toHaveBeenCalledWith({
        _id: { $in: fakeActivities.map((a) => a.activityProviderId) },
      });
      expect(fakeGoalModel.find).toHaveBeenCalledWith({
        _id: { $in: fakeIAP.goalIds },
      });
    });

    it('getIAP should throw NotFoundException if IAP not found', async () => {
      const iapId = new Types.ObjectId();
      fakeIapModel.findOne.mockReturnValue(mockChain(null));
      await expect(service.getIAP(iapId)).rejects.toThrow(NotFoundException);
    });

    it('getIAPs should return all IAPs with full details', async () => {
      const iapId = new Types.ObjectId();
      const apId = new Types.ObjectId();
      const actId = new Types.ObjectId();
      const goalId = new Types.ObjectId();
      const fakeIAPList = [
        { _id: iapId, activityIds: [actId], goalIds: [goalId] },
      ];
      fakeIapModel.find.mockReturnValue(mockChain(fakeIAPList));

      // For each IAP, getIAP is called. Set up mocks for the inner calls.
      fakeIapModel.findOne.mockReturnValue(mockChain(fakeIAPList[0]));
      const fakeActivities = [
        { _id: actId, activityProviderId: apId, name: 'Activity 1' },
      ];
      fakeActivityModel.find.mockReturnValueOnce(mockChain(fakeActivities));
      const fakeProviders = [{ _id: apId, id: apId, name: 'Provider 1' }];
      fakeActivityProviderModel.find.mockReturnValueOnce(
        mockChain(fakeProviders),
      );
      const fakeGoals = [{ _id: goalId, name: 'Goal 1' }];
      fakeGoalModel.find = jest.fn().mockReturnValue(mockChain(fakeGoals));

      const result = await service.getIAPs();
      expect(result).toEqual([
        {
          ...fakeIAPList[0],
          activityProviders: [
            {
              ...fakeProviders[0],
              activities: fakeActivities.filter((a) =>
                a.activityProviderId.equals(apId),
              ),
            },
          ],
          goals: fakeGoals,
        },
      ]);
      expect(fakeIapModel.find).toHaveBeenCalled();
    });
  });

  describe('Transactional methods', () => {
    describe('createActivityProvider', () => {
      it('should create an activity provider and commit the transaction', async () => {
        const input = {
          name: 'AP',
          description: 'test',
          url: 'https://localhost',
        };
        const expectedInput = {
          ...input,
          createdBy: 'testUser',
          updatedBy: 'testUser',
        };
        const createdDoc = { toObject: () => ({ _id: 'ap1', ...input }) };
        fakeActivityProviderModel.create.mockResolvedValue(createdDoc);

        const result = await service.createActivityProvider(input);
        expect(result).toEqual({
          _id: 'ap1',
          ...expectedInput,
          activities: [],
        });
        expect(fakeActivityProviderModel.create).toHaveBeenCalledWith(
          expectedInput,
        );
        expect(fakeConnection.startSession).toHaveBeenCalled();
        expect(fakeSession.startTransaction).toHaveBeenCalled();
        expect(fakeSession.commitTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });

      it('should abort the transaction on error', async () => {
        const input = {
          name: 'AP',
          description: 'test',
          url: 'https://localhost',
        };
        fakeActivityProviderModel.create.mockRejectedValue(
          new Error('creation error'),
        );
        await expect(service.createActivityProvider(input)).rejects.toThrow(
          'creation error',
        );
        expect(fakeSession.abortTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });
    });

    describe('removeActivityProvider', () => {
      it('should throw BadRequestException if provider has activities', async () => {
        const apId = new Types.ObjectId();
        const fakeProvider = { _id: apId, id: apId.toString(), name: 'AP' };
        fakeActivityProviderModel.findOne.mockReturnValue(
          mockChain(fakeProvider),
        );
        const fakeActivities = [
          {
            _id: 'act1',
            activityProviderId: fakeProvider.id,
            name: 'Activity 1',
          },
        ];
        fakeActivityModel.find.mockReturnValue(mockChain(fakeActivities));
        await expect(service.removeActivityProvider(apId)).rejects.toThrow(
          BadRequestException,
        );
        expect(fakeSession.abortTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });

      it('should remove an activity provider if no activities exist', async () => {
        const apId = new Types.ObjectId();
        const fakeProvider = { _id: apId, id: apId.toString(), name: 'AP' };
        fakeActivityProviderModel.findOne.mockReturnValue(
          mockChain(fakeProvider),
        );
        fakeActivityModel.find.mockReturnValue(mockChain([]));
        const fakeDeleteResult = { _id: apId, name: 'AP' };
        fakeActivityProviderModel.findByIdAndDelete.mockReturnValue(
          mockChain(fakeDeleteResult),
        );

        await service.removeActivityProvider(apId);
        expect(
          fakeActivityProviderModel.findByIdAndDelete,
        ).toHaveBeenCalledWith({ _id: apId });
        expect(fakeSession.commitTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });
    });

    describe('createActivity', () => {
      it('should create an activity and update the IAP', async () => {
        const iapId = new Types.ObjectId();
        const input = {
          activityProviderId: new Types.ObjectId(),
          name: 'Activity',
          description: 'test',
          parameters: {},
        };
        const expectedInput = {
          ...input,
          createdBy: 'testUser',
          updatedBy: 'testUser',
        };
        const createdActivity = {
          id: 'act1',
          toObject: () => ({ id: 'act1', ...input }),
        };
        fakeActivityModel.create.mockResolvedValue(createdActivity);
        fakeIapModel.updateOne.mockResolvedValue({});

        const result = await service.createActivity(iapId, input);
        expect(result).toEqual({ id: 'act1', ...expectedInput });
        expect(fakeActivityModel.create).toHaveBeenCalledWith(expectedInput);
        expect(fakeIapModel.updateOne).toHaveBeenCalledWith(
          { _id: iapId.toString() },
          {
            updatedBy: 'testUser',
            $push: { activityIds: createdActivity.id },
          },
        );
        expect(fakeSession.commitTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });
    });

    describe('removeActivity', () => {
      it('should remove an activity and update the IAP if found', async () => {
        const activityId = new Types.ObjectId();
        const foundActivity = {
          _id: activityId,
          toObject: () => ({ id: activityId.toString(), name: 'Activity' }),
        };
        fakeActivityModel.findByIdAndDelete.mockReturnValue({
          exec: jest.fn().mockResolvedValue(foundActivity),
        });
        fakeIapModel.updateOne.mockResolvedValue({});

        await service.removeActivity(activityId);
        expect(fakeActivityModel.findByIdAndDelete).toHaveBeenCalledWith({
          _id: activityId.toString(),
        });
        expect(fakeIapModel.updateOne).toHaveBeenCalledWith(
          { activityIds: activityId },
          {
            updatedBy: 'testUser',
            pull: { activityIds: activityId },
          },
        );
        expect(fakeSession.commitTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });

      it('should throw NotFoundException if activity is not found', async () => {
        const activityId = new Types.ObjectId();
        fakeActivityModel.findByIdAndDelete.mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });
        await expect(service.removeActivity(activityId)).rejects.toThrow(
          NotFoundException,
        );
        expect(fakeSession.abortTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });
    });

    describe('createGoal', () => {
      it('should create a goal and update the IAP', async () => {
        const iapId = new Types.ObjectId();
        const input = {
          name: 'Goal',
          description: 'test',
          formula: '1+1',
          targetValue: 2,
        };
        const expectedInput = {
          ...input,
          createdBy: 'testUser',
          updatedBy: 'testUser',
        };
        const fakeIAP = { _id: iapId, activityIds: [], goalIds: [] };
        fakeIapModel.findOne.mockReturnValue(mockChain(fakeIAP));
        const goalId = new Types.ObjectId();
        const createdGoal = {
          _id: goalId,
          id: 'goal1',
          toObject: () => ({ _id: goalId, id: 'goal1', ...input }),
        };
        fakeGoalModel.create.mockResolvedValue(createdGoal);
        fakeIapModel.updateOne.mockResolvedValue({});
        fakeActivityModel.find.mockReturnValueOnce(mockChain([]));
        fakeActivityProviderModel.find.mockReturnValueOnce(mockChain([]));

        const result = await service.createGoal(iapId, input);
        expect(result).toEqual({ _id: goalId, id: 'goal1', ...expectedInput });
        expect(fakeGoalModel.create).toHaveBeenCalledWith(expectedInput);
        expect(fakeIapModel.updateOne).toHaveBeenCalledWith(
          { _id: iapId },
          {
            updatedBy: 'testUser',
            $push: { goalIds: createdGoal._id },
          },
        );
        expect(fakeSession.commitTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });
    });

    describe('removeGoal', () => {
      it('should remove a goal and update the IAP if found', async () => {
        const goalId = new Types.ObjectId();
        const foundGoal = {
          _id: goalId,
          toObject: () => ({ id: goalId.toString(), name: 'Goal' }),
        };
        fakeGoalModel.findByIdAndDelete.mockReturnValue({
          exec: jest.fn().mockResolvedValue(foundGoal),
        });
        fakeIapModel.findOneAndUpdate.mockResolvedValue({});

        await service.removeGoal(goalId);
        expect(fakeGoalModel.findByIdAndDelete).toHaveBeenCalledWith({
          _id: goalId.toString(),
        });
        expect(fakeIapModel.findOneAndUpdate).toHaveBeenCalledWith(
          { goalIds: goalId },
          {
            updatedBy: 'testUser',
            $pull: { goalIds: goalId },
          },
        );
        expect(fakeSession.commitTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });

      it('should throw NotFoundException if goal not found', async () => {
        const goalId = new Types.ObjectId();
        fakeGoalModel.findByIdAndDelete.mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });
        await expect(service.removeGoal(goalId)).rejects.toThrow(
          NotFoundException,
        );
        expect(fakeSession.abortTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });
    });

    describe('createIap', () => {
      it('should create an IAP and commit the transaction', async () => {
        const input = { name: 'IAP', description: 'test' };
        const expectedInput = {
          ...input,
          createdBy: 'testUser',
          updatedBy: 'testUser',
        };
        const createdIap = { toObject: () => ({ id: 'iap1', ...input }) };
        fakeIapModel.create.mockResolvedValue(createdIap);

        const result = await service.createIap(input);
        expect(result).toEqual({
          id: 'iap1',
          ...expectedInput,
          activityProviders: [],
          goals: [],
        });
        expect(fakeIapModel.create).toHaveBeenCalledWith(expectedInput);
        expect(fakeSession.commitTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });
    });

    describe('removeIap', () => {
      it('should remove an IAP after deleting goals and activities', async () => {
        const iapId = new Types.ObjectId();
        const goalId = new Types.ObjectId();
        const apId = new Types.ObjectId();
        const actId = new Types.ObjectId();
        const fakeIAP = {
          _id: iapId,
          goals: [{ _id: goalId }],
          activityProviders: [
            {
              _id: apId,
              activities: [{ _id: actId, activityProviderId: apId }],
            },
          ],
        };
        // Simulate getIAP call inside removeIap
        fakeIapModel.findOne.mockReturnValue(mockChain(fakeIAP));
        fakeGoalModel.deleteMany.mockResolvedValue({});
        fakeGoalModel.find.mockReturnValueOnce(mockChain([{ _id: goalId }]));
        fakeActivityModel.deleteMany.mockResolvedValue({});
        fakeActivityModel.find.mockReturnValueOnce(
          mockChain([{ _id: actId, activityProviderId: apId }]),
        );
        fakeActivityProviderModel.find.mockReturnValueOnce(
          mockChain([
            {
              _id: apId,
              activities: [{ _id: actId, activityProviderId: apId }],
            },
          ]),
        );
        fakeIapModel.findByIdAndDelete.mockReturnValue(mockChain(fakeIAP));

        await service.removeIap(iapId);
        expect(fakeIapModel.findOne).toHaveBeenCalledWith({ _id: iapId });
        expect(fakeGoalModel.deleteMany).toHaveBeenCalledWith({
          _id: { $in: fakeIAP.goals.map((g) => g._id) },
        });
        expect(fakeActivityModel.deleteMany).toHaveBeenCalledWith({
          _id: {
            $in: fakeIAP.activityProviders.map((ap) =>
              ap.activities.map((at) => at._id),
            ),
          },
        });
        expect(fakeIapModel.findByIdAndDelete).toHaveBeenCalledWith({
          _id: iapId,
        });
        expect(fakeSession.commitTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });

      it('should throw NotFoundException if IAP not found in removeIap', async () => {
        const iapId = new Types.ObjectId();
        fakeIapModel.findOne.mockReturnValue(mockChain(null));
        await expect(service.removeIap(iapId)).rejects.toThrow(
          NotFoundException,
        );
        expect(fakeSession.abortTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });
    });

    describe('deployIap', () => {
      it('should deploy an IAP if not already deployed', async () => {
        const iapId = new Types.ObjectId();
        const iapDoc = {
          _id: iapId,
          isDeployed: false,
          save: jest.fn().mockResolvedValue(undefined),
        };
        fakeIapModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(iapDoc),
        });

        await service.deployIap(iapId);
        expect(fakeIapModel.findOne).toHaveBeenCalledWith({ _id: iapId });
        expect(iapDoc.isDeployed).toBe(true);
        expect((iapDoc as any).updatedBy).toBe('testUser');
        expect(iapDoc.save).toHaveBeenCalled();
        expect(fakeSession.commitTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });

      it('should throw NotFoundException if IAP not found in deployIap', async () => {
        const iapId = new Types.ObjectId();
        fakeIapModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });
        await expect(service.deployIap(iapId)).rejects.toThrow(
          NotFoundException,
        );
        expect(fakeSession.abortTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });

      it('should throw BadRequestException if IAP already deployed in deployIap', async () => {
        const iapId = new Types.ObjectId();
        const iapDoc = {
          _id: iapId,
          isDeployed: true,
          save: jest.fn(),
        };
        fakeIapModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(iapDoc),
        });
        await expect(service.deployIap(iapId)).rejects.toThrow(
          BadRequestException,
        );
        expect(fakeSession.abortTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });
    });
  });

  describe('Constructor logging', () => {
    it('should log loaded model names upon instantiation', () => {
      const logSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(() => {});
      const testConnection = {
        modelNames: () => ['TestModel1', 'TestModel2'],
      } as unknown as Connection;
      new MongoService(
        fakeContext,
        fakeGoalModel,
        fakeActivityProviderModel,
        fakeActivityModel,
        fakeIapModel,
        fakeUserModel,
        fakeDeployModel,
        testConnection,
      );
      expect(logSpy).toHaveBeenCalledWith('Model loaded: TestModel1');
      expect(logSpy).toHaveBeenCalledWith('Model loaded: TestModel2');
      logSpy.mockRestore();
    });
  });

  describe('User and Deploy methods', () => {
    describe('createUser', () => {
      it('should create a new user if not found', async () => {
        const lmsUserId = 'lms-123';
        // Simulate user not found
        fakeUserModel.findOne.mockReturnValueOnce(mockChain(null));
        const newUserDoc = { _id: 'newUser123' };
        fakeUserModel.create.mockResolvedValueOnce(newUserDoc);

        const result = await service.createUser(lmsUserId);
        expect(result).toEqual('newUser123');
        expect(fakeUserModel.findOne).toHaveBeenCalledWith({ lmsUserId });
        expect(fakeUserModel.create).toHaveBeenCalledWith({ lmsUserId });
      });

      it('should return existing user id if user is found', async () => {
        const lmsUserId = 'lms-456';
        const existingUser = { _id: 'existingUser456' };
        fakeUserModel.findOne.mockReturnValueOnce(mockChain(existingUser));

        const result = await service.createUser(lmsUserId);
        expect(result).toEqual('existingUser456');
        expect(fakeUserModel.findOne).toHaveBeenCalledWith({ lmsUserId });
        // Ensure create is not called when user exists
        expect(fakeUserModel.create).not.toHaveBeenCalled();
      });
    });

    describe('createDeploy', () => {
      const activityId = 'act-deploy-1';
      const lmsUserId = 'lms-deploy-1';
      const deployUrl = 'https://deploy.example.com';

      it('should throw NotFoundException if activity is not found', async () => {
        // Simulate activity not found
        fakeActivityModel.findOne.mockReturnValueOnce(mockChain(null));

        await expect(
          service.createDeploy(activityId, lmsUserId, deployUrl),
        ).rejects.toThrow(`Activity with id ${activityId} not found.`);
        expect(fakeSession.abortTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });

      it('should return existing deploy id if a deploy already exists', async () => {
        // Simulate found activity
        const activity = { _id: activityId, name: 'Test Activity' };
        fakeActivityModel.findOne.mockReturnValueOnce(mockChain(activity));
        // Simulate that user already exists
        const existingUser = { _id: 'userDeploy1' };
        fakeUserModel.findOne.mockReturnValueOnce(mockChain(existingUser));
        // For createUser, the call returns existing user id
        // Now simulate that deploy already exists
        const existingDeploy = { _id: 'deployExisting' };
        fakeDeployModel.findOne.mockReturnValueOnce(mockChain(existingDeploy));

        const result = await service.createDeploy(
          activityId,
          lmsUserId,
          deployUrl,
        );
        expect(result).toEqual('deployExisting');
        expect(fakeActivityModel.findOne).toHaveBeenCalledWith({
          _id: activityId,
        });
        expect(fakeDeployModel.findOne).toHaveBeenCalledWith({
          userId: 'userDeploy1',
          activityId,
          deployUrl,
        });
        expect(fakeSession.commitTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });

      it('should create a new deploy and return its id if none exists', async () => {
        // Simulate found activity
        const activity = { _id: activityId, name: 'Test Activity' };
        fakeActivityModel.findOne.mockReturnValueOnce(mockChain(activity));
        // Simulate that user does not exist so that createUser creates one
        fakeUserModel.findOne.mockReturnValueOnce(mockChain(null));
        const newUserDoc = { _id: 'userDeploy2' };
        fakeUserModel.create.mockResolvedValueOnce(newUserDoc);
        // Simulate that no deploy exists
        fakeDeployModel.findOne.mockReturnValueOnce(mockChain(null));
        // Simulate creation of a new deploy document
        const newDeployDoc = { _id: 'deployNew' };
        fakeDeployModel.create.mockResolvedValueOnce(newDeployDoc);

        const result = await service.createDeploy(
          activityId,
          lmsUserId,
          deployUrl,
        );
        expect(result).toEqual('deployNew');
        expect(fakeActivityModel.findOne).toHaveBeenCalledWith({
          _id: activityId,
        });
        expect(fakeUserModel.findOne).toHaveBeenCalledWith({ lmsUserId });
        expect(fakeUserModel.create).toHaveBeenCalledWith({ lmsUserId });
        expect(fakeDeployModel.findOne).toHaveBeenCalledWith({
          userId: 'userDeploy2',
          activityId,
          deployUrl,
        });
        expect(fakeDeployModel.create).toHaveBeenCalledWith({
          userId: 'userDeploy2',
          activityId,
          deployUrl,
        });
        expect(fakeSession.commitTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });
    });

    describe('getDeployUrl', () => {
      const activityId = 'act-deploy-url-1';
      const lmsUserId = 'lms-deploy-url-1';

      it('should return the deployUrl if a deploy exists', async () => {
        // Simulate that user exists
        const existingUser = { _id: 'userUrl1' };
        fakeUserModel.findOne.mockReturnValueOnce(mockChain(existingUser));
        // Simulate deploy found with a deployUrl
        const deployDoc = { deployUrl: 'https://deploy.url/1' };
        fakeDeployModel.findOne.mockReturnValueOnce(mockChain(deployDoc));

        const result = await service.getDeployUrl(activityId, lmsUserId);
        expect(result).toEqual('https://deploy.url/1');
        expect(fakeUserModel.findOne).toHaveBeenCalledWith({ lmsUserId });
        expect(fakeDeployModel.findOne).toHaveBeenCalledWith({
          activityId,
          userId: 'userUrl1',
        });
      });

      it('should return undefined if no deploy is found', async () => {
        // Simulate that user exists
        const existingUser = { _id: 'userUrl2' };
        fakeUserModel.findOne.mockReturnValueOnce(mockChain(existingUser));
        // Simulate no deploy found
        fakeDeployModel.findOne.mockReturnValueOnce(mockChain(null));

        const result = await service.getDeployUrl(activityId, lmsUserId);
        expect(result).toBeUndefined();
        expect(fakeUserModel.findOne).toHaveBeenCalledWith({ lmsUserId });
        expect(fakeDeployModel.findOne).toHaveBeenCalledWith({
          activityId,
          userId: 'userUrl2',
        });
      });
    });
  });
});
