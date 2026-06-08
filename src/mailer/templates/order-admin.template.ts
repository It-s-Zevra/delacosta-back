import { formatMoney, escapeHtml, nl2br, isColorDark } from "../utils/format.js";
import { buildEmailHead } from "./_partials.js";
import type { TenantConfig } from "../config/tenants.js";
import type { MailerPayload } from "../utils/buildPayload.js";

export function buildAdminOrderEmail(tenant: TenantConfig, order: MailerPayload): string {
  const { brand, name } = tenant;
  const { orderId, items, customer, shipping, totals, payment } = order;
  const currency = totals.currency;

  const headerTextColor = isColorDark(brand.primaryColor) ? brand.bgColor : brand.textColor;
  const headerSubColor  = isColorDark(brand.primaryColor) ? "rgba(244,227,178,0.75)" : `${brand.textColor}88`;

  const statusLabel = payment.status === "paid" ? "PAGADO" : "PENDIENTE DE VALIDACIÓN";
  const statusBg    = payment.status === "paid" ? "#2e6b3a" : brand.primaryColor;
  const statusFg    = brand.bgColor;

  const itemRows = items.map((it) => `
                <tr>
                  <td class="dark-text divider" style="padding:12px 12px;border-bottom:1px solid ${brand.borderColor};font-family:${brand.bodyFont};font-size:14px;color:${brand.textColor};vertical-align:top;">
                    <strong style="font-weight:600;">${escapeHtml(it.name)}</strong>
                  </td>
                  <td class="dark-text divider" style="padding:12px 12px;border-bottom:1px solid ${brand.borderColor};font-family:${brand.bodyFont};font-size:14px;color:${brand.textColor};text-align:center;vertical-align:top;width:80px;">
                    ${escapeHtml(String(it.quantity))} × ${formatMoney(it.unitPrice, currency)}
                  </td>
                  <td class="dark-text divider" style="padding:12px 12px;border-bottom:1px solid ${brand.borderColor};font-family:${brand.bodyFont};font-size:14px;color:${brand.textColor};text-align:right;vertical-align:top;width:110px;font-weight:600;">
                    ${formatMoney(it.subtotal, currency)}
                  </td>
                </tr>`).join("");

  const shippingLabel = shipping.method === "pickup" ? "Retiro en taller" : "Envío a domicilio";

  const dateStr = new Date().toLocaleString("es-CL", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es" xml:lang="es">
${buildEmailHead({ title: `Nuevo pedido ${escapeHtml(orderId)} — ${escapeHtml(name)}`, brand })}
<body bgcolor="${brand.bgColor}" class="cream-bg" style="margin:0;padding:0;background-color:${brand.bgColor};font-family:${brand.bodyFont};color:${brand.textColor};">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${brand.bgColor}" class="cream-bg" style="background-color:${brand.bgColor};">
    <tr>
      <td align="center" bgcolor="${brand.bgColor}" class="cream-bg" style="padding:32px 16px 40px;background-color:${brand.bgColor};">

        <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" bgcolor="${brand.cardBg}" class="card-bg" style="max-width:640px;width:100%;background-color:${brand.cardBg};border:1px solid ${brand.borderColor};border-radius:14px;overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td bgcolor="${brand.primaryColor}" class="wine-bg" style="background-color:${brand.primaryColor};padding:28px 36px;text-align:center;">
              <img src="${brand.logoUrl}" alt="${escapeHtml(name)}" width="100" style="display:block;margin:0 auto 12px;border:0;outline:none;max-width:100px;height:auto;" />
              <p class="cream-text" style="margin:0 0 4px;font-family:${brand.fontFamily};font-size:12px;font-weight:600;letter-spacing:0.28em;color:${headerTextColor};text-transform:uppercase;">
                ${escapeHtml(name)} · Pedidos
              </p>
              <p class="cream-text" style="margin:0;font-family:${brand.bodyFont};font-size:11px;color:${headerSubColor};letter-spacing:0.06em;">
                ${escapeHtml(dateStr)}
              </p>
            </td>
          </tr>

          <!-- TITLE -->
          <tr>
            <td style="padding:30px 36px 6px;">
              <p class="muted-text" style="margin:0 0 6px;font-family:${brand.bodyFont};font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${brand.secondaryText};">
                Nuevo pedido
              </p>
              <h1 class="wine-text" style="margin:0 0 12px;font-family:${brand.fontFamily};font-size:28px;font-weight:700;color:${brand.primaryColor};letter-spacing:-0.01em;line-height:1.15;">
                ${escapeHtml(orderId)}
              </h1>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px;">
                <tr>
                  <td bgcolor="${statusBg}" class="${payment.status === "paid" ? "" : "wine-bg cream-text"}" style="background-color:${statusBg};color:${statusFg};font-family:${brand.bodyFont};font-size:11px;font-weight:700;letter-spacing:0.14em;padding:6px 14px;border-radius:999px;text-transform:uppercase;">
                    ${escapeHtml(statusLabel)}
                  </td>
                </tr>
              </table>
              <p class="dark-text" style="margin:0;font-family:${brand.fontFamily};font-size:28px;font-weight:700;color:${brand.textColor};letter-spacing:-0.01em;">
                ${formatMoney(totals.total, currency)}
              </p>
            </td>
          </tr>

          <!-- CUSTOMER -->
          <tr>
            <td style="padding:24px 36px 0;">
              <p class="muted-text" style="margin:0 0 8px;font-family:${brand.bodyFont};font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${brand.secondaryText};">Cliente</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${brand.cardBg}" class="body-bg" style="background-color:${brand.cardBg};border:1px solid ${brand.borderColor};border-radius:10px;">
                <tr>
                  <td bgcolor="${brand.cardBg}" class="body-bg dark-text" style="padding:14px 16px;font-family:${brand.bodyFont};font-size:14px;color:${brand.textColor};">
                    <strong style="font-weight:600;">${escapeHtml(customer.fullName)}</strong><br/>
                    <a href="mailto:${escapeHtml(customer.email)}" class="wine-text" style="color:${brand.primaryColor};text-decoration:none;">${escapeHtml(customer.email)}</a>
                    ${customer.phone ? ` · <a href="tel:${escapeHtml(customer.phone.replace(/\s/g, ""))}" class="wine-text" style="color:${brand.primaryColor};text-decoration:none;">${escapeHtml(customer.phone)}</a>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SHIPPING -->
          <tr>
            <td style="padding:20px 36px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:10px;overflow:hidden;border:1px solid ${brand.primaryColor};">
                <tr>
                  <td bgcolor="${brand.primaryColor}" class="wine-bg cream-text" style="background-color:${brand.primaryColor};padding:12px 18px;font-family:${brand.bodyFont};font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${brand.bgColor};">
                    ${escapeHtml(shippingLabel)}
                  </td>
                </tr>
                <tr>
                  <td bgcolor="${brand.cardBg}" class="body-bg dark-text" style="background-color:${brand.cardBg};padding:14px 18px;font-family:${brand.bodyFont};font-size:14px;line-height:1.55;color:${brand.textColor};">
                    ${shipping.address
                      ? `<strong class="wine-text" style="font-weight:600;color:${brand.primaryColor};">${escapeHtml(shipping.address)}</strong>`
                      : `<span class="muted-text" style="font-style:italic;color:${brand.secondaryText};">Sin dirección</span>`}
                    ${shipping.notes ? `<br/><span class="muted-text" style="font-size:13px;color:${brand.secondaryText};font-style:italic;">Notas: "${nl2br(shipping.notes)}"</span>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ITEMS -->
          <tr>
            <td style="padding:24px 28px 0;">
              <p class="muted-text" style="margin:0 0 8px;font-family:${brand.bodyFont};font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${brand.secondaryText};padding:0 8px;">
                Productos
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${brand.borderColor};">
                <thead>
                  <tr>
                    <th align="left"   class="muted-text divider" style="padding:9px 12px;font-family:${brand.bodyFont};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${brand.secondaryText};font-weight:700;border-bottom:1px solid ${brand.borderColor};">Producto</th>
                    <th align="center" class="muted-text divider" style="padding:9px 12px;font-family:${brand.bodyFont};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${brand.secondaryText};font-weight:700;border-bottom:1px solid ${brand.borderColor};">Cant. × P.U.</th>
                    <th align="right"  class="muted-text divider" style="padding:9px 12px;font-family:${brand.bodyFont};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${brand.secondaryText};font-weight:700;border-bottom:1px solid ${brand.borderColor};">Subtotal</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>
            </td>
          </tr>

          <!-- TOTALS -->
          <tr>
            <td style="padding:8px 28px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="muted-text" style="padding:8px 12px;font-family:${brand.bodyFont};font-size:13px;color:${brand.secondaryText};">Subtotal productos</td>
                  <td align="right" class="dark-text" style="padding:8px 12px;font-family:${brand.bodyFont};font-size:13px;color:${brand.textColor};">${formatMoney(totals.productsSubtotal, currency)}</td>
                </tr>
                <tr>
                  <td class="muted-text" style="padding:6px 12px 14px;font-family:${brand.bodyFont};font-size:13px;color:${brand.secondaryText};">Envío</td>
                  <td align="right" class="dark-text" style="padding:6px 12px 14px;font-family:${brand.bodyFont};font-size:13px;color:${brand.textColor};">${totals.shippingBase > 0 ? formatMoney(totals.shippingBase, currency) : "—"}</td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${brand.primaryColor}" class="wine-bg" style="background-color:${brand.primaryColor};border-radius:10px;">
                <tr>
                  <td bgcolor="${brand.primaryColor}" class="wine-bg cream-text" style="padding:14px 18px;font-family:${brand.fontFamily};font-size:12px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${brand.bgColor};background-color:${brand.primaryColor};">Total</td>
                  <td align="right" bgcolor="${brand.primaryColor}" class="wine-bg cream-text" style="padding:14px 18px;font-family:${brand.fontFamily};font-size:22px;font-weight:700;color:${brand.bgColor};background-color:${brand.primaryColor};">${formatMoney(totals.total, currency)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PAYMENT -->
          <tr>
            <td style="padding:24px 36px 32px;">
              <p class="muted-text" style="margin:0 0 8px;font-family:${brand.bodyFont};font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${brand.secondaryText};">Pago</p>
              <p class="dark-text" style="margin:0;font-family:${brand.bodyFont};font-size:14px;color:${brand.textColor};">
                Método: <strong style="font-weight:600;text-transform:uppercase;">${escapeHtml(payment.method)}</strong>
              </p>
            </td>
          </tr>

        </table>

        <p class="muted-text" style="margin:14px 0 0;font-family:${brand.bodyFont};font-size:10px;color:${brand.secondaryText};text-align:center;letter-spacing:0.06em;">
          Notificación interna · ${escapeHtml(name)} mailer
        </p>

      </td>
    </tr>
  </table>

</body>
</html>`;
}
