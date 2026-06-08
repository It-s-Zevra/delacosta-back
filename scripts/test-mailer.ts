/**
 * Test de emails — llama directamente a processOrderConfirmation
 * con un payload realista y manda ambos emails (cliente + admin).
 *
 * Uso: npx tsx scripts/test-mailer.ts [email-cliente]
 * Por defecto envía al mismo email de prueba.
 */
import "dotenv/config";
import { processOrderConfirmation } from "../src/mailer/services/order.service.js";
import type { MailerPayload } from "../src/mailer/utils/buildPayload.js";

const testEmail = process.argv[2] ?? "sarai1010blanco@gmail.com";

const payload: MailerPayload = {
  orderId: "#1042",
  items: [
    {
      name:      "Collar Perlas de Río Dorado",
      quantity:  1,
      unitPrice: 34990,
      subtotal:  34990,
    },
    {
      name:      "Aretes Piedra Natural Labradorita",
      quantity:  2,
      unitPrice: 18990,
      subtotal:  37980,
    },
  ],
  customer: {
    fullName: "Sarai Blanco",
    email:    testEmail,
    phone:    "+56 9 9999 9999",
  },
  shipping: {
    method:  "delivery",
    address: "Av. Providencia 1234, Providencia, Santiago",
    notes:   "Dejar en conserjería si no hay nadie.",
  },
  totals: {
    productsSubtotal: 72970,
    shippingBase:     4990,
    total:            77960,
    currency:         "CLP",
  },
  payment: {
    method: "Transferencia",
    status: "pending_validation",
  },
};

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`📧 Delacosta Studio — Test de emails`);
console.log(`   Tenant:  delacosta`);
console.log(`   Pedido:  ${payload.orderId}`);
console.log(`   Cliente: ${payload.customer.fullName} <${payload.customer.email}>`);
console.log(`   Total:   $${payload.totals.total.toLocaleString("es-CL")}`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

try {
  const result = await processOrderConfirmation("delacosta", payload);
  console.log("\n✅ Emails enviados exitosamente");
  console.log(`   customer messageId: ${result.messageIds.customer ?? "—"}`);
  console.log(`   admin    messageId: ${result.messageIds.admin    ?? "—"}`);
  console.log(`   partial: ${result.partial}`);
} catch (err) {
  const e = err as Error;
  console.error("\n❌ Error enviando emails:", e.message);
  process.exit(1);
}
