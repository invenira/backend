import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IAPEntity, IapSchema } from './entities/iap.entity';
import { MongoService } from './mongo.service';
import { DB_SERVICE } from '../db.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { GoalEntity, GoalEntitySchema } from './entities/goal.entity';
import {
  ActivityProviderEntity,
  ActivityProviderEntitySchema,
} from './entities/activity-provider.entity';
import {
  ActivityEntity,
  ActivityEntitySchema,
} from './entities/activity.entity';
import { UserEntity, UserEntitySchema } from './entities/user.entity';
import { DeployEntity, DeployEntitySchema } from './entities/deploy.entity';

const mongooseLogger = new Logger('Mongoose', { timestamp: true });

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        onConnectionCreate: (connection: Connection) => {
          connection.on('connected', () => mongooseLogger.log('connected'));
          connection.on('open', () => mongooseLogger.log('connection open'));
          connection.on('disconnected', () =>
            mongooseLogger.log('disconnected'),
          );
          connection.on('reconnected', () => mongooseLogger.log('reconnected'));
          connection.on('disconnecting', () =>
            mongooseLogger.log('disconnecting'),
          );

          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeatureAsync([
      {
        name: GoalEntity.name,
        useFactory: () => {
          const schema = GoalEntitySchema;

          schema.post('save', (next: { _doc: object }) => {
            mongooseLogger.debug(`Saving Goal: ${JSON.stringify(next._doc)}`);
          });

          return schema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: ActivityProviderEntity.name,
        useFactory: () => {
          const schema = ActivityProviderEntitySchema;

          schema.post('save', (next: { _doc: object }) => {
            mongooseLogger.debug(
              `Saving Activity Provider: ${JSON.stringify(next._doc)}`,
            );
          });

          return schema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: ActivityEntity.name,
        useFactory: () => {
          const schema = ActivityEntitySchema;

          schema.post('save', (next: { _doc: object }) => {
            mongooseLogger.debug(
              `Saving Activity: ${JSON.stringify(next._doc)}`,
            );
          });

          return schema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: IAPEntity.name,
        useFactory: () => {
          const schema = IapSchema;

          schema.post('save', (next: { _doc: object }) => {
            mongooseLogger.debug(`Saving IAP: ${JSON.stringify(next._doc)}`);
          });

          return schema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: UserEntity.name,
        useFactory: () => {
          const schema = UserEntitySchema;

          schema.post('save', (next: { _doc: object }) => {
            mongooseLogger.debug(`Saving User: ${JSON.stringify(next._doc)}`);
          });

          return schema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: DeployEntity.name,
        useFactory: () => {
          const schema = DeployEntitySchema;

          schema.post('save', (next: { _doc: object }) => {
            mongooseLogger.debug(`Saving Deploy: ${JSON.stringify(next._doc)}`);
          });

          return schema;
        },
      },
    ]),
  ],
  providers: [
    {
      provide: DB_SERVICE,
      useClass: MongoService,
    },
  ],
  exports: [DB_SERVICE],
})
export class MongoModule {}
