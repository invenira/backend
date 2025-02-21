import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IAPEntity, IapSchema } from './entities/iap.entity';
import { MongoService } from './mongo.service';
import { DB_SERVICE } from '../db.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';

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
