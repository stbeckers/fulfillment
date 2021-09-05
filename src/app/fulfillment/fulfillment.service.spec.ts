import { Test, TestingModule } from '@nestjs/testing';
import { FulfillmentService } from './fulfillment.service';
import { HttpModule, HttpService, NotFoundException } from '@nestjs/common';
import { consumer, mockOrder, orderLineItem } from '../../data/mock-data';
import { ConfigModule } from '@nestjs/config';
import { ZodError } from 'zod';
import { Order, OrderSchema } from './models/order.model';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('FulfillmentService', () => {
  let fulfillmentService: FulfillmentService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [FulfillmentService],
    }).compile();

    fulfillmentService = module.get<FulfillmentService>(FulfillmentService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should throw error on order creation if there are no order items provided', async () => {
    await expect(
      fulfillmentService.createOrder(null as any, consumer, ''),
    ).rejects.toThrow(ZodError);
    await expect(
      fulfillmentService.createOrder([], consumer, ''),
    ).rejects.toThrow(ZodError);
  });

  it('should throw error on order creation if there is no consumer', async () => {
    await expect(
      fulfillmentService.createOrder([orderLineItem], null as any, ''),
    ).rejects.toThrow(ZodError);
  });

  it('should throw error on order creation if the orderLineItem has a quantity of 0', async () => {
    const newOrderLineItem = { ...orderLineItem, quantity: 0 };

    await expect(
      fulfillmentService.createOrder([newOrderLineItem], consumer, ''),
    ).rejects.toThrow(ZodError);
  });

  it('should return valid created order', async () => {
    const response: AxiosResponse<Order> = {
      data: mockOrder,
      headers: {},
      config: { url: 'http://localhost:3000/mockUrl' },
      status: 200,
      statusText: 'OK',
    };

    jest.spyOn(httpService, 'post').mockImplementationOnce(() => of(response));
    const order: Order = await fulfillmentService.createOrder(
      [orderLineItem],
      consumer,
      'accessToken',
    );
    expect(OrderSchema.parse(order)).toEqual(order);
  });
});
