import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphqlApiModule } from './graphql-api';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import {
  DateScalar,
  MongoIdCustomScalar,
  RecordScalar,
  VoidScalar,
} from '@invenira/schemas';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { AuthModule } from './auth';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
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
