import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
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
  categorias: optional("DS_CATEGORIAS", "5d01b258-839d-4514-bd8b-36c490f87d0a"),
  productos: optional("DS_PRODUCTOS", "c7dfe85f-8ff9-426e-be31-619d0206733c"),
  clientes: optional("DS_CLIENTES", "473aefac-4c0f-4901-b291-6fa13d2a6397"),
  pedidos: optional("DS_PEDIDOS", "43f9a040-313f-4ef6-9a98-841e979a9cf5"),
  itemsPedido: optional("DS_ITEMS", "2ec5fe50-c5a1-4f6b-a779-4982e742cb1e"),
} as const;

export const isProd = env.nodeEnv === "production";
