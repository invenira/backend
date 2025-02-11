import { Test, TestingModule } from '@nestjs/testing';
import { GraphqlApiResolver } from './graphql-api.resolver';
import { GraphqlApiService } from './graphql-api.service';
import { IAPService } from '../iap/iap.service';
import { createMock } from '@golevelup/ts-jest';
import { Types } from 'mongoose';

/* eslint-disable */
/* tslint-disable */

describe('GraphqlApiResolver', () => {
  let module: TestingModule;
  let resolver: GraphqlApiResolver;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        GraphqlApiResolver,
        GraphqlApiService,
        { provide: IAPService, useValue: createMock<IAPService>() },
      ],
    }).compile();

    resolver = module.get<GraphqlApiResolver>(GraphqlApiResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should create an activity', async () => {
    const iapService = module.get<IAPService>(IAPService);

    const apId = new Types.ObjectId();

    await resolver.createActivity(apId, {
      name: 'testActivity',
      description: 'testActivity description',
      parameters: {
        testParam: 123,
      },
    });

    expect(iapService.createActivity).toHaveBeenCalledWith(apId, {
      name: 'testActivity',
      description: 'testActivity description',
      parameters: {
        testParam: 123,
      },
    });
  });

  it('should create an activity provider', async () => {
    const iapService = module.get<IAPService>(IAPService);

    const iapId = new Types.ObjectId();

    await resolver.createActivityProvider(iapId, {
      name: 'testActivityProvider',
      description: 'testActivityProvider description',
      url: 'http://localhost',
    });

    expect(iapService.createActivityProvider).toHaveBeenCalledWith(iapId, {
      name: 'testActivityProvider',
      description: 'testActivityProvider description',
      url: 'http://localhost',
    });
  });
});
