import { notion } from "../notion/client.js";
import { DATA_SOURCES } from "../notion/ids.js";
import {
  ORDER_PROPS,
  orderToProps,
  toOrder,
  type Order,
  type OrderInput,
} from "../mappers/order.js";
import {
  orderItemToProps,
  toOrderItem,
  type OrderItem,
  type OrderItemInput,
} from "../mappers/item.js";
import { HttpError } from "../utils/http-error.js";

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export async function listOrders(opts: {
  estadoPedido?: string;
  estadoPago?: string;
  clienteId?: string;
} = {}): Promise<Order[]> {
  const filters: Record<string, unknown>[] = [];
  if (opts.estadoPedido) {
    filters.push({ property: ORDER_PROPS.estadoPedido, select: { equals: opts.estadoPedido } });
  }
  if (opts.estadoPago) {
    filters.push({ property: ORDER_PROPS.estadoPago, select: { equals: opts.estadoPago } });
  }
  if (opts.clienteId) {
    filters.push({ property: ORDER_PROPS.cliente, relation: { contains: opts.clienteId } });
  }

  const body: Record<string, unknown> = {
    sorts: [{ property: ORDER_PROPS.fechaPedido, direction: "descending" }],
  };
  if (filters.length === 1) body.filter = filters[0];
  else if (filters.length > 1) body.filter = { and: filters };

  const pages = await notion.queryAll(DATA_SOURCES.pedidos, body);
  return pages.map(toOrder);
}

export async function getOrder(id: string): Promise<Order> {
  const page = await notion.getPage(id);
  return toOrder(page);
}

/** Order with its line items resolved from the bridge table. */
export async function getOrderWithItems(id: string): Promise<OrderWithItems> {
  const order = await getOrder(id);
  const items = await listItemsForOrder(id);
  return { ...order, items };
}

export async function listItemsForOrder(orderId: string): Promise<OrderItem[]> {
  const pages = await notion.queryAll(DATA_SOURCES.itemsPedido, {
    filter: { property: "Pedido", relation: { contains: orderId } },
  });
  return pages.map(toOrderItem);
}

/** Compute a human-readable order number like "#1001". */
export async function nextOrderNumber(): Promise<string> {
  const pages = await notion.queryAll(DATA_SOURCES.pedidos, {});
  return `#${1000 + pages.length + 1}`;
}

export async function createOrder(input: OrderInput): Promise<Order> {
  const numero = input.numero || (await nextOrderNumber());
  const page = await notion.createPage(
    DATA_SOURCES.pedidos,
    orderToProps({
      estadoPedido: "Pendiente",
      estadoPago: "Pendiente",
      ...input,
      numero,
    }),
  );
  return toOrder(page);
}

export async function updateOrder(
  id: string,
  input: Partial<OrderInput>,
): Promise<Order> {
  const page = await notion.updatePage(id, orderToProps(input));
  return toOrder(page);
}

export async function addItem(input: OrderItemInput): Promise<OrderItem> {
  if (!input.pedidoId) throw HttpError.badRequest("`pedidoId` es obligatorio");
  if (!input.productoId) throw HttpError.badRequest("`productoId` es obligatorio");
  if (!(input.cantidad > 0)) throw HttpError.badRequest("`cantidad` debe ser > 0");
  const page = await notion.createPage(DATA_SOURCES.itemsPedido, orderItemToProps(input));
  return toOrderItem(page);
}
