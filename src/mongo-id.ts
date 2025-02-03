import {
  createParamDecorator,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { checkIsValidMongoId } from './mongo-utils';
import { FastifyRequest } from 'fastify';

export const MongoId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request: FastifyRequest = ctx.switchToHttp().getRequest();
    const id = (request.params as { [k: string]: string }).id;

    if (!id) throw new NotFoundException();

    checkIsValidMongoId(id);
    return id;
  },
);
