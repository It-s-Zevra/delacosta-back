import { z } from "zod";
import { PRODUCT_ESTADOS, PRODUCT_MATERIALES } from "../mappers/product.js";
import { CUSTOMER_ESTADOS, CUSTOMER_ORIGENES } from "../mappers/customer.js";
import {
  ORDER_ESTADOS,
  ORDER_ESTADOS_PAGO,
  ORDER_METODOS_ENVIO,
  ORDER_METODOS_PAGO,
} from "../mappers/order.js";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Fecha ISO esperada (YYYY-MM-DD)");

/* Categories */
export const categoryCreateSchema = z.object({
  nombre: z.string().min(1),
  slug: z.string().optional(),
  orden: z.number().optional(),
  descripcion: z.string().optional(),
  activa: z.boolean().optional(),
});
export const categoryUpdateSchema = categoryCreateSchema.partial();

/* Products */
export const productCreateSchema = z.object({
  nombre: z.string().min(1),
  categoriaIds: z.array(z.string()).optional(),
  precio: z.number().nonnegative().optional(),
  precioOferta: z.number().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative().optional(),
  estado: z.enum(PRODUCT_ESTADOS).optional(),
  descripcion: z.string().optional(),
  materiales: z.array(z.enum(PRODUCT_MATERIALES)).optional(),
  urlImagen: z.string().url().nullable().optional(),
  slug: z.string().optional(),
  destacado: z.boolean().optional(),
  pesoG: z.number().nonnegative().optional(),
});
export const productUpdateSchema = productCreateSchema.partial();

export const stockSetSchema = z.object({ stock: z.number().int().nonnegative() });
export const stockAdjustSchema = z.object({ delta: z.number().int() });

/* Customers */
export const customerCreateSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email().optional(),
  telefono: z.string().optional(),
  rut: z.string().optional(),
  direccion: z.string().optional(),
  comuna: z.string().optional(),
  region: z.string().optional(),
  origen: z.enum(CUSTOMER_ORIGENES).optional(),
  estado: z.enum(CUSTOMER_ESTADOS).optional(),
  notas: z.string().optional(),
});
export const customerUpdateSchema = customerCreateSchema.partial();

/* Orders */
export const orderCreateSchema = z.object({
  numero: z.string().optional(),
  clienteId: z.string().min(1),
  estadoPedido: z.enum(ORDER_ESTADOS).optional(),
  estadoPago: z.enum(ORDER_ESTADOS_PAGO).optional(),
  metodoPago: z.enum(ORDER_METODOS_PAGO).optional(),
  metodoEnvio: z.enum(ORDER_METODOS_ENVIO).optional(),
  direccionEnvio: z.string().optional(),
  seguimiento: z.string().optional(),
  costoEnvio: z.number().nonnegative().optional(),
  descuento: z.number().nonnegative().optional(),
  fechaPedido: isoDate.optional(),
  fechaEnvio: isoDate.optional(),
  fechaEntrega: isoDate.optional(),
  notas: z.string().optional(),
});
export const orderUpdateSchema = orderCreateSchema.partial().extend({
  clienteId: z.string().optional(),
});

export const itemCreateSchema = z.object({
  productoId: z.string().min(1),
  cantidad: z.number().int().positive(),
  precioUnitario: z.number().nonnegative().optional(),
  item: z.string().optional(),
});

/* Checkout */
export const checkoutSchema = z.object({
  cliente: customerCreateSchema,
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        cantidad: z.number().int().positive(),
      }),
    )
    .min(1),
  costoEnvio: z.number().nonnegative().optional(),
  descuento: z.number().nonnegative().optional(),
  metodoPago: z.enum(ORDER_METODOS_PAGO).optional(),
  metodoEnvio: z.enum(ORDER_METODOS_ENVIO).optional(),
  direccionEnvio: z.string().optional(),
  fechaPedido: isoDate.optional(),
  notas: z.string().optional(),
});
