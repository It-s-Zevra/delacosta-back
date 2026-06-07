/**
 * Notion identifiers for the Delacosta CRM.
 *
 * Notion exposes a `database_id` and, inside each base, one or more
 * `data_source_id` (collections). Reads/writes go through the `data_source_id`.
 *
 * If the bases are ever recreated in Notion, update these IDs here.
 */
export const DATA_SOURCES = {
  categorias: "5d01b258-839d-4514-bd8b-36c490f87d0a",
  productos: "c7dfe85f-8ff9-426e-be31-619d0206733c",
  clientes: "473aefac-4c0f-4901-b291-6fa13d2a6397",
  pedidos: "43f9a040-313f-4ef6-9a98-841e979a9cf5",
  itemsPedido: "2ec5fe50-c5a1-4f6b-a779-4982e742cb1e",
} as const;

export const DATABASES = {
  categorias: "16509e08-9936-4fd2-9e8c-9ac3a7edc450",
  productos: "6c78e23e-2a65-43f5-a656-ad9067627ef5",
  clientes: "eac6fee7-4f11-4ad2-a5fc-f9ee2b51b88c",
  pedidos: "77c2f2c5-be0b-4d45-8af8-e9ab66f7a3ff",
  itemsPedido: "d4112a59-0f06-4935-abc8-a5f6115645d9",
} as const;

export const CRM_PAGE_ID = "3780c8a0-e557-8106-a51a-eb8b01c80247";
