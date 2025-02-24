import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { Connection, Types } from 'mongoose';
import { MongoService } from './mongo.service';

/* eslint-disable */
/* tslint-disable */

// Stub getCurrentUser to always return "testUser"
jest.mock('../../current-user', () => ({
  getCurrentUser: () => 'testUser',
}));

describe('MongoService', () => {
  let service: MongoService;
  let fakeGoalModel: any;
  let fakeActivityProviderModel: any;
  let fakeActivityModel: any;
  let fakeIapModel: any;
  let fakeConnection: any;
  let fakeSession: any;

  beforeEach(() => {
    fakeSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      abortTransaction: jest.fn().mockResolvedValue(undefined),
      endSession: jest.fn().mockResolvedValue(undefined),
    };

    fakeConnection = {
      startSession: jest.fn().mockResolvedValue(fakeSession),
      // Simulate that the connection has loaded models
      modelNames: jest
        .fn()
        .mockReturnValue([
          'GoalEntity',
          'ActivityProviderEntity',
          'ActivityEntity',
          'IAPEntity',
        ]),
    };

    // Fake model implementations with chainable methods.
    // For find/lean/exec chains, we simulate by returning an object with a lean() method that returns an object with an exec() method.
    fakeActivityModel = {
      find: jest.fn().mockReturnValue({
        lean: () => ({ exec: jest.fn() }),
      }),
      findOne: jest.fn().mockReturnValue({
        lean: () => ({ exec: jest.fn() }),
      }),
      findByIdAndDelete: jest.fn().mockReturnValue({
        lean: () => ({ exec: jest.fn() }),
      }),
      create: jest.fn(),
      deleteMany: jest.fn(),
    };

    fakeActivityProviderModel = {
      find: jest.fn().mockReturnValue({
        lean: () => ({ exec: jest.fn() }),
      }),
      findOne: jest.fn().mockReturnValue({
        lean: () => ({ exec: jest.fn() }),
      }),
      findByIdAndDelete: jest.fn().mockReturnValue({
        lean: () => ({ exec: jest.fn() }),
      }),
      create: jest.fn(),
    };

    fakeIapModel = {
      find: jest.fn().mockReturnValue({
        lean: () => ({ exec: jest.fn() }),
      }),
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn(),
      }),
      create: jest.fn(),
      updateOne: jest.fn().mockResolvedValue({}),
      findByIdAndDelete: jest.fn().mockReturnValue({
        lean: () => ({ exec: jest.fn() }),
      }),
      findOneAndUpdate: jest.fn(),
    };

    fakeGoalModel = {
      create: jest.fn(),
      findByIdAndDelete: jest.fn().mockReturnValue({
        exec: jest.fn(),
      }),
      deleteMany: jest.fn().mockResolvedValue({}),
    };

    // Instantiate the service with the fake models and connection.
    service = new MongoService(
      fakeGoalModel,
      fakeActivityProviderModel,
      fakeActivityModel,
      fakeIapModel,
      fakeConnection,
    );
  });

  describe('Read methods (no transaction)', () => {
    it('getActivities should return activities', async () => {
      const expected = [{ id: 'act1' }];
      const execMock = jest.fn().mockResolvedValue(expected);
      fakeActivityModel.find.mockReturnValue({
        lean: () => ({ exec: execMock }),
      });
      const result = await service.getActivities();
      expect(result).toEqual(expected);
      expect(fakeActivityModel.find).toHaveBeenCalled();
    });

    it('getActivity should return an activity if found', async () => {
      const id = new Types.ObjectId();
      const expected = { _id: id, name: 'Test Activity' };
      const execMock = jest.fn().mockResolvedValue(expected);
      fakeActivityModel.findOne.mockReturnValue({
        lean: () => ({ exec: execMock }),
      });
      const result = await service.getActivity(id);
      expect(result).toEqual(expected);
      expect(fakeActivityModel.findOne).toHaveBeenCalledWith({ _id: id });
    });

    it('getActivity should throw NotFoundException if not found', async () => {
      const id = new Types.ObjectId();
      const execMock = jest.fn().mockResolvedValue(null);
      fakeActivityModel.findOne.mockReturnValue({
        lean: () => ({ exec: execMock }),
      });
      await expect(service.getActivity(id)).rejects.toThrow(NotFoundException);
    });

    it('getActivityProvider should return an activity provider if found', async () => {
      const id = new Types.ObjectId();
      const expected = { _id: id, name: 'Provider' };
      const execMock = jest.fn().mockResolvedValue(expected);
      fakeActivityProviderModel.findOne.mockReturnValue({
        lean: () => ({ exec: execMock }),
      });
      const result = await service.getActivityProvider(id);
      expect(result).toEqual(expected);
      expect(fakeActivityProviderModel.findOne).toHaveBeenCalledWith({
        _id: id,
      });
    });

    it('getActivityProviders should return all activity providers', async () => {
      const id = new Types.ObjectId();
      const expected = [{ _id: id, name: 'Provider' }];
      const execMock = jest.fn().mockResolvedValue(expected);
      fakeActivityProviderModel.find.mockReturnValue({
        lean: () => ({ exec: execMock }),
      });
      const result = await service.getActivityProviders();
      expect(result).toEqual(expected);
      expect(fakeActivityProviderModel.find).toHaveBeenCalled();
    });

    it('getIAP should return an IAP if found', async () => {
      const id = new Types.ObjectId();
      const expected = { _id: id, name: 'IAP' };
      const execMock = jest.fn().mockResolvedValue(expected);
      fakeIapModel.findOne.mockReturnValue({
        lean: () => ({ exec: execMock }),
      });
      const result = await service.getIAP(id);
      expect(result).toEqual(expected);
      expect(fakeIapModel.findOne).toHaveBeenCalledWith({ _id: id });
    });

    it('getIAPs should return all IAPs', async () => {
      const id = new Types.ObjectId();
      const expected = [{ _id: id, name: 'IAP' }];
      const execMock = jest.fn().mockResolvedValue(expected);
      fakeIapModel.find.mockReturnValue({
        lean: () => ({ exec: execMock }),
      });
      const result = await service.getIAPs();
      expect(result).toEqual(expected);
      expect(fakeIapModel.find).toHaveBeenCalled();
    });
  });

  describe('Methods with @WithTransaction decorator', () => {
    // For all methods decorated with WithTransaction, we check that a session is started,
    // that commitTransaction (or abortTransaction on error) and endSession are called.

    describe('createActivityProvider', () => {
      it('should create an activity provider and commit the transaction', async () => {
        const input = {
          name: 'AP',
          description: 'test',
          url: 'https://localhost',
        };

        const createdDoc = { toObject: () => ({ _id: 'ap1', ...input }) };
        fakeActivityProviderModel.create.mockResolvedValue(createdDoc);

        const result = await service.createActivityProvider(input);
        expect(result).toEqual({ _id: 'ap1', ...input });
        expect(fakeActivityProviderModel.create).toHaveBeenCalledWith(input);
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
        // Simulate getActivityProvider returning a valid provider...
        const execMockProvider = jest
          .fn()
          .mockResolvedValue({ _id: apId, name: 'AP' });
        fakeActivityProviderModel.findOne.mockReturnValue({
          lean: () => ({ exec: execMockProvider }),
        });
        // ...and getActivityProviderActivities returning non-empty activities.
        const execMockActivities = jest
          .fn()
          .mockResolvedValue([{ id: 'act1' }]);
        fakeActivityModel.find.mockReturnValue({
          lean: () => ({ exec: execMockActivities }),
        });

        await expect(service.removeActivityProvider(apId)).rejects.toThrow(
          BadRequestException,
        );
        expect(fakeSession.abortTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });

      it('should remove an activity provider if no activities exist', async () => {
        const apId = new Types.ObjectId();
        const execMockProvider = jest
          .fn()
          .mockResolvedValue({ _id: apId, name: 'AP' });
        fakeActivityProviderModel.findOne.mockReturnValue({
          lean: () => ({ exec: execMockProvider }),
        });
        const execMockActivities = jest.fn().mockResolvedValue([]);
        fakeActivityModel.find.mockReturnValue({
          lean: () => ({ exec: execMockActivities }),
        });
        const execMockDelete = jest
          .fn()
          .mockResolvedValue({ _id: apId, name: 'AP' });
        fakeActivityProviderModel.findByIdAndDelete.mockReturnValue({
          lean: () => ({ exec: execMockDelete }),
        });

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
        const createdActivity = {
          id: 'act1',
          toObject: () => ({ id: 'act1', ...input }),
        };
        fakeActivityModel.create.mockResolvedValue(createdActivity);
        fakeIapModel.updateOne.mockResolvedValue({});

        const result = await service.createActivity(iapId, input);
        expect(result).toEqual({ id: 'act1', ...input });
        expect(fakeActivityModel.create).toHaveBeenCalledWith(input);
        expect(fakeIapModel.updateOne).toHaveBeenCalledWith(
          { _id: iapId.toString() },
          { updatedBy: 'testUser', $push: { activityIds: createdActivity.id } },
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
        const execMock = jest.fn().mockResolvedValue(foundActivity);
        fakeActivityModel.findByIdAndDelete.mockReturnValue({
          exec: execMock,
        });
        fakeIapModel.updateOne.mockResolvedValue({});

        await service.removeActivity(activityId);
        expect(fakeActivityModel.findByIdAndDelete).toHaveBeenCalledWith({
          _id: activityId.toString(),
        });
        expect(fakeIapModel.updateOne).toHaveBeenCalledWith(
          { activityIds: activityId },
          { updatedBy: 'testUser', pull: { activityIds: activityId } },
        );
        expect(fakeSession.commitTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });

      it('should throw NotFoundException if activity is not found', async () => {
        const activityId = new Types.ObjectId();
        const execMock = jest.fn().mockResolvedValue(null);
        fakeActivityModel.findByIdAndDelete.mockReturnValue({
          exec: execMock,
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
        // Simulate getIAP inside createGoal
        const execMockIap = jest
          .fn()
          .mockResolvedValue({ _id: iapId, goalIds: [] });
        fakeIapModel.findOne.mockReturnValue({
          lean: () => ({ exec: execMockIap }),
        });
        const createdGoal = {
          id: 'goal1',
          toObject: () => ({ id: 'goal1', ...input }),
        };
        fakeGoalModel.create.mockResolvedValue(createdGoal);
        fakeIapModel.updateOne.mockResolvedValue({});

        const result = await service.createGoal(iapId, input);
        expect(result).toEqual({ id: 'goal1', ...input });
        expect(fakeGoalModel.create).toHaveBeenCalledWith(input);
        expect(fakeIapModel.updateOne).toHaveBeenCalledWith(
          { _id: iapId.toString() },
          { updatedBy: 'testUser', $push: { goalIds: createdGoal.id } },
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
        const execMock = jest.fn().mockResolvedValue(foundGoal);
        fakeGoalModel.findByIdAndDelete.mockReturnValue({
          exec: execMock,
        });
        fakeIapModel.findOneAndUpdate.mockResolvedValue({});

        await service.removeGoal(goalId);
        expect(fakeGoalModel.findByIdAndDelete).toHaveBeenCalledWith({
          _id: goalId.toString(),
        });
        expect(fakeIapModel.findOneAndUpdate).toHaveBeenCalledWith(
          { goalIds: goalId },
          { updatedBy: 'testUser', $pull: { goalIds: goalId } },
        );
        expect(fakeSession.commitTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });

      it('should throw NotFoundException if goal not found', async () => {
        const goalId = new Types.ObjectId();
        const execMock = jest.fn().mockResolvedValue(null);
        fakeGoalModel.findByIdAndDelete.mockReturnValue({
          exec: execMock,
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
        const createdIap = { toObject: () => ({ id: 'iap1', ...input }) };
        fakeIapModel.create.mockResolvedValue(createdIap);

        const result = await service.createIap(input);
        expect(result).toEqual({ id: 'iap1', ...input });
        expect(fakeIapModel.create).toHaveBeenCalledWith(input);
        expect(fakeSession.commitTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
      });
    });

    describe('removeIap', () => {
      it('should remove an IAP after deleting goals and activities', async () => {
        const iapId = new Types.ObjectId();
        const iapData = {
          _id: iapId,
          goalIds: ['goal1'],
          activityIds: ['act1'],
        };
        const execMockFindOne = jest.fn().mockResolvedValue(iapData);
        fakeIapModel.findOne.mockReturnValue({
          lean: () => ({ exec: execMockFindOne }),
        });
        const execMockDelete = jest.fn().mockResolvedValue(iapData);
        fakeIapModel.findByIdAndDelete.mockReturnValue({
          lean: () => ({ exec: execMockDelete }),
        });
        fakeGoalModel.deleteMany.mockResolvedValue({});
        fakeActivityModel.deleteMany.mockResolvedValue({});

        await service.removeIap(iapId);
        expect(fakeIapModel.findOne).toHaveBeenCalledWith({ _id: iapId });
        expect(fakeGoalModel.deleteMany).toHaveBeenCalledWith({
          _id: { $in: iapData.goalIds },
        });
        expect(fakeActivityModel.deleteMany).toHaveBeenCalledWith({
          _id: { $in: iapData.activityIds },
        });
        expect(fakeIapModel.findByIdAndDelete).toHaveBeenCalledWith({
          _id: iapId,
        });
        expect(fakeSession.commitTransaction).toHaveBeenCalled();
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

      it('should throw NotFoundException if IAP not found', async () => {
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

      it('should throw BadRequestException if IAP already deployed', async () => {
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

  it('getActivityProvider should throw NotFoundException if no provider is found', async () => {
    const apId = new Types.ObjectId();
    const execMock = jest.fn().mockResolvedValue(null);
    fakeActivityProviderModel.findOne.mockReturnValueOnce({
      lean: () => ({ exec: execMock }),
    });
    await expect(service.getActivityProvider(apId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('getIAP should throw NotFoundException if no IAP is found', async () => {
    const iapId = new Types.ObjectId();
    const execMock = jest.fn().mockResolvedValue(null);
    fakeIapModel.findOne.mockReturnValueOnce({
      lean: () => ({ exec: execMock }),
    });
    await expect(service.getIAP(iapId)).rejects.toThrow(NotFoundException);
  });

  it('getActivityProviderActivities should throw NotFoundException if activity provider is not found', async () => {
    const apId = new Types.ObjectId();
    const execMock = jest.fn().mockResolvedValue(null);
    fakeActivityProviderModel.findOne.mockReturnValueOnce({
      lean: () => ({ exec: execMock }),
    });
    await expect(service.getActivityProviderActivities(apId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('removeIap should throw NotFoundException if no IAP is found', async () => {
    const iapId = new Types.ObjectId();
    const execMock = jest.fn().mockResolvedValue(null);
    fakeIapModel.findOne.mockReturnValueOnce({
      lean: () => ({ exec: execMock }),
    });
    await expect(service.removeIap(iapId)).rejects.toThrow(NotFoundException);
  });

  describe('Constructor logging', () => {
    it('should log loaded model names upon instantiation', () => {
      const logSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(() => {});
      const testConnection = {
        modelNames: () => ['TestModel1', 'TestModel2'],
      } as unknown as Connection;
      // Instantiate a new service with a custom connection.
      new MongoService(
        fakeGoalModel,
        fakeActivityProviderModel,
        fakeActivityModel,
        fakeIapModel,
        testConnection,
      );
      expect(logSpy).toHaveBeenCalledWith('Model loaded: TestModel1');
      expect(logSpy).toHaveBeenCalledWith('Model loaded: TestModel2');
      logSpy.mockRestore();
    });
  });
});
