import type { NotionPage } from "../notion/client.js";
import * as p from "../notion/props.js";

export const CUSTOMER_PROPS = {
  nombre: "Nombre",
  email: "Email",
  telefono: "Teléfono",
  rut: "RUT",
  direccion: "Dirección",
  comuna: "Comuna",
  region: "Región",
  origen: "Origen",
  estado: "Estado",
  notas: "Notas",
  fechaRegistro: "Fecha de registro",
  pedidos: "Pedidos",
  totalGastado: "Total gastado",
  numPedidos: "N° de pedidos",
} as const;

export const CUSTOMER_ORIGENES = [
  "Instagram",
  "TikTok",
  "WhatsApp",
  "Web",
  "Referido",
  "Otro",
] as const;

export const CUSTOMER_ESTADOS = [
  "Nuevo",
  "Recurrente",
  "VIP",
  "Inactivo",
] as const;

export interface Customer {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  rut: string;
  direccion: string;
  comuna: string;
  region: string;
  origen: string | null;
  estado: string | null;
  notas: string;
  fechaRegistro: string | null;
  pedidoIds: string[];
  totalGastado: number | null;
  numPedidos: number | null;
}

export function toCustomer(page: NotionPage): Customer {
  const props = page.properties;
  return {
    id: page.id,
    nombre: p.readTitle(props, CUSTOMER_PROPS.nombre),
    email: p.readEmail(props, CUSTOMER_PROPS.email),
    telefono: p.readPhone(props, CUSTOMER_PROPS.telefono),
    rut: p.readRichText(props, CUSTOMER_PROPS.rut),
    direccion: p.readRichText(props, CUSTOMER_PROPS.direccion),
    comuna: p.readRichText(props, CUSTOMER_PROPS.comuna),
    region: p.readRichText(props, CUSTOMER_PROPS.region),
    origen: p.readSelect(props, CUSTOMER_PROPS.origen),
    estado: p.readSelect(props, CUSTOMER_PROPS.estado),
    notas: p.readRichText(props, CUSTOMER_PROPS.notas),
    fechaRegistro: p.readCreatedTime(props, CUSTOMER_PROPS.fechaRegistro),
    pedidoIds: p.readRelationIds(props, CUSTOMER_PROPS.pedidos),
    totalGastado: p.readRollupNumber(props, CUSTOMER_PROPS.totalGastado),
    numPedidos: p.readRollupNumber(props, CUSTOMER_PROPS.numPedidos),
  };
}

export interface CustomerInput {
  nombre: string;
  email?: string;
  telefono?: string;
  rut?: string;
  direccion?: string;
  comuna?: string;
  region?: string;
  origen?: string;
  estado?: string;
  notas?: string;
}

export function customerToProps(input: Partial<CustomerInput>) {
  return p.buildProps({
    [CUSTOMER_PROPS.nombre]:
      input.nombre !== undefined ? p.title(input.nombre) : undefined,
    [CUSTOMER_PROPS.email]:
      input.email !== undefined ? p.email(input.email) : undefined,
    [CUSTOMER_PROPS.telefono]:
      input.telefono !== undefined ? p.phone(input.telefono) : undefined,
    [CUSTOMER_PROPS.rut]:
      input.rut !== undefined ? p.richText(input.rut) : undefined,
    [CUSTOMER_PROPS.direccion]:
      input.direccion !== undefined ? p.richText(input.direccion) : undefined,
    [CUSTOMER_PROPS.comuna]:
      input.comuna !== undefined ? p.richText(input.comuna) : undefined,
    [CUSTOMER_PROPS.region]:
      input.region !== undefined ? p.richText(input.region) : undefined,
    [CUSTOMER_PROPS.origen]:
      input.origen !== undefined ? p.select(input.origen) : undefined,
    [CUSTOMER_PROPS.estado]:
      input.estado !== undefined ? p.select(input.estado) : undefined,
    [CUSTOMER_PROPS.notas]:
      input.notas !== undefined ? p.richText(input.notas) : undefined,
  });
}
