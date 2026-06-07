import type { NotionPage } from "../notion/client.js";
import * as p from "../notion/props.js";

export const ORDER_PROPS = {
  numero: "N° de pedido",
  idPedido: "ID pedido",
  cliente: "Cliente",
  estadoPedido: "Estado del pedido",
  estadoPago: "Estado de pago",
  metodoPago: "Método de pago",
  metodoEnvio: "Método de envío",
  direccionEnvio: "Dirección de envío",
  seguimiento: "N° de seguimiento",
  costoEnvio: "Costo de envío",
  descuento: "Descuento",
  fechaPedido: "Fecha de pedido",
  fechaEnvio: "Fecha de envío",
  fechaEntrega: "Fecha de entrega",
  notas: "Notas",
  subtotal: "Subtotal",
  cantidadItems: "Cantidad de ítems",
  total: "Total",
  items: "Ítems del pedido",
} as const;

export const ORDER_ESTADOS = [
  "Pendiente",
  "Pagado",
  "En preparación",
  "Enviado",
  "Entregado",
  "Cancelado",
  "Reembolsado",
] as const;

export const ORDER_ESTADOS_PAGO = ["Pendiente", "Pagado", "Reembolsado"] as const;
export const ORDER_METODOS_PAGO = ["Mercado Pago", "Transferencia"] as const;
export const ORDER_METODOS_ENVIO = ["BlueExpress", "Retiro en taller"] as const;

export interface Order {
  id: string;
  numero: string;
  idPedido: string | null;
  clienteIds: string[];
  estadoPedido: string | null;
  estadoPago: string | null;
  metodoPago: string | null;
  metodoEnvio: string | null;
  direccionEnvio: string;
  seguimiento: string;
  costoEnvio: number | null;
  descuento: number | null;
  fechaPedido: string | null;
  fechaEnvio: string | null;
  fechaEntrega: string | null;
  notas: string;
  subtotal: number | null;
  cantidadItems: number | null;
  total: number | null;
  itemIds: string[];
}

export function toOrder(page: NotionPage): Order {
  const props = page.properties;
  return {
    id: page.id,
    numero: p.readTitle(props, ORDER_PROPS.numero),
    idPedido: p.readUniqueId(props, ORDER_PROPS.idPedido),
    clienteIds: p.readRelationIds(props, ORDER_PROPS.cliente),
    estadoPedido: p.readSelect(props, ORDER_PROPS.estadoPedido),
    estadoPago: p.readSelect(props, ORDER_PROPS.estadoPago),
    metodoPago: p.readSelect(props, ORDER_PROPS.metodoPago),
    metodoEnvio: p.readSelect(props, ORDER_PROPS.metodoEnvio),
    direccionEnvio: p.readRichText(props, ORDER_PROPS.direccionEnvio),
    seguimiento: p.readRichText(props, ORDER_PROPS.seguimiento),
    costoEnvio: p.readNumber(props, ORDER_PROPS.costoEnvio),
    descuento: p.readNumber(props, ORDER_PROPS.descuento),
    fechaPedido: p.readDate(props, ORDER_PROPS.fechaPedido),
    fechaEnvio: p.readDate(props, ORDER_PROPS.fechaEnvio),
    fechaEntrega: p.readDate(props, ORDER_PROPS.fechaEntrega),
    notas: p.readRichText(props, ORDER_PROPS.notas),
    subtotal: p.readRollupNumber(props, ORDER_PROPS.subtotal),
    cantidadItems: p.readRollupNumber(props, ORDER_PROPS.cantidadItems),
    total: typeof p.readFormula(props, ORDER_PROPS.total) === "number"
      ? (p.readFormula(props, ORDER_PROPS.total) as number)
      : null,
    itemIds: p.readRelationIds(props, ORDER_PROPS.items),
  };
}

export interface OrderInput {
  numero: string;
  clienteId?: string;
  estadoPedido?: string;
  estadoPago?: string;
  metodoPago?: string;
  metodoEnvio?: string;
  direccionEnvio?: string;
  seguimiento?: string;
  costoEnvio?: number;
  descuento?: number;
  fechaPedido?: string;
  fechaEnvio?: string;
  fechaEntrega?: string;
  notas?: string;
}

export function orderToProps(input: Partial<OrderInput>) {
  return p.buildProps({
    [ORDER_PROPS.numero]:
      input.numero !== undefined ? p.title(input.numero) : undefined,
    [ORDER_PROPS.cliente]:
      input.clienteId !== undefined ? p.relation(input.clienteId) : undefined,
    [ORDER_PROPS.estadoPedido]:
      input.estadoPedido !== undefined ? p.select(input.estadoPedido) : undefined,
    [ORDER_PROPS.estadoPago]:
      input.estadoPago !== undefined ? p.select(input.estadoPago) : undefined,
    [ORDER_PROPS.metodoPago]:
      input.metodoPago !== undefined ? p.select(input.metodoPago) : undefined,
    [ORDER_PROPS.metodoEnvio]:
      input.metodoEnvio !== undefined ? p.select(input.metodoEnvio) : undefined,
    [ORDER_PROPS.direccionEnvio]:
      input.direccionEnvio !== undefined ? p.richText(input.direccionEnvio) : undefined,
    [ORDER_PROPS.seguimiento]:
      input.seguimiento !== undefined ? p.richText(input.seguimiento) : undefined,
    [ORDER_PROPS.costoEnvio]:
      input.costoEnvio !== undefined ? p.number(input.costoEnvio) : undefined,
    [ORDER_PROPS.descuento]:
      input.descuento !== undefined ? p.number(input.descuento) : undefined,
    [ORDER_PROPS.fechaPedido]:
      input.fechaPedido !== undefined ? p.date(input.fechaPedido) : undefined,
    [ORDER_PROPS.fechaEnvio]:
      input.fechaEnvio !== undefined ? p.date(input.fechaEnvio) : undefined,
    [ORDER_PROPS.fechaEntrega]:
      input.fechaEntrega !== undefined ? p.date(input.fechaEntrega) : undefined,
    [ORDER_PROPS.notas]:
      input.notas !== undefined ? p.richText(input.notas) : undefined,
  });
}
