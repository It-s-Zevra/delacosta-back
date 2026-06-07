# Delacosta CRM · Backend API

API REST para Delacosta Studio. Usa **Notion como base de datos** (catálogo,
clientes y ventas) y expone endpoints limpios para que el front (tienda) y el
panel interno no hablen directamente con Notion.

Stack: **Node.js + TypeScript + Express + Zod**, ejecutado con `tsx`.

```
Categorías ──< Productos ──< Ítems del pedido >── Pedidos >── Clientes
```

---

## 1. Puesta en marcha

```bash
npm install
cp .env.example .env      # completa NOTION_TOKEN
npm run dev               # desarrollo con recarga
npm start                 # producción
npm run typecheck         # chequeo de tipos
```

### Variables de entorno (`.env`)

| Variable | Descripción |
|---|---|
| `NOTION_TOKEN` | Token de integración de Notion (Bearer). **Obligatorio.** |
| `NOTION_VERSION` | Versión de la API de Notion. Por defecto `2025-09-03` (requerida por *data sources*). |
| `PORT` | Puerto HTTP (por defecto `3000`). |
| `NODE_ENV` | `development` / `production`. |
| `CORS_ORIGIN` | Orígenes permitidos, separados por coma. `*` para todos. |
| `API_KEY` | Si se define, los endpoints de **escritura** exigen el header `x-api-key`. Vacío = abierto. |

### ⚠️ Paso obligatorio en Notion (una sola vez)

La integración debe estar **conectada a la página `Delacosta · CRM`** o la API
devuelve `404`. En Notion: abrí la página → menú `···` → **Conexiones** →
agregá la integración (*De La Costa*). Las 5 bases heredan el acceso.

Sin esto, cualquier endpoint que toque Notion responde:

```json
{ "error": "Notion devolvió 404: la base no está compartida con la integración. ..." }
```

---

## 2. Endpoints

Base URL: `/api`. Las respuestas vienen como `{ "data": ... }` (las listas
incluyen `count`). Los endpoints de escritura (POST/PATCH) respetan `API_KEY`.

### Salud
- `GET /health` — estado del servicio.

### Categorías
- `GET /api/categories` — lista (orden ascendente). `?activas=true` filtra visibles.
- `GET /api/categories/:id`
- `POST /api/categories` — `{ nombre, slug?, orden?, descripcion?, activa? }`
- `PATCH /api/categories/:id`

### Productos
- `GET /api/products` — filtros: `?estado=Activo` · `?categoria=<id>` · `?destacado=true` · `?search=anillo` · `?activos=true`
- `GET /api/products/catalogo` — catálogo público (solo `Estado = Activo`).
- `GET /api/products/:id`
- `GET /api/products/slug/:slug`
- `POST /api/products` — `{ nombre, categoriaIds?, precio?, precioOferta?, stock?, estado?, descripcion?, materiales?, urlImagen?, slug?, destacado?, pesoG? }`
- `PATCH /api/products/:id`
- `PATCH /api/products/:id/stock` — fija stock absoluto: `{ "stock": 23 }`
- `POST /api/products/:id/stock/adjust` — ajuste relativo: `{ "delta": -2 }`

### Clientes
- `GET /api/customers` — `?estado=VIP`
- `GET /api/customers/find?email=...` — busca por email.
- `GET /api/customers/:id`
- `POST /api/customers` — `{ nombre, email?, telefono?, rut?, direccion?, comuna?, region?, origen?, estado?, notas? }`
- `PATCH /api/customers/:id`

### Pedidos
- `GET /api/orders` — `?estado=Pendiente` · `?pago=Pagado` · `?cliente=<id>`
- `GET /api/orders/:id` — pedido **con sus ítems resueltos**.
- `POST /api/orders` — `{ clienteId, estadoPedido?, estadoPago?, metodoPago?, metodoEnvio?, direccionEnvio?, costoEnvio?, descuento?, fechaPedido?, notas? }`
- `PATCH /api/orders/:id`
- `POST /api/orders/:id/items` — agrega línea: `{ productoId, cantidad, precioUnitario? }` (si no se envía, **congela** el precio actual del producto).

### Checkout (flujo de compra completo)
- `POST /api/checkout` — en una sola llamada: busca/crea cliente → crea pedido → crea ítems (con precio congelado) → descuenta stock.

```jsonc
POST /api/checkout
{
  "cliente": { "nombre": "Ana", "email": "ana@correo.cl", "origen": "Instagram" },
  "items": [
    { "productId": "<page_id_producto>", "cantidad": 1 }
  ],
  "metodoPago": "Mercado Pago",
  "metodoEnvio": "BlueExpress",
  "costoEnvio": 3990,
  "direccionEnvio": "Av. Siempre Viva 742, Providencia"
}
```

`Subtotal`, `Total` y los totales del cliente son **rollups/fórmulas de Notion**:
el backend solo los lee, nunca los escribe.

---

## 3. Notas de diseño

- **Precio congelado:** al crear un ítem, el precio del producto se copia a
  `Precio unitario`. Si el producto cambia de precio mañana, los pedidos viejos
  conservan lo que el cliente pagó.
- **Stock sin operación atómica:** Notion no tiene incrementos atómicos. El
  backend lee → valida → escribe, serializando por producto (`withLock`) para
  evitar carreras dentro de un mismo proceso. Para múltiples instancias, mover
  el lock a un recurso compartido (Redis).
- **Rate limit / consistencia eventual:** el cliente de Notion reintenta con
  backoff ante `429` y `5xx`, respetando `Retry-After`.
- **IDs de Notion:** centralizados en [`src/notion/ids.ts`](src/notion/ids.ts).
  Si se recrean las bases en Notion, actualizarlos ahí.
- **Nombres de propiedades:** deben coincidir **exactamente** con Notion
  (tildes, mayúsculas y el símbolo `°`). Viven en los `*_PROPS` de cada mapper.

## 4. Estructura

```
src/
  config/env.ts          # carga y valida variables de entorno
  notion/
    client.ts            # wrapper REST de Notion (retry/backoff, paginación)
    ids.ts               # data_source_id de cada base
    props.ts             # lectura/escritura de propiedades de Notion
  mappers/               # Notion <-> dominio (category, product, customer, order, item)
  services/              # lógica de negocio (incluye checkout)
  validation/schemas.ts  # validación de entrada con Zod
  routes/                # endpoints Express
  middleware/            # auth, errores, async handler
  app.ts / server.ts     # bootstrap
```
