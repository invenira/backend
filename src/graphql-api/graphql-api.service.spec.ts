import { Test, TestingModule } from '@nestjs/testing';
import { GraphqlApiService } from './graphql-api.service';
import { IAPService } from '../iap/iap.service';
import { createMock } from '@golevelup/ts-jest';
import { Types } from 'mongoose';

/* eslint-disable */
/* tslint-disable */

describe('ActivityProvidersService', () => {
  let module: TestingModule;
  let service: GraphqlApiService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        GraphqlApiService,
        { provide: IAPService, useValue: createMock<IAPService>() },
      ],
    }).compile();

    service = module.get<GraphqlApiService>(GraphqlApiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an activity', async () => {
    const iapService = module.get<IAPService>(IAPService);

    const apId = new Types.ObjectId();

    await service.createActivity(apId, {
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

    await service.createActivityProvider(iapId, {
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
