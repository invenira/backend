import { ZodValidationPipe } from './zod-validation.pipe';
import { z } from 'zod';
import { UserInputError } from '@nestjs/apollo';

/* eslint-disable */
/* tslint-disable */

describe('ZodValidationPipe', () => {
  const schema = z.object({
    name: z.string(),
    age: z.number(),
  });

  let pipe: ZodValidationPipe;

  beforeEach(() => {
    pipe = new ZodValidationPipe(schema);
  });

  it('should return the validated value when input is valid', () => {
    const validInput = { name: 'John Doe', age: 25 };
    const result = pipe.transform(validInput);
    expect(result).toEqual(validInput);
  });

  it('should throw a UserInputError when validation fails', () => {
    const invalidInput = { name: 'John Doe', age: 'not-a-number' };

    expect(() => pipe.transform(invalidInput)).toThrow(UserInputError);
  });

  it('should include error details in the thrown error message', () => {
    const invalidInput = { name: 'John Doe', age: 'not-a-number' };

    try {
      pipe.transform(invalidInput);
    } catch (error: any) {
      expect(error.message).toContain('Request validation errors:');
      expect(error.message).toMatch(/Expected number/);
    }
  });
});
