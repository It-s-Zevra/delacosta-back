import type { NotionPage } from "../notion/client.js";
import * as p from "../notion/props.js";

export const PRODUCT_PROPS = {
  nombre: "Nombre",
  sku: "SKU",
  categoria: "Categoría",
  precio: "Precio",
  precioOferta: "Precio oferta",
  stock: "Stock",
  estado: "Estado",
  descripcion: "Descripción",
  materiales: "Materiales",
  imagenes: "Imágenes",
  urlImagen: "URL imagen",
  slug: "Slug",
  destacado: "Destacado",
  peso: "Peso (g)",
  fechaCreacion: "Fecha de creación",
  unidadesVendidas: "Unidades vendidas",
} as const;

export const PRODUCT_ESTADOS = [
  "Activo",
  "Agotado",
  "Borrador",
  "Descontinuado",
] as const;

export const PRODUCT_MATERIALES = [
  "Perlas de río",
  "Oro",
  "Plata",
  "Piedras naturales",
  "Acero",
] as const;

export interface Product {
  id: string;
  nombre: string;
  sku: string | null;
  categoriaIds: string[];
  precio: number | null;
  precioOferta: number | null;
  stock: number | null;
  estado: string | null;
  descripcion: string;
  materiales: string[];
  urlImagen: string | null;
  slug: string;
  destacado: boolean;
  pesoG: number | null;
  fechaCreacion: string | null;
  unidadesVendidas: number | null;
}

export function toProduct(page: NotionPage): Product {
  const props = page.properties;
  return {
    id: page.id,
    nombre: p.readTitle(props, PRODUCT_PROPS.nombre),
    sku: p.readUniqueId(props, PRODUCT_PROPS.sku),
    categoriaIds: p.readRelationIds(props, PRODUCT_PROPS.categoria),
    precio: p.readNumber(props, PRODUCT_PROPS.precio),
    precioOferta: p.readNumber(props, PRODUCT_PROPS.precioOferta),
    stock: p.readNumber(props, PRODUCT_PROPS.stock),
    estado: p.readSelect(props, PRODUCT_PROPS.estado),
    descripcion: p.readRichText(props, PRODUCT_PROPS.descripcion),
    materiales: p.readMultiSelect(props, PRODUCT_PROPS.materiales),
    urlImagen:
      p.readUrl(props, PRODUCT_PROPS.urlImagen) ??
      p.readFirstFileUrl(props, PRODUCT_PROPS.imagenes),
    slug: p.readRichText(props, PRODUCT_PROPS.slug),
    destacado: p.readCheckbox(props, PRODUCT_PROPS.destacado),
    pesoG: p.readNumber(props, PRODUCT_PROPS.peso),
    fechaCreacion: p.readCreatedTime(props, PRODUCT_PROPS.fechaCreacion),
    unidadesVendidas: p.readRollupNumber(props, PRODUCT_PROPS.unidadesVendidas),
  };
}

export interface ProductInput {
  nombre: string;
  categoriaIds?: string[];
  precio?: number;
  precioOferta?: number | null;
  stock?: number;
  estado?: string;
  descripcion?: string;
  materiales?: string[];
  urlImagen?: string | null;
  slug?: string;
  destacado?: boolean;
  pesoG?: number;
}

export function productToProps(input: Partial<ProductInput>) {
  return p.buildProps({
    [PRODUCT_PROPS.nombre]:
      input.nombre !== undefined ? p.title(input.nombre) : undefined,
    [PRODUCT_PROPS.categoria]:
      input.categoriaIds !== undefined ? p.relation(input.categoriaIds) : undefined,
    [PRODUCT_PROPS.precio]:
      input.precio !== undefined ? p.number(input.precio) : undefined,
    [PRODUCT_PROPS.precioOferta]:
      input.precioOferta !== undefined ? p.number(input.precioOferta) : undefined,
    [PRODUCT_PROPS.stock]:
      input.stock !== undefined ? p.number(input.stock) : undefined,
    [PRODUCT_PROPS.estado]:
      input.estado !== undefined ? p.select(input.estado) : undefined,
    [PRODUCT_PROPS.descripcion]:
      input.descripcion !== undefined ? p.richText(input.descripcion) : undefined,
    [PRODUCT_PROPS.materiales]:
      input.materiales !== undefined ? p.multiSelect(input.materiales) : undefined,
    [PRODUCT_PROPS.urlImagen]:
      input.urlImagen !== undefined ? p.url(input.urlImagen) : undefined,
    [PRODUCT_PROPS.slug]:
      input.slug !== undefined ? p.richText(input.slug) : undefined,
    [PRODUCT_PROPS.destacado]:
      input.destacado !== undefined ? p.checkbox(input.destacado) : undefined,
    [PRODUCT_PROPS.peso]:
      input.pesoG !== undefined ? p.number(input.pesoG) : undefined,
  });
}
