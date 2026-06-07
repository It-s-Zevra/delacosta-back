import type { AddressInfo } from "node:net";
import { createApp } from "./app.js";
import { env, missingEnv } from "./config/env.js";

const app = createApp();

/**
 * Listen on the platform-provided PORT and also on 3000.
 *
 * On Railway the public domain routes to a fixed target port (3000 here), while
 * the container gets its own injected PORT. Binding both guarantees the domain
 * can always reach the app regardless of which PORT Railway injects. Duplicates
 * and "address in use" are ignored.
 */
const ports = Array.from(new Set([env.port, 3000].filter(Boolean)));

let announced = false;
function announce(actualPort: number) {
  if (announced) {
    console.log(`   ↪ también escuchando en :${actualPort}`);
    return;
  }
  announced = true;
  console.log(`🐚 Delacosta CRM API escuchando en 0.0.0.0:${actualPort}`);
  console.log(`   Entorno: ${env.nodeEnv} · Notion-Version: ${env.notionVersion}`);
  if (missingEnv.length) {
    console.log(`   ⛔ Faltan variables: ${missingEnv.join(", ")} — las rutas de Notion fallarán hasta configurarlas.`);
  }
  if (!env.apiKey) {
    console.log("   ⚠️  API_KEY vacía: los endpoints de escritura están abiertos.");
  }
}

for (const port of ports) {
  const server = app.listen(port, "0.0.0.0", () => {
    const actual = (server.address() as AddressInfo | null)?.port ?? port;
    announce(actual);
  });
  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") return; // another listener already covers it
    console.error(`No se pudo escuchar en :${port}:`, err.message);
  });
}
