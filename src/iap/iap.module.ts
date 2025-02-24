import { Module } from '@nestjs/common';
import { DbModule } from '../db';
import { IAPService } from './iap.service';

@Module({
  imports: [DbModule.forRoot()],
  exports: [IAPService],
  providers: [IAPService],
})
export class IAPModule {}
