import { Module } from '@nestjs/common';
import { GraphqlApiService } from './graphql-api.service';
import { GraphqlApiResolver } from './graphql-api.resolver';
import { APP_GUARD } from '@nestjs/core';
import { GqlAuthGuard } from '../auth';
import { IAPModule } from '../iap';

@Module({
  imports: [IAPModule],
  providers: [
    GraphqlApiResolver,
    GraphqlApiService,
    {
      provide: APP_GUARD,
      useClass: GqlAuthGuard,
    },
  ],
})
export class GraphqlApiModule {}
