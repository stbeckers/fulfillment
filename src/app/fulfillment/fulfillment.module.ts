import { HttpModule, Module } from '@nestjs/common';
import { FulfillmentService } from './fulfillment.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [FulfillmentService],
})
export class FulfillmentModule {}
