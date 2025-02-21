import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  Activity,
  ActivityProvider,
  ConfigInterface,
  CreateActivity,
  CreateActivityProvider,
  CreateGoal,
  CreateIAP,
  Goal,
  IAP,
  MetricGQLSchema,
  MongoId,
  MongoIdScalar,
} from '@invenira/schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Error, Model, Types } from 'mongoose';
import { IAPEntity } from './entities/iap.entity';
import { getCurrentUser } from '../../current-user';
import { DbService } from '../db.service';

@Injectable()
export class MongoService implements DbService {
  private readonly logger = new Logger(MongoService.name);

  constructor(
    @InjectModel(IAPEntity.name)
    private readonly iapModel: Model<IAPEntity>,
  ) {}

  async createActivity(
    apId: MongoId,
    createActivity: CreateActivity,
  ): Promise<Activity> {
    this.logger.debug(
      `Saving Activity within Activity Provider with id ${apId.toString()}`,
      createActivity,
    );

    const activityId = new Types.ObjectId();

    return this.iapModel
      .findOneAndUpdate(
        { 'activityProviders._id': apId },
        {
          updatedBy: createActivity.createdBy,
          'activityProviders.$.updatedBy': createActivity.createdBy,
          $push: {
            'activityProviders.$.activities': {
              _id: activityId,
              ...createActivity,
            },
          },
        },
        {
          new: true,
        },
      )
      .lean()
      .exec()
      .then((result) => {
        if (!result) {
          throw new NotFoundException(
            `No Activity Provider found with id ${apId.toString()}`,
          );
        }

        const ap = result.activityProviders.find((ap) =>
          ap.activities.some(
            (act) => act._id.toString() === activityId.toString(),
          ),
        );

        if (!ap) {
          throw new NotFoundException(
            `Activity with id ${activityId.toString()} not found`,
          );
        }

        return ap.activities.find(
          (act) => act._id.toString() === activityId.toString(),
        ) as Activity;
      });
  }

  async createActivityProvider(
    iapId: MongoId,
    createActivityProvider: CreateActivityProvider,
  ): Promise<ActivityProvider> {
    this.logger.debug(
      `Saving Activity Provider within IAP with id ${iapId.toString()}`,
      createActivityProvider,
    );

    const newApId = new Types.ObjectId();

    return this.iapModel
      .findOneAndUpdate(
        { _id: iapId },
        {
          updatedBy: createActivityProvider.createdBy,
          $push: {
            activityProviders: {
              _id: newApId,
              ...createActivityProvider,
            },
          },
        },
        {
          new: true,
        },
      )
      .select({
        activityProviders: { $elemMatch: { _id: newApId } },
      })
      .lean()
      .exec()
      .then((result) => {
        if (!result) {
          throw new NotFoundException(
            `No Inventive Activity Plan found with id ${iapId.toString()}`,
          );
        }

        const [addedActivityProviders] = result.activityProviders;

        return addedActivityProviders;
      });
  }

  async createGoal(iapId: MongoId, createGoal: CreateGoal): Promise<Goal> {
    this.logger.debug(
      `Saving Goal within IAP with id ${iapId.toString()}`,
      createGoal,
    );

    const newGoalId = new Types.ObjectId();

    return this.iapModel
      .findOneAndUpdate(
        { _id: iapId },
        {
          updatedBy: createGoal.createdBy,
          $push: {
            goals: {
              _id: newGoalId,
              ...createGoal,
            },
          },
        },
        {
          new: true,
        },
      )
      .select({
        goals: { $elemMatch: { _id: newGoalId } },
      })
      .lean()
      .exec()
      .then((result) => {
        if (!result) {
          throw new NotFoundException(
            `No Inventive Activity Plan found with id ${iapId.toString()}`,
          );
        }

        const [addedGoal] = result.goals;

        return addedGoal;
      });
  }

  async createIap(createIap: CreateIAP): Promise<IAP> {
    this.logger.debug(`Creating IAP`, createIap);
    return this.iapModel.create(createIap).then((iap) => iap.toObject());
  }

  async deployIap(iapId: MongoId): Promise<void> {
    this.logger.debug(`Deploying IAP with id ${iapId.toString()}`);

    const iap = await this.iapModel.findOne({ _id: iapId }).exec();

    if (!iap) {
      throw new NotFoundException(
        `No Inventive Activity Plan found with id: ${iapId.toString()}.`,
      );
    }

    // TODO: Tech Debt, find another way to decouple this
    iap.updatedBy = getCurrentUser() || '';
    iap.isDeployed = true;
    await iap.save();
  }

  async getActivities(): Promise<Activity[]> {
    this.logger.debug(`getActivities()`);
    return this.iapModel.aggregate([
      { $unwind: '$activityProviders' },
      { $unwind: '$activityProviders.activities' },
      { $replaceRoot: { newRoot: '$activityProviders.activities' } },
    ]);
  }

  async getActivity(activityId: MongoId): Promise<Activity> {
    this.logger.debug(`getActivity(activityId:${activityId.toString()})`);
    return this.iapModel
      .aggregate([
        { $unwind: '$activityProviders' },
        { $unwind: '$activityProviders.activities' },
        { $match: { 'activityProviders.activities._id': activityId } },
        { $replaceRoot: { newRoot: '$activityProviders.activities' } },
        { $limit: 1 },
      ])
      .then((activities) => {
        if (activities.length === 0) {
          throw new NotFoundException(
            `No Activity found with id: ${activityId.toString()}.`,
          );
        }

        return activities[0] as Activity;
      });
  }

  async getActivityProvider(apId: MongoId): Promise<ActivityProvider> {
    this.logger.debug(`getActivityProvider(apId:${apId.toString()})`);
    return this.iapModel
      .aggregate([
        { $unwind: '$activityProviders' },
        { $match: { 'activityProviders._id': apId } },
        { $replaceRoot: { newRoot: '$activityProviders' } },
        { $limit: 1 },
      ])
      .then((activities) => {
        if (activities.length === 0) {
          throw new NotFoundException(
            `No Activity Provider found with id: ${apId.toString()}.`,
          );
        }

        return activities[0] as ActivityProvider;
      });
  }

  async getActivityProviderActivities(apId: MongoId): Promise<Activity[]> {
    this.logger.debug(`getActivityProviderActivities(apId:${apId.toString()})`);
    return this.getActivityProvider(apId).then((ap) => ap.activities);
  }

  async getActivityProviders(): Promise<ActivityProvider[]> {
    this.logger.debug(`getActivityProviders()`);
    return this.iapModel.aggregate([
      { $unwind: '$activityProviders' },
      { $replaceRoot: { newRoot: '$activityProviders' } },
    ]);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getConfigurationInterfaceUrl(_apId: MongoId): Promise<ConfigInterface> {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getConfigurationParameters(_apId: MongoId): Promise<string[]> {
    throw new Error('Not implemented');
  }

  async getIAP(iapId: MongoId): Promise<IAP> {
    this.logger.debug(`getIAP(iapId:${iapId.toString()})`);
    const iap = await this.iapModel.findOne({ _id: iapId }).lean().exec();

    if (!iap) {
      throw new NotFoundException(
        `No Inventive Activity Plan found with id: ${iapId.toString()}.`,
      );
    }

    return iap;
  }

  async getIAPs(): Promise<IAP[]> {
    this.logger.debug(`getIAPs()`);
    return this.iapModel.find().lean().exec();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getActivityProviderRequiredFields(_apId: MongoIdScalar): Promise<string[]> {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getIAPAvailableMetrics(_iapId: MongoIdScalar): Promise<MetricGQLSchema[]> {
    throw new Error('Not implemented');
  }

  async removeActivity(activityId: MongoId): Promise<void> {
    this.logger.debug(`removeActivity(activityId:${activityId.toString()})`);
    // TODO: Tech Debt, find another way to decouple this
    const user = getCurrentUser();

    const result = await this.iapModel
      .updateOne(
        { 'activityProviders.activities._id': activityId },
        {
          updatedBy: user,
          $set: { 'activityProviders.$[provider].updatedBy': user },
          $pull: {
            'activityProviders.$[provider].activities': { _id: activityId },
          },
        },
        {
          arrayFilters: [{ 'provider.activities._id': activityId }],
        },
      )
      .exec();

    if (result.modifiedCount === 0) {
      throw new NotFoundException(
        `No Activity found with id: ${activityId.toString()}.`,
      );
    }
  }

  async removeActivityProvider(apId: MongoId): Promise<void> {
    this.logger.debug(`removeActivityProvider(apId:${apId.toString()})`);
    // TODO: Tech Debt, find another way to decouple this
    const user = getCurrentUser();

    await this.iapModel
      .updateOne(
        { 'activityProviders._id': apId },
        {
          updatedBy: user,
          $pull: { activityProviders: { _id: apId } },
        },
      )
      .exec();
  }

  async removeGoal(goalId: MongoId): Promise<void> {
    this.logger.debug(`removeGoal(goalId:${goalId.toString()})`);
    // TODO: Tech Debt, find another way to decouple this
    const user = getCurrentUser();

    const result = await this.iapModel
      .updateOne(
        { 'goals._id': goalId },
        {
          updatedBy: user,
          $pull: { goals: { _id: goalId } },
        },
      )
      .exec();

    if (result.modifiedCount === 0) {
      throw new NotFoundException(
        `No Goal found with id: ${goalId.toString()}.`,
      );
    }
  }

  async removeIap(iapId: MongoId): Promise<void> {
    this.logger.debug(`removeIap(iapId:${iapId.toString()})`);
    const result = await this.iapModel.findByIdAndDelete(iapId).lean().exec();

    if (!result) {
      throw new NotFoundException(
        `No Inventive Activity Plan found with id: ${iapId.toString()}.`,
      );
    }
  }
}
