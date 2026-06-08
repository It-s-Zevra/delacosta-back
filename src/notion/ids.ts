/**
 * Notion identifiers for the Delacosta CRM.
 *
 * Notion exposes a `database_id` and, inside each base, one or more
 * `data_source_id` (collections). Reads/writes go through the `data_source_id`.
 *
 * The `data_source_id`s come from the environment (with the current workspace IDs
 * as defaults) — see `DS_*` in src/config/env.ts. Override them there if the
 * bases are ever recreated in Notion.
 */
import { dataSources } from "../config/env.js";

export const DATA_SOURCES = dataSources;

export const DATABASES = {
  categorias: "6607b8b4-788c-83e5-96f2-8113d2b0e874",
  productos: "d907b8b4-788c-83f9-8365-013f2b393f6e",
  clientes: "a897b8b4-788c-826b-afbf-81ea85250cb4",
  pedidos: "4757b8b4-788c-8349-a470-01e35dcd60eb",
  itemsPedido: "79c7b8b4-788c-8275-a076-8111f79ef80f",
} as const;
