import { notion } from "../notion/client.js";
import { DATA_SOURCES } from "../notion/ids.js";
import {
  PRODUCT_PROPS,
  productToProps,
  toProduct,
  type Product,
  type ProductInput,
} from "../mappers/product.js";
import { HttpError } from "../utils/http-error.js";

export interface ProductQuery {
  estado?: string;
  categoriaId?: string;
  destacado?: boolean;
  search?: string;
  /** Convenience flag for the public storefront: estado = Activo. */
  soloActivos?: boolean;
}

export async function listProducts(query: ProductQuery = {}): Promise<Product[]> {
  const filters: Record<string, unknown>[] = [];

  const estado = query.soloActivos ? "Activo" : query.estado;
  if (estado) {
    filters.push({ property: PRODUCT_PROPS.estado, select: { equals: estado } });
  }
  if (query.destacado !== undefined) {
    filters.push({
      property: PRODUCT_PROPS.destacado,
      checkbox: { equals: query.destacado },
    });
  }
  if (query.categoriaId) {
    filters.push({
      property: PRODUCT_PROPS.categoria,
      relation: { contains: query.categoriaId },
    });
  }
  if (query.search) {
    filters.push({
      property: PRODUCT_PROPS.nombre,
      title: { contains: query.search },
    });
  }

  const body: Record<string, unknown> = {
    sorts: [{ property: PRODUCT_PROPS.destacado, direction: "descending" }],
  };
  if (filters.length === 1) body.filter = filters[0];
  else if (filters.length > 1) body.filter = { and: filters };

  const pages = await notion.queryAll(DATA_SOURCES.productos, body);
  return pages.map(toProduct);
}

export async function getProduct(id: string): Promise<Product> {
  const page = await notion.getPage(id);
  return toProduct(page);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const pages = await notion.queryAll(DATA_SOURCES.productos, {
    filter: { property: PRODUCT_PROPS.slug, rich_text: { equals: slug } },
    page_size: 1,
  });
  return pages.length > 0 ? toProduct(pages[0]!) : null;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  if (!input.nombre) throw HttpError.badRequest("`nombre` es obligatorio");
  const page = await notion.createPage(DATA_SOURCES.productos, productToProps(input));
  return toProduct(page);
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<Product> {
  const page = await notion.updatePage(id, productToProps(input));
  return toProduct(page);
}

/**
 * Adjust stock by a delta (negative to decrement). Reads current stock, validates,
 * then writes. Notion has no atomic increment, so callers that need to avoid races
 * across concurrent purchases should serialise per product (see checkout service).
 */
export async function adjustStock(id: string, delta: number): Promise<Product> {
  const current = await getProduct(id);
  const currentStock = current.stock ?? 0;
  const next = currentStock + delta;
  if (next < 0) {
    throw HttpError.conflict(
      `Stock insuficiente para «${current.nombre}»: disponible ${currentStock}, solicitado ${-delta}`,
      { productId: id, disponible: currentStock, solicitado: -delta },
    );
  }
  const page = await notion.updatePage(id, productToProps({ stock: next }));
  return toProduct(page);
}

export async function setStock(id: string, stock: number): Promise<Product> {
  if (stock < 0) throw HttpError.badRequest("`stock` no puede ser negativo");
  const page = await notion.updatePage(id, productToProps({ stock }));
  return toProduct(page);
}
