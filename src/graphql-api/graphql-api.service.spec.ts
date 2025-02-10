import { Test, TestingModule } from '@nestjs/testing';
import { GraphqlApiService } from './graphql-api.service';

describe('ActivityProvidersService', () => {
  let service: GraphqlApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphqlApiService],
    }).compile();

    service = module.get<GraphqlApiService>(GraphqlApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
