import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GraphqlApiModule } from './graphql-api/graphql-api.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import {
  DateScalar,
  MongoIdCustomScalar,
  RecordScalar,
  VoidScalar,
} from '@invenira/schemas';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { AuthModule } from './auth/auth.module';

const mongooseLogger = new Logger('Mongoose', { timestamp: true });

@Module({
  imports: [
    AuthModule,
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
    GraphqlApiModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [ConfigModule],
      driver: ApolloDriver,
      useFactory: (configService: ConfigService) => ({
        typePaths: [configService.get<string>('GRAPHQL_SCHEMA_PATH') || ''],
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
        playground: false,
        context: ({ req }: { req: never }) => ({ req }),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [DateScalar, RecordScalar, VoidScalar, MongoIdCustomScalar],
})
export class AppModule {}
