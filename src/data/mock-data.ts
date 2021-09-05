import {
  Order,
  OrderLineItem,
  OrderStatus,
} from '../app/fulfillment/models/order.model';
import {
  Consumer,
  ConsumerAddress,
} from '../app/fulfillment/models/consumer.model';
import { LineItemArticle } from '../app/fulfillment/models/shared.model';
import { v4 } from 'uuid';
import {
  DeliveryChannel,
  PickJob,
  PickJobDeliveryInformation,
  PickLineItem,
  PickStatus,
} from '../app/fulfillment/models/pick-job.model';

export const lineItemArticle: LineItemArticle = {
  attributes: [],
  tenantArticleId: v4(),
  title: 'PlayStation 5',
};

export const orderLineItem: OrderLineItem = {
  article: lineItemArticle,
  id: v4(),
  quantity: 1,
  scannableCodes: [],
  shopPrice: 1,
};

export const lineItemArticle2: LineItemArticle = {
  attributes: [],
  tenantArticleId: v4(),
  title: 'FIFA 22',
};

export const orderLineItem2: OrderLineItem = {
  article: lineItemArticle2,
  id: v4(),
  quantity: 1,
  scannableCodes: [],
  shopPrice: 1,
};

export const consumerAddress: ConsumerAddress = {
  city: 'Düsseldorf',
  country: 'DE',
  houseNumber: '17a',
  lastName: 'Meier',
  postalCode: '40226',
  street: 'Werdener Straße',
};

export const consumer: Consumer = {
  addresses: [consumerAddress],
  email: 'test@test.de',
};

export const mockOrder: Order = {
  consumer: consumer,
  id: v4(),
  orderDate: new Date().toISOString(),
  orderLineItems: [orderLineItem, orderLineItem2],
  status: OrderStatus.enum.OPEN,
  version: 1,
};

export const mockPickLineItem: PickLineItem = {
  article: lineItemArticle,
  id: v4(),
  picked: 0,
  quantity: 5,
  status: PickStatus.enum.OPEN,
};

export const mockDeliveryInformation: PickJobDeliveryInformation = {
  channel: DeliveryChannel.enum.SHIPPING,
  targetTime: new Date().toISOString(),
};

export const mockPickJob: PickJob = {
  deliveryinformation: mockDeliveryInformation,
  facilityRef: '',
  id: v4(),
  orderDate: new Date().toISOString(),
  pickLineItems: [mockPickLineItem],
  shortId: 'shortId',
  status: PickStatus.enum.OPEN,
  version: 1,
};
