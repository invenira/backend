import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, grant access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Extract the user from the GraphQL context
    const ctx = GqlExecutionContext.create(context);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    const { user } = ctx.getContext().req;

    if (!user) {
      this.logger.warn('Unauthorized request');
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const result = requiredRoles.some((role) => user.roles?.includes(role));

    if (!result) {
      this.logger.warn(
        `Unauthorized user, missing role(s): ${requiredRoles.join(', ')}`,
      );
    }

    return result;
  }
}
