import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

const mongooseLogger = new Logger('Mongoose', { timestamp: true });

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
