import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  Activity,
  ActivityProvider,
  CreateActivity,
  CreateActivityProvider,
  CreateGoal,
  CreateIAP,
  Goal,
  IAP,
  MongoId,
} from '@invenira/schemas';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { IAPEntity } from './entities/iap.entity';
import { getCurrentUser } from '../../current-user';
import { DbService } from '../db.service';
import { GoalEntity } from './entities/goal.entity';
import { ActivityProviderEntity } from './entities/activity-provider.entity';
import { ActivityEntity } from './entities/activity.entity';
import { WithTransaction } from './with-transaction';

@Injectable()
export class MongoService implements DbService {
  private readonly logger = new Logger(MongoService.name);

  constructor(
    @InjectModel(GoalEntity.name)
    private readonly goalModel: Model<GoalEntity>,
    @InjectModel(ActivityProviderEntity.name)
    private readonly activityProviderModel: Model<ActivityProviderEntity>,
    @InjectModel(ActivityEntity.name)
    private readonly activityModel: Model<ActivityEntity>,
    @InjectModel(IAPEntity.name)
    private readonly iapModel: Model<IAPEntity>,
    @InjectConnection()
    private connection: Connection,
  ) {
    this.connection.modelNames().forEach((modelName) => {
      this.logger.log(`Model loaded: ${modelName}`);
    });
  }

  // TODO: are transactions required for reading?
  async getActivities(): Promise<Activity[]> {
    this.logger.debug(`getActivities()`);
    return this.activityModel.find().lean().exec();
  }

  // TODO: are transactions required for reading?
  async getActivity(activityId: MongoId): Promise<Activity> {
    this.logger.debug(`getActivity(activityId:${activityId.toString()})`);
    const activity = await this.activityModel
      .findOne({ _id: activityId })
      .lean()
      .exec();

    if (!activity) {
      throw new NotFoundException(
        `Activity with id ${activityId.toString()} not found.`,
      );
    }

    return activity;
  }

  // TODO: are transactions required for reading?
  async getActivityProvider(apId: MongoId): Promise<ActivityProvider> {
    this.logger.debug(`getActivityProvider(apId:${apId.toString()})`);
    const activityProvider = await this.activityProviderModel
      .findOne({ _id: apId })
      .lean()
      .exec();

    if (!activityProvider) {
      throw new NotFoundException(
        `Activity Provider with id ${apId.toString()} not found.`,
      );
    }

    return activityProvider;
  }

  // TODO: are transactions required for reading?
  async getActivityProviderActivities(apId: MongoId): Promise<Activity[]> {
    this.logger.debug(`getActivityProviderActivities(apId:${apId.toString()})`);

    await this.getActivityProvider(apId);

    return this.activityModel.find({ activityProviderId: apId }).lean().exec();
  }

  // TODO: are transactions required for reading?
  async getActivityProviders(): Promise<ActivityProvider[]> {
    this.logger.debug(`getActivityProviders()`);
    return this.activityProviderModel.find().lean().exec();
  }

  // TODO: are transactions required for reading?
  async getIAP(iapId: MongoId): Promise<IAP> {
    this.logger.debug(`getIAP(apId:${iapId.toString()})`);
    const iap = await this.iapModel.findOne({ _id: iapId }).lean().exec();

    if (!iap) {
      throw new NotFoundException(
        `Inventive Activity Plan with id ${iapId.toString()} not found.`,
      );
    }

    return iap;
  }

  // TODO: are transactions required for reading?
  async getIAPs(): Promise<IAP[]> {
    this.logger.debug(`getIAPs()`);
    return this.iapModel.find().lean().exec();
  }

  @WithTransaction()
  async createActivityProvider(
    createActivityProvider: CreateActivityProvider,
  ): Promise<ActivityProvider> {
    this.logger.debug(`Saving Activity Provider`, createActivityProvider);
    return this.activityProviderModel
      .create(createActivityProvider)
      .then((activityProvider) => activityProvider.toObject());
  }

  @WithTransaction()
  async removeActivityProvider(apId: MongoId): Promise<void> {
    this.logger.debug(`removeActivityProvider(apId:${apId.toString()})`);

    const activities = await this.getActivityProviderActivities(apId);

    if (activities.length > 0) {
      throw new BadRequestException(
        `Activity Provider with id ${apId.toString()} contains Activities`,
      );
    }

    await this.activityProviderModel
      .findByIdAndDelete({ _id: apId })
      .lean()
      .exec();
  }

  @WithTransaction()
  async createActivity(
    iapId: MongoId,
    createActivity: CreateActivity,
  ): Promise<Activity> {
    this.logger.debug(
      `Attempt to create Activity with Activity Provider id ` +
        `${createActivity.activityProviderId.toString()} within IAP ` +
        `id ${iapId.toString()}`,
      createActivity,
    );

    const activity = await this.activityModel.create(createActivity);

    await this.iapModel.updateOne(
      { _id: iapId.toString() },
      {
        // TODO: Tech Debt, find another way to decouple this
        updatedBy: getCurrentUser(),
        $push: {
          activityIds: activity.id,
        },
      },
    );

    return activity.toObject();
  }

  @WithTransaction()
  async removeActivity(activityId: MongoId): Promise<void> {
    this.logger.debug(`removeActivity(activityId:${activityId.toString()})`);

    const activity = await this.activityModel
      .findByIdAndDelete({ _id: activityId.toString() })
      .exec();

    await this.iapModel.updateOne(
      { activityIds: activityId },
      {
        // TODO: Tech Debt, find another way to decouple this
        updatedBy: getCurrentUser(),
        pull: {
          activityIds: activityId,
        },
      },
    );

    if (!activity) {
      throw new NotFoundException(
        `Activity with id ${activityId.toString()} not found.`,
      );
    }
  }

  @WithTransaction()
  async createGoal(iapId: MongoId, createGoal: CreateGoal): Promise<Goal> {
    this.logger.debug(
      `Saving Goal within IAP with id ${iapId.toString()}`,
      createGoal,
    );

    await this.getIAP(iapId);

    const goal = await this.goalModel
      .create(createGoal)
      .then((goal) => goal.toObject());

    await this.iapModel.updateOne(
      { _id: iapId.toString() },
      {
        // TODO: Tech Debt, find another way to decouple this
        updatedBy: getCurrentUser(),
        $push: {
          goalIds: goal.id,
        },
      },
    );

    return goal;
  }

  @WithTransaction()
  async removeGoal(goalId: MongoId): Promise<void> {
    this.logger.debug(`removeGoal(goalId:${goalId.toString()})`);

    const goal = await this.goalModel
      .findByIdAndDelete({ _id: goalId.toString() })
      .exec();

    if (!goal) {
      throw new NotFoundException(
        `Goal with id ${goalId.toString()} not found.`,
      );
    }

    await this.iapModel.findOneAndUpdate(
      { goalIds: goalId },
      {
        // TODO: Tech Debt, find another way to decouple this
        updatedBy: getCurrentUser(),
        $pull: {
          goalIds: goalId,
        },
      },
    );
  }

  @WithTransaction()
  async createIap(createIap: CreateIAP): Promise<IAP> {
    this.logger.debug(`Creating IAP`, createIap);
    return this.iapModel.create(createIap).then((iap) => iap.toObject());
  }

  @WithTransaction()
  async removeIap(iapId: MongoId): Promise<void> {
    this.logger.debug(`removeIap(iapId:${iapId.toString()})`);
    const iap = await this.getIAP(iapId);

    await this.goalModel.deleteMany({ _id: { $in: iap.goalIds } });
    await this.activityModel.deleteMany({ _id: { $in: iap.activityIds } });
    await this.iapModel.findByIdAndDelete({ _id: iapId });
  }

  @WithTransaction()
  async deployIap(iapId: MongoId): Promise<void> {
    this.logger.debug(`Deploying IAP with id ${iapId.toString()}`);

    const iap = await this.iapModel.findOne({ _id: iapId }).exec();

    if (!iap) {
      throw new NotFoundException(
        `No Inventive Activity Plan found with id: ${iapId.toString()}.`,
      );
    }

    if (iap.isDeployed) {
      throw new BadRequestException(
        `IAP with id ${iapId.toString()} is already deployed`,
      );
    }

    // TODO: Tech Debt, find another way to decouple this
    iap.updatedBy = getCurrentUser() || '';
    iap.isDeployed = true;
    await iap.save();
  }
}
