import { Test, TestingModule } from '@nestjs/testing';
import { ContextService } from './context.service';

describe('ContextService', () => {
  let contextService: ContextService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [ContextService],
    }).compile();

    contextService = moduleRef.get<ContextService>(ContextService);
  });

  describe('Happy Path', () => {
    it('should store and retrieve the context', () => {
      const testContext = { userId: 'testUser' };

      contextService.runWith(testContext, () => {
        const retrievedContext = contextService.get();
        expect(retrievedContext).toEqual(testContext);
      });
    });

    it('should run callback within the correct context', () => {
      const testContext = { userId: 'testUser' };
      let actualUserId: string | undefined;

      contextService.runWith(testContext, () => {
        // Within this callback, context should be set
        actualUserId = contextService.get().userId;
      });

      expect(actualUserId).toBe('testUser');
    });
  });

  describe('Error Path', () => {
    it('should throw an error when context is not available', () => {
      // We call get() outside of the runWith() callback
      expect(() => contextService.get()).toThrow('No context available');
    });
  });
});
