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

export const isProd = env.nodeEnv === "production";
