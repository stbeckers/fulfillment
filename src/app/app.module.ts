import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FulfillmentModule } from './fulfillment/fulfillment.module';

@Module({
  imports: [FulfillmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
