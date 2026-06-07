import { notion } from "../notion/client.js";
import { DATA_SOURCES } from "../notion/ids.js";
import {
  CATEGORY_PROPS,
  categoryToProps,
  toCategory,
  type Category,
  type CategoryInput,
} from "../mappers/category.js";
import { HttpError } from "../utils/http-error.js";

export async function listCategories(opts: { soloActivas?: boolean } = {}): Promise<Category[]> {
  const body: Record<string, unknown> = {
    sorts: [{ property: CATEGORY_PROPS.orden, direction: "ascending" }],
  };
  if (opts.soloActivas) {
    body.filter = { property: CATEGORY_PROPS.activa, checkbox: { equals: true } };
  }
  const pages = await notion.queryAll(DATA_SOURCES.categorias, body);
  return pages.map(toCategory);
}

export async function getCategory(id: string): Promise<Category> {
  const page = await notion.getPage(id);
  return toCategory(page);
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  if (!input.nombre) throw HttpError.badRequest("`nombre` es obligatorio");
  const page = await notion.createPage(DATA_SOURCES.categorias, categoryToProps(input));
  return toCategory(page);
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>,
): Promise<Category> {
  const page = await notion.updatePage(id, categoryToProps(input));
  return toCategory(page);
}
