// context.interceptor.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { isObservable, of } from 'rxjs';

import { ContextService } from './context.service';
import { ContextInterceptor } from './context.interceptor';

describe('ContextInterceptor', () => {
  let interceptor: ContextInterceptor;
  let contextService: ContextService;

  beforeEach(async () => {
    // Provide the real ContextService (uses AsyncLocalStorage)
    contextService = new ContextService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContextInterceptor,
        {
          provide: ContextService,
          useValue: contextService,
        },
      ],
    }).compile();

    interceptor = module.get<ContextInterceptor>(ContextInterceptor);
  });

  it('should extract user from GQL context and store userId in ContextService', (done) => {
    // Mock GqlExecutionContext with the correct generic signature
    const mockGqlCtx: Partial<GqlExecutionContext> = {
      getContext: <T = never>() => {
        return {
          req: {
            user: { user: 'testUser' },
          },
        } as T;
      },
    };

    // Spy on GqlExecutionContext.create so our interceptor sees the mock
    jest.spyOn(GqlExecutionContext, 'create').mockImplementation(
      // cast to GqlExecutionContext
      () => mockGqlCtx as GqlExecutionContext,
    );

    // Create a minimal ExecutionContext
    const mockExecutionContext = {} as ExecutionContext;

    // Mock the "next" handler in the Nest chain
    const mockNext: CallHandler = {
      // We'll just emit 'handler result'
      handle: () => of('handler result'),
    };

    // The interceptor returns Observable<unknown> | Promise<Observable<unknown>>
    const result = interceptor.intercept(mockExecutionContext, mockNext);

    // Because of the union type, we check if it's an Observable or a Promise
    if (isObservable(result)) {
      // It's an Observable => subscribe directly
      result.subscribe({
        next: (value) => {
          // Expect the pipeline to return the mock value
          expect(value).toBe('handler result');
          // Check the stored context
          expect(contextService.get()).toEqual({ userId: 'testUser' });
        },
        error: (err: unknown) => fail(String(err)),
        complete: () => {
          done();
        },
      });
    } else {
      // It's a Promise<Observable<unknown>> => wait for the Observable
      result
        .then((observable) => {
          observable.subscribe({
            next: (value) => {
              expect(value).toBe('handler result');
              expect(contextService.get()).toEqual({ userId: 'testUser' });
            },
            error: (err: unknown) => fail(String(err)),
            complete: () => {
              done();
            },
          });
        })
        .catch((err: unknown) => {
          fail(String(err));
        });
    }
  });
});
