import { getTenant } from "../config/tenants.js";
import { sendMail } from "./mail.service.js";
import { buildCustomerOrderEmail } from "../templates/order-customer.template.js";
import { buildAdminOrderEmail } from "../templates/order-admin.template.js";
import type { MailerPayload } from "../utils/buildPayload.js";

export interface OrderConfirmationResult {
  messageIds: { customer: string | null; admin: string | null };
  partial: boolean;
}

export async function processOrderConfirmation(
  tenantId: string,
  order: MailerPayload
): Promise<OrderConfirmationResult> {
  const tenant = getTenant(tenantId);
  if (!tenant) throw new Error(`No tenant config found for "${tenantId}"`);

  if (!tenant.recipientEmail) {
    console.warn(`⚠️  TENANT_DELACOSTA_EMAIL not set — skipping admin email for order ${order.orderId}`);
  }

  const customerSubject = tenant.copy.customerSubject({ orderId: order.orderId });
  const adminSubject    = tenant.copy.adminSubject({
    orderId:      order.orderId,
    total:        order.totals.total,
    currency:     order.totals.currency,
    customerName: order.customer.fullName,
  });

  const customerHtml = buildCustomerOrderEmail(tenant, order);
  const adminHtml    = buildAdminOrderEmail(tenant, order);

  const promises: Promise<{ messageId: string; provider: string }>[] = [
    sendMail({ to: order.customer.email, subject: customerSubject, html: customerHtml, fromName: tenant.name }),
  ];

  if (tenant.recipientEmail) {
    promises.push(
      sendMail({
        to:       tenant.recipientEmail,
        subject:  adminSubject,
        html:     adminHtml,
        replyTo:  order.customer.email,
        fromName: `${tenant.name} · Pedidos`,
      })
    );
  }

  const results = await Promise.allSettled(promises);
  const customerRes = results[0]!;
  const adminRes    = results[1];

  const customerOk = customerRes.status === "fulfilled";
  const adminOk    = adminRes?.status === "fulfilled";

  if (!customerOk) {
    const err = (customerRes as PromiseRejectedResult).reason;
    console.error(`❌ Falló email al cliente (${order.orderId}): ${err?.message}`);
  }
  if (adminRes && !adminOk) {
    const err = (adminRes as PromiseRejectedResult).reason;
    console.error(`❌ Falló email al admin (${order.orderId}): ${err?.message}`);
  }

  if (!customerOk && (!adminRes || !adminOk)) {
    const customerErr = (customerRes as PromiseRejectedResult).reason?.message;
    const adminErr    = adminRes ? (adminRes as PromiseRejectedResult).reason?.message : "not sent";
    throw new Error(`Ambos emails fallaron. customer: ${customerErr} | admin: ${adminErr}`);
  }

  return {
    messageIds: {
      customer: customerOk ? (customerRes as PromiseFulfilledResult<{ messageId: string }>).value.messageId : null,
      admin:    adminOk    ? (adminRes   as PromiseFulfilledResult<{ messageId: string }>).value.messageId : null,
    },
    partial: !customerOk || (!!adminRes && !adminOk),
  };
}
