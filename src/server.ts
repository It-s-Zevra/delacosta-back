import { createApp } from "./app.js";
import { env, missingEnv } from "./config/env.js";

const app = createApp();

// Bind to 0.0.0.0 so platforms like Railway can route to the container.
app.listen(env.port, "0.0.0.0", () => {
  console.log(`🐚 Delacosta CRM API escuchando en 0.0.0.0:${env.port}`);
  console.log(`   Entorno: ${env.nodeEnv} · Notion-Version: ${env.notionVersion}`);
  if (missingEnv.length) {
    console.log(`   ⛔ Faltan variables: ${missingEnv.join(", ")} — las rutas de Notion fallarán hasta configurarlas.`);
  }
  if (!env.apiKey) {
    console.log("   ⚠️  API_KEY vacía: los endpoints de escritura están abiertos.");
  }
});
