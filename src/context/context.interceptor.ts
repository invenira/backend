

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ContextService } from './context.service';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class ContextInterceptor implements NestInterceptor {
  constructor(private context: ContextService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    const ctx = GqlExecutionContext.create(context);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    const { user } = ctx.getContext().req;

    const store = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      userId: user.user,
    };

    return new Observable((observer) => {
      this.context.runWith(store, () => {
        next.handle().subscribe({
          next: (res) => observer.next(res),
          error: (error) => observer.error(error),
          complete: () => observer.complete(),
        });
      });
    });
  }
}