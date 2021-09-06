import { Test, TestingModule } from '@nestjs/testing';
import { FulfillmentService } from './fulfillment.service';
import { ConflictException, HttpModule, HttpService } from '@nestjs/common';
import {
  consumer,
  mockOrder,
  mockPickJob,
  orderLineItem,
} from '../../data/mock-data';
import { ConfigModule } from '@nestjs/config';
import { ZodError } from 'zod';
import {
  Order,
  OrderForCreation,
  OrderForCreationSchema,
  OrderSchema,
} from './models/order.model';
import { of } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  ModificationAction,
  PickingPatchActionsSchema,
  PickJob,
  PickJobSchema,
  PickStatus,
} from './models/pick-job.model';

const headers: AxiosRequestConfig = {
  headers: {
    Authorization: 'Bearer authToken',
  },
};

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

    jest
      .spyOn(httpService, 'post')
      .mockImplementationOnce((url, data: OrderForCreation, config) => {
        expect(OrderForCreationSchema.parse(data)).toEqual(data);
        expect(url).toEqual('/orders');
        expect(data.consumer).toEqual(consumer);
        expect(data.orderLineItems).toEqual([orderLineItem]);
        expect(config).toEqual(headers);
        return of(response);
      });
    const order: Order = await fulfillmentService.createOrder(
      [orderLineItem],
      consumer,
      'authToken',
    );

    expect(OrderSchema.parse(order)).toEqual(order);
  });

  it('should return valid patched pickjob', async () => {
    const newMockPickJob: PickJob = {
      ...mockPickJob,
      version: 2,
      status: PickStatus.enum.IN_PROGRESS,
    };
    const response: AxiosResponse<PickJob> = {
      data: newMockPickJob,
      headers: {},
      config: { url: 'http://localhost:3000/mockUrl' },
      status: 200,
      statusText: 'OK',
    };

    jest.spyOn(httpService, 'patch').mockImplementationOnce(() => of(response));

    const pickJob: PickJob = await fulfillmentService.setPickJobInProgress(
      mockPickJob.id,
      mockPickJob.version,
      'authToken',
    );
    expect(httpService.patch).toBeCalledWith(
      `/pickjobs/${mockPickJob.id}`,
      PickingPatchActionsSchema.parse({
        version: mockPickJob.version,
        actions: [
          {
            action: ModificationAction.enum.ModifyPickJob,
            status: PickStatus.enum.IN_PROGRESS,
          },
        ],
      }),
      headers,
    );
    expect(PickJobSchema.parse(pickJob)).toEqual(pickJob);
  });

  it('should throw error if version is not incremented on setPickJobInProgress', async () => {
    const newMockPickJob: PickJob = {
      ...mockPickJob,
      version: 3,
      status: PickStatus.enum.IN_PROGRESS,
    };
    const response: AxiosResponse<PickJob> = {
      data: newMockPickJob,
      headers: {},
      config: { url: 'http://localhost:3000/mockUrl' },
      status: 200,
      statusText: 'OK',
    };

    jest.spyOn(httpService, 'patch').mockImplementationOnce(() => of(response));
    await expect(
      fulfillmentService.setPickJobInProgress(
        mockPickJob.id,
        mockPickJob.version,
        'authToken',
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw error if state is not IN_PROGRESS after setPickJobInProgress', async () => {
    const newMockPickJob: PickJob = { ...mockPickJob, version: 2 };
    const response: AxiosResponse<PickJob> = {
      data: newMockPickJob,
      headers: {},
      config: { url: 'http://localhost:3000/mockUrl' },
      status: 200,
      statusText: 'OK',
    };

    jest.spyOn(httpService, 'patch').mockImplementationOnce(() => of(response));
    await expect(
      fulfillmentService.setPickJobInProgress(
        mockPickJob.id,
        mockPickJob.version,
        'authToken',
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('should return valid closed pickjob', async () => {
    const newMockPickJob: PickJob = {
      ...mockPickJob,
      version: 2,
      status: PickStatus.enum.CLOSED,
      pickLineItems: [
        {
          ...mockPickJob.pickLineItems[0],
          picked: mockPickJob.pickLineItems[0].quantity,
          status: PickStatus.enum.CLOSED,
        },
      ],
    };
    const response: AxiosResponse<PickJob> = {
      data: newMockPickJob,
      headers: {},
      config: { url: 'http://localhost:3000/mockUrl' },
      status: 200,
      statusText: 'OK',
    };

    jest.spyOn(httpService, 'patch').mockImplementationOnce(() => of(response));

    const pickJob: PickJob = await fulfillmentService.pickPerfectAndClosePickJob(
      mockPickJob,
      'authToken',
    );

    expect(httpService.patch).toBeCalledWith(
      `/pickjobs/${mockPickJob.id}`,
      PickingPatchActionsSchema.parse({
        version: mockPickJob.version,
        actions: [
          {
            action: ModificationAction.enum.ModifyPickJob,
            status: PickStatus.enum.CLOSED,
          },
          {
            action: ModificationAction.enum.ModifyPickLineItem,
            id: mockPickJob.pickLineItems[0].id,
            picked: mockPickJob.pickLineItems[0].quantity,
            status: PickStatus.enum.CLOSED,
          },
        ],
      }),
      headers,
    );
    expect(PickJobSchema.parse(pickJob)).toEqual(pickJob);
  });

  it('should throw error if version is not incremented on pickPerfectAndClosePickJob', async () => {
    const newMockPickJob: PickJob = {
      ...mockPickJob,
      version: 3,
      status: PickStatus.enum.CLOSED,
      pickLineItems: [
        {
          ...mockPickJob.pickLineItems[0],
          picked: mockPickJob.pickLineItems[0].quantity,
          status: PickStatus.enum.CLOSED,
        },
      ],
    };
    const response: AxiosResponse<PickJob> = {
      data: newMockPickJob,
      headers: {},
      config: { url: 'http://localhost:3000/mockUrl' },
      status: 200,
      statusText: 'OK',
    };

    jest.spyOn(httpService, 'patch').mockImplementationOnce(() => of(response));
    await expect(
      fulfillmentService.pickPerfectAndClosePickJob(mockPickJob, 'authToken'),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw error if state of any PickItem is not CLOSED after pickPerfectAndClosePickJob', async () => {
    const newMockPickJob: PickJob = {
      ...mockPickJob,
      version: 3,
      status: PickStatus.enum.CLOSED,
      pickLineItems: [
        {
          ...mockPickJob.pickLineItems[0],
          picked: mockPickJob.pickLineItems[0].quantity,
          status: PickStatus.enum.IN_PROGRESS,
        },
      ],
    };
    const response: AxiosResponse<PickJob> = {
      data: newMockPickJob,
      headers: {},
      config: { url: 'http://localhost:3000/mockUrl' },
      status: 200,
      statusText: 'OK',
    };

    jest.spyOn(httpService, 'patch').mockImplementationOnce(() => of(response));

    await expect(
      fulfillmentService.pickPerfectAndClosePickJob(mockPickJob, 'authToken'),
    ).rejects.toThrow(ConflictException);
  });
});
