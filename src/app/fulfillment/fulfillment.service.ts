import { HttpService, Injectable } from '@nestjs/common';
import {
  Order,
  OrderForCreation,
  OrderLineItem,
  OrderLineItemArraySchema,
  OrderSchema,
} from './models/order.model';
import { Consumer, ConsumerSchema } from './models/consumer.model';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { v4 } from 'uuid';
import {
  StrippedPickJobs,
  StrippedPickJobsSchema,
} from './models/pick-job.model';

@Injectable()
export class FulfillmentService {
  protected API_URL = '';

  public constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.API_URL = configService.get<string>('FULFILLMENT_API_URL') || '';
  }

  public async createOrder(
    orderLineItems: OrderLineItem[],
    consumer: Consumer,
    authToken: string,
  ): Promise<Order> {
    const orderForCreation: OrderForCreation = {
      consumer: ConsumerSchema.parse(consumer),
      orderDate: new Date().toISOString(),
      orderLineItems: OrderLineItemArraySchema.parse(orderLineItems),
      tenantOrderId: v4(),
    };

    const response = await this.httpService
      .post(
        `${this.API_URL}/orders`,
        orderForCreation,
        this.createAuthorizationHeader(authToken),
      )
      .toPromise();
    return OrderSchema.parse(response.data);
  }

  public async getAllPickJobsForOrder(
    orderRef: string,
    authToken: string,
  ): Promise<StrippedPickJobs> {
    const response = await this.httpService
      .get(
        `${this.API_URL}/pickjobs?orderRef=${orderRef}`,
        this.createAuthorizationHeader(authToken),
      )
      .toPromise();
    return StrippedPickJobsSchema.parse(response.data);
  }

  // public setPickJobInProgress(): PickJob {
  //   return;
  // }
  // public pickPerfect(): PickJob {
  //   return;
  // }
  // public closePickJob(): PickJob {
  //   return;
  // }

  private createAuthorizationHeader(accessToken: string): AxiosRequestConfig {
    return {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }
}
