import { Module } from '@nestjs/common';
import { FulfillmentModule } from './fulfillment/fulfillment.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [FulfillmentModule, ConfigModule.forRoot(), AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
