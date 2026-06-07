import type { NotionPage } from "../notion/client.js";
import * as p from "../notion/props.js";

export const ITEM_PROPS = {
  item: "Ítem",
  pedido: "Pedido",
  producto: "Producto",
  cantidad: "Cantidad",
  precioUnitario: "Precio unitario",
  subtotal: "Subtotal",
} as const;

export interface OrderItem {
  id: string;
  item: string;
  pedidoIds: string[];
  productoIds: string[];
  cantidad: number | null;
  precioUnitario: number | null;
  subtotal: number | null;
}

export function toOrderItem(page: NotionPage): OrderItem {
  const props = page.properties;
  const subtotal = p.readFormula(props, ITEM_PROPS.subtotal);
  return {
    id: page.id,
    item: p.readTitle(props, ITEM_PROPS.item),
    pedidoIds: p.readRelationIds(props, ITEM_PROPS.pedido),
    productoIds: p.readRelationIds(props, ITEM_PROPS.producto),
    cantidad: p.readNumber(props, ITEM_PROPS.cantidad),
    precioUnitario: p.readNumber(props, ITEM_PROPS.precioUnitario),
    subtotal: typeof subtotal === "number" ? subtotal : null,
  };
}

export interface OrderItemInput {
  item: string;
  pedidoId: string;
  productoId: string;
  cantidad: number;
  /** Frozen price at sale time — copied from the product, never read live later. */
  precioUnitario: number;
}

export function orderItemToProps(input: OrderItemInput) {
  return p.buildProps({
    [ITEM_PROPS.item]: p.title(input.item),
    [ITEM_PROPS.pedido]: p.relation(input.pedidoId),
    [ITEM_PROPS.producto]: p.relation(input.productoId),
    [ITEM_PROPS.cantidad]: p.number(input.cantidad),
    [ITEM_PROPS.precioUnitario]: p.number(input.precioUnitario),
  });
}
