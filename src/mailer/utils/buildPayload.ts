import type { Customer } from "../../mappers/customer.js";
import type { Order } from "../../mappers/order.js";
import type { CheckoutInput } from "../../services/checkout.service.js";

export interface MailerPayload {
  orderId: string;
  items: { name: string; quantity: number; unitPrice: number; subtotal: number }[];
  customer: { fullName: string; email: string; phone: string | null };
  shipping: {
    method: "delivery" | "pickup";
    address: string | null;
    notes: string | null;
  };
  totals: {
    productsSubtotal: number;
    shippingBase: number;
    total: number;
    currency: "CLP";
  };
  payment: {
    method: string;
    status: "pending_validation" | "paid";
  };
}

interface BuildPayloadArgs {
  lines: Array<{ product: { nombre: string }; cantidad: number; precioUnitario: number }>;
  customer: Customer;
  order: Order;
  input: CheckoutInput;
}

export function buildMailPayload({ lines, customer, order, input }: BuildPayloadArgs): MailerPayload {
  const itemsData = lines.map((l) => ({
    name:       l.product.nombre,
    quantity:   l.cantidad,
    unitPrice:  l.precioUnitario,
    subtotal:   l.cantidad * l.precioUnitario,
  }));

  const productsSubtotal = itemsData.reduce((acc, it) => acc + it.subtotal, 0);
  const shippingBase     = input.costoEnvio ?? 0;
  const discount         = input.descuento  ?? 0;
  const total            = productsSubtotal + shippingBase - discount;

  const method = input.metodoEnvio === "Retiro en taller" ? "pickup" : "delivery";

  return {
    orderId: order.numero || `#${Date.now()}`,
    items:   itemsData,
    customer: {
      fullName: customer.nombre,
      email:    customer.email ?? "",
      phone:    customer.telefono ?? null,
    },
    shipping: {
      method,
      address: input.direccionEnvio ?? null,
      notes:   input.notas ?? null,
    },
    totals: {
      productsSubtotal,
      shippingBase,
      total,
      currency: "CLP",
    },
    payment: {
      method: input.metodoPago ?? "Transferencia",
      status: order.estadoPago === "Pagado" ? "paid" : "pending_validation",
    },
  };
}
