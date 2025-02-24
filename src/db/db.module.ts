import { DynamicModule, Module } from '@nestjs/common';
import { MongoModule } from './mongo';

@Module({})
export class DbModule {
  static forRoot(): DynamicModule {
    const dbType = process.env.DB_TYPE || 'mongo';

    // There's only MongoDB for now.
    if (dbType !== 'mongo') {
      throw new Error('Invalid DB Type');
    }

    const chosenModule = MongoModule;

    return {
      module: DbModule,
      imports: [chosenModule],
      exports: [chosenModule],
    };
  }
}
