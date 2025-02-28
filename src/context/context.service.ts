import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export type RequestContext = {
  userId: string;
};

@Injectable()
export class ContextService {
  private context: AsyncLocalStorage<RequestContext> = new AsyncLocalStorage();

  get() {
    const context = this.context.getStore();
    if (!context) {
      throw new Error('No context available');
    }
    return context;
  }

  runWith(context: RequestContext, callback: () => void) {
    this.context.run(context, callback);
  }
}
