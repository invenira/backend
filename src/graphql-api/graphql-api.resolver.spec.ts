import { Test, TestingModule } from '@nestjs/testing';
import { GraphqlApiResolver } from './graphql-api.resolver';
import { GraphqlApiService } from './graphql-api.service';

describe('ActivityProvidersResolver', () => {
  let resolver: GraphqlApiResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphqlApiResolver, GraphqlApiService],
    }).compile();

    resolver = module.get<GraphqlApiResolver>(GraphqlApiResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
