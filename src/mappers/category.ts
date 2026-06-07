import type { NotionPage } from "../notion/client.js";
import * as p from "../notion/props.js";

export const CATEGORY_PROPS = {
  nombre: "Nombre",
  slug: "Slug",
  orden: "Orden",
  descripcion: "Descripción",
  activa: "Activa",
} as const;

export interface Category {
  id: string;
  nombre: string;
  slug: string;
  orden: number | null;
  descripcion: string;
  activa: boolean;
}

export function toCategory(page: NotionPage): Category {
  const props = page.properties;
  return {
    id: page.id,
    nombre: p.readTitle(props, CATEGORY_PROPS.nombre),
    slug: p.readRichText(props, CATEGORY_PROPS.slug),
    orden: p.readNumber(props, CATEGORY_PROPS.orden),
    descripcion: p.readRichText(props, CATEGORY_PROPS.descripcion),
    activa: p.readCheckbox(props, CATEGORY_PROPS.activa),
  };
}

export interface CategoryInput {
  nombre: string;
  slug?: string;
  orden?: number;
  descripcion?: string;
  activa?: boolean;
}

export function categoryToProps(input: Partial<CategoryInput>) {
  return p.buildProps({
    [CATEGORY_PROPS.nombre]:
      input.nombre !== undefined ? p.title(input.nombre) : undefined,
    [CATEGORY_PROPS.slug]:
      input.slug !== undefined ? p.richText(input.slug) : undefined,
    [CATEGORY_PROPS.orden]:
      input.orden !== undefined ? p.number(input.orden) : undefined,
    [CATEGORY_PROPS.descripcion]:
      input.descripcion !== undefined ? p.richText(input.descripcion) : undefined,
    [CATEGORY_PROPS.activa]:
      input.activa !== undefined ? p.checkbox(input.activa) : undefined,
  });
}
