import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IAPEntity, IapSchema } from './entities/iap.entity';
import { MongoService } from './mongo.service';
import { DB_SERVICE } from '../db.service';

const mongooseLogger = new Logger('Mongoose', { timestamp: true });

@Module({
  imports: [
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
