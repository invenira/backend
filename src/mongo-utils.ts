import mongoose from 'mongoose';
import { BadRequestException } from '@nestjs/common';

export const checkIsValidMongoId = (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid id');
  }
};
