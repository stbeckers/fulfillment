import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { FulfillmentService } from './app/fulfillment/fulfillment.service';
import { consumer, orderLineItem, orderLineItem2 } from './data/mock-data';
import { AuthService } from './app/auth/auth.service';
import { retry } from 'ts-retry-promise';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const authService = app.get(AuthService);
  const fulfillmentService = app.get(FulfillmentService);

  // get access
  const authToken = await authService.getAuthToken();

  console.log('create order');
  const order = await fulfillmentService.createOrder(
    [orderLineItem, orderLineItem2],
    consumer,
    authToken,
  );

  console.log('getting the pickjob');
  // need to wrap this with retry as the server has no pickjobs instantly
  const strippedPickJob = await retry(
    () => fulfillmentService.getAllPickJobsForOrder(order.id, authToken),
    {
      backoff: 'FIXED',
      retries: 5,
      delay: 2000,
    },
  );

  console.log('set pickjob in progress');
  const updatedPickJobs = await Promise.all(
    strippedPickJob.pickjobs.map(
      async pickJob =>
        await fulfillmentService.setPickJobInProgress(
          pickJob.id,
          pickJob.version,
          authToken,
        ),
    ),
  );

  console.log('perfect pick any item and close pickjob');
  await Promise.all(
    updatedPickJobs.map(
      async pickJob =>
        await fulfillmentService.pickPerfectAndClosePickJob(pickJob, authToken),
    ),
  );

  // revoke access
}
bootstrap();
