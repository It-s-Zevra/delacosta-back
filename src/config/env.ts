import "dotenv/config";

/** Collected at load time so /health can report what's misconfigured. */
export const missingEnv: string[] = [];

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    // Don't crash the process (Railway would crash-loop and 502 even /health).
    // Boot anyway, warn loudly, and let Notion routes surface a clear error.
    missingEnv.push(name);
    console.warn(`⚠️  Falta la variable de entorno ${name}`);
    return "";
  }
  return value.trim();
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : fallback;
}

export const env = {
  notionToken: required("NOTION_TOKEN"),
  notionVersion: optional("NOTION_VERSION", "2025-09-03"),
  port: Number(optional("PORT", "3000")),
  nodeEnv: optional("NODE_ENV", "development"),
  corsOrigin: optional("CORS_ORIGIN", "*"),
  apiKey: process.env.API_KEY?.trim() || "",
};

/**
 * data_source_id de cada base de Notion. Se pueden sobreescribir por variable de
 * entorno; si no, se usan los IDs actuales del workspace «Delacosta · CRM».
 */
export const dataSources = {
  categorias: optional("DS_CATEGORIAS", "2e87b8b4-788c-82fa-a9ef-876039cb8ea6"),
  productos: optional("DS_PRODUCTOS", "3f17b8b4-788c-836d-95d7-074ad58c96e7"),
  clientes: optional("DS_CLIENTES", "8e67b8b4-788c-82d7-b4f5-87c856d6c35c"),
  pedidos: optional("DS_PEDIDOS", "2be7b8b4-788c-833a-a56f-07128fd10783"),
  itemsPedido: optional("DS_ITEMS", "86b7b8b4-788c-83a9-820d-077c38d780a8"),
} as const;

export const isProd = env.nodeEnv === "production";
