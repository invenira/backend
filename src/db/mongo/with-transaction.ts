import { ClientSession } from 'mongoose';
import { TransactionOptions } from 'mongodb';

// TODO: this probably should come from config as it will depend on the target env
const transactionOptions: TransactionOptions = {
  readConcern: {
    level: 'linearizable',
  },
  writeConcern: {
    w: 'majority',
    journal: true,
    wtimeoutMS: 300000,
  },
  readPreference: 'primary',
  maxCommitTimeMS: 300000,
};

export function WithTransaction() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalMethod = descriptor.value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor.value = async function (...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
      const session: ClientSession = await this.connection.startSession();
      session.startTransaction(transactionOptions);

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        const result = await originalMethod.apply(this, args);

        await session.commitTransaction();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return result;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        await session.endSession();
      }
    };
    return descriptor;
  };
}
