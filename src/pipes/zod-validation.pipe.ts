import { Injectable, PipeTransform } from '@nestjs/common';
import { z } from 'zod';
import { UserInputError } from '@nestjs/apollo';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.Schema) {}

  transform(value: object) {
    try {
      return this.schema.parse(value) as Required<z.infer<typeof this.schema>>;
    } catch (e: unknown) {
      throw new UserInputError(
        `Request validation errors: ` +
          (e as { errors: { message: string }[] }).errors
            .map((e: { message: string }) => e.message)
            .join('; '),
      );
    }
  }
}
