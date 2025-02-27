import { Module } from '@nestjs/common';
import { GraphqlApiService } from './graphql-api.service';
import { GraphqlApiResolver } from './graphql-api.resolver';
import { IAPModule } from '../iap';

@Module({
  imports: [IAPModule],
  providers: [GraphqlApiResolver, GraphqlApiService],
})
export class GraphqlApiModule {}
