import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { FulfillmentService } from './app/fulfillment/fulfillment.service';
import { consumer, orderLineItem } from './data/mock-data';
import { AuthService } from './app/auth/auth.service';
import { retry } from 'ts-retry-promise';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const authService = app.get(AuthService);
  const fulfillmentService = app.get(FulfillmentService);

  // get access
  const authToken = await authService.getAuthToken();

  // create order
  const order = await fulfillmentService.createOrder(
    [orderLineItem],
    consumer,
    authToken,
  );

  // getting the pickjob
  // need to wrap this with retry as the server has no pickjobs instantly
  const strippedPickJob = await retry(
    () => fulfillmentService.getAllPickJobsForOrder(order.id, authToken),
    {
      backoff: 'FIXED',
      retries: 5,
      delay: 2000,
    },
  );
  console.log(strippedPickJob);

  // set pickjob in progress

  // perfect pick any item

  // close pickjob

  // revoke access
}
bootstrap();
