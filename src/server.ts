import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.port, () => {
  console.log(`🐚 Delacosta CRM API escuchando en http://localhost:${env.port}`);
  console.log(`   Entorno: ${env.nodeEnv} · Notion-Version: ${env.notionVersion}`);
  if (!env.apiKey) {
    console.log("   ⚠️  API_KEY vacía: los endpoints de escritura están abiertos.");
  }
});
