import { HttpError } from "../utils/http-error.js";
import { withLock } from "../utils/keyed-lock.js";
import * as products from "./products.service.js";
import * as customers from "./customers.service.js";
import * as orders from "./orders.service.js";
import type { CustomerInput } from "../mappers/customer.js";
import type { OrderWithItems } from "./orders.service.js";

export interface CheckoutLine {
  productId: string;
  cantidad: number;
}

export interface CheckoutInput {
  cliente: CustomerInput;
  items: CheckoutLine[];
  costoEnvio?: number;
  descuento?: number;
  metodoPago?: string;
  metodoEnvio?: string;
  direccionEnvio?: string;
  fechaPedido?: string;
  notas?: string;
}

/**
 * Full purchase flow (per the CRM doc):
 *   1. Validate catalog + stock for every line.
 *   2. Find or create the customer (by email).
 *   3. Create the order.
 *   4. Create each line item, freezing the unit price at sale time.
 *   5. Decrement stock (serialised per product to avoid races).
 *
 * Subtotal / Total / customer rollups are computed by Notion; we read them back.
 */
export async function checkout(input: CheckoutInput): Promise<OrderWithItems> {
  if (!input.items?.length) {
    throw HttpError.badRequest("El pedido necesita al menos un ítem");
  }

  // 1. Resolve products and validate availability up front.
  const lines = await Promise.all(
    input.items.map(async (line) => {
      if (!line.productId) throw HttpError.badRequest("Cada ítem requiere `productId`");
      if (!(line.cantidad > 0)) {
        throw HttpError.badRequest("Cada ítem requiere `cantidad` > 0");
      }
      const product = await products.getProduct(line.productId);
      if (product.estado && product.estado !== "Activo") {
        throw HttpError.conflict(
          `«${product.nombre}» no está disponible (estado: ${product.estado})`,
          { productId: product.id, estado: product.estado },
        );
      }
      const precioUnitario = product.precioOferta ?? product.precio;
      if (precioUnitario == null) {
        throw HttpError.conflict(`«${product.nombre}» no tiene precio definido`, {
          productId: product.id,
        });
      }
      if ((product.stock ?? 0) < line.cantidad) {
        throw HttpError.conflict(
          `Stock insuficiente para «${product.nombre}»: disponible ${product.stock ?? 0}, solicitado ${line.cantidad}`,
          { productId: product.id, disponible: product.stock ?? 0, solicitado: line.cantidad },
        );
      }
      return { product, cantidad: line.cantidad, precioUnitario };
    }),
  );

  // 2. Customer.
  const customer = await customers.findOrCreateCustomer(input.cliente);

  // 3. Order.
  const order = await orders.createOrder({
    numero: "",
    clienteId: customer.id,
    estadoPedido: "Pendiente",
    estadoPago: "Pendiente",
    metodoPago: input.metodoPago,
    metodoEnvio: input.metodoEnvio,
    direccionEnvio: input.direccionEnvio,
    costoEnvio: input.costoEnvio,
    descuento: input.descuento,
    fechaPedido: input.fechaPedido,
    notas: input.notas,
  });

  // 4 + 5. Items (frozen price) and stock decrement, serialised per product.
  for (const line of lines) {
    await orders.addItem({
      item: `${order.numero} · ${line.product.nombre} x${line.cantidad}`,
      pedidoId: order.id,
      productoId: line.product.id,
      cantidad: line.cantidad,
      precioUnitario: line.precioUnitario,
    });
    await withLock(line.product.id, () =>
      products.adjustStock(line.product.id, -line.cantidad),
    );
  }

  // Read the order back so rollups (Subtotal, Total) are reflected.
  return orders.getOrderWithItems(order.id);
}
