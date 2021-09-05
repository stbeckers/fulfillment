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

export const lineItemArticle: LineItemArticle = {
  attributes: [],
  tenantArticleId: v4(),
  title: 'PlayStation 5',
};

export const orderLineItem: OrderLineItem = {
  article: lineItemArticle,
  id: '',
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
  orderLineItems: [orderLineItem],
  status: OrderStatus.enum.OPEN,
  version: 0,
};
