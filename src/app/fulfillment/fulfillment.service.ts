import { ConflictException, HttpService, Injectable } from '@nestjs/common';
import {
  Order,
  OrderForCreation,
  OrderForCreationSchema,
  OrderLineItem,
  OrderLineItemArraySchema,
  OrderSchema,
} from './models/order.model';
import { Consumer, ConsumerSchema } from './models/consumer.model';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { v4 } from 'uuid';
import {
  ModificationAction,
  ModifyPickJobActionSchema,
  ModifyPickLineItemActionSchema,
  PickingPatchActions,
  PickingPatchActionsSchema,
  PickJob,
  PickJobSchema,
  PickLineItem,
  PickStatus,
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
    const orderForCreation: OrderForCreation = OrderForCreationSchema.parse({
      consumer: ConsumerSchema.parse(consumer),
      orderDate: new Date().toISOString(),
      orderLineItems: OrderLineItemArraySchema.parse(orderLineItems),
      tenantOrderId: v4(),
    });

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

  public async setPickJobInProgress(
    pickJobId: string,
    currentVersion: number,
    authToken: string,
  ): Promise<PickJob> {
    const inProgressAction = ModifyPickJobActionSchema.parse({
      action: ModificationAction.enum.ModifyPickJob,
      status: PickStatus.enum.IN_PROGRESS,
    });
    const pickingPatchActions: PickingPatchActions = PickingPatchActionsSchema.parse(
      {
        version: currentVersion,
        actions: [inProgressAction],
      },
    );
    const response = await this.httpService
      .patch(
        `${this.API_URL}/pickjobs/${pickJobId}`,
        pickingPatchActions,
        this.createAuthorizationHeader(authToken),
      )
      .toPromise();
    const patchedPickJob: PickJob = PickJobSchema.parse(response.data);
    this.validateNewPickJob(
      currentVersion,
      PickStatus.enum.IN_PROGRESS,
      patchedPickJob,
    );
    return patchedPickJob;
  }

  public async pickPerfectAndClosePickJob(
    pickJob: PickJob,
    authToken: string,
  ): Promise<PickJob> {
    const closeAction = ModifyPickJobActionSchema.parse({
      action: ModificationAction.enum.ModifyPickJob,
      status: PickStatus.enum.CLOSED,
    });
    const modifyLineItemsActions = pickJob.pickLineItems.map(pickLineItem =>
      ModifyPickLineItemActionSchema.parse({
        action: ModificationAction.enum.ModifyPickLineItem,
        id: pickLineItem.id,
        picked: pickLineItem.quantity,
        status: PickStatus.enum.CLOSED,
      }),
    );
    const pickingPatchActions: PickingPatchActions = PickingPatchActionsSchema.parse(
      {
        version: pickJob.version,
        actions: [closeAction, ...modifyLineItemsActions],
      },
    );
    const response = await this.httpService
      .patch(
        `${this.API_URL}/pickjobs/${pickJob.id}`,
        pickingPatchActions,
        this.createAuthorizationHeader(authToken),
      )
      .toPromise();
    const patchedPickJob: PickJob = PickJobSchema.parse(response.data);
    this.validateNewPickJob(
      pickJob.version,
      PickStatus.enum.CLOSED,
      patchedPickJob,
    );
    return patchedPickJob;
  }

  private validateNewPickJob(
    currentVersion: number,
    desiredState: any,
    newPickJob: PickJob,
  ): void {
    if (
      newPickJob.version !== currentVersion + 1 ||
      desiredState !== newPickJob.status ||
      (desiredState === PickStatus.enum.CLOSED &&
        this.validateEveryItemPerfectPicked(newPickJob.pickLineItems))
    ) {
      throw new ConflictException();
    }
  }

  private validateEveryItemPerfectPicked(
    pickLineItems: PickLineItem[],
  ): boolean {
    return !pickLineItems.every(
      pickLineItem =>
        pickLineItem.status === PickStatus.enum.CLOSED &&
        pickLineItem.picked === pickLineItem.quantity,
    );
  }

  private createAuthorizationHeader(accessToken: string): AxiosRequestConfig {
    return {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }
}
