import { formatMoney, escapeHtml, nl2br, isColorDark } from "../utils/format.js";
import { buildEmailHead } from "./_partials.js";
import type { TenantConfig } from "../config/tenants.js";
import type { MailerPayload } from "../utils/buildPayload.js";

export function buildCustomerOrderEmail(tenant: TenantConfig, order: MailerPayload): string {
  const { brand, name, copy } = tenant;
  const { orderId, items, customer, shipping, totals, payment } = order;
  const currency = totals.currency;

  const headerTextColor = isColorDark(brand.primaryColor) ? brand.bgColor : brand.textColor;
  const headerSubColor  = isColorDark(brand.primaryColor) ? "rgba(244,227,178,0.75)" : `${brand.textColor}88`;

  const statusNote  = payment.status === "paid" ? copy.paidNote : copy.pendingNote;
  const statusLabel = payment.status === "paid" ? "Pago confirmado" : "Pago en validación";
  const statusBg    = payment.status === "paid" ? "#2e6b3a" : brand.primaryColor;
  const statusFg    = brand.bgColor;

  const itemRows = items.map((it) => `
                <tr>
                  <td class="dark-text divider" style="padding:14px 12px;border-bottom:1px solid ${brand.borderColor};font-family:${brand.bodyFont};font-size:14px;color:${brand.textColor};vertical-align:top;">
                    <strong style="font-weight:600;">${escapeHtml(it.name)}</strong>
                  </td>
                  <td class="dark-text divider" style="padding:14px 12px;border-bottom:1px solid ${brand.borderColor};font-family:${brand.bodyFont};font-size:14px;color:${brand.textColor};text-align:center;vertical-align:top;width:60px;">
                    ${escapeHtml(String(it.quantity))}
                  </td>
                  <td class="dark-text divider" style="padding:14px 12px;border-bottom:1px solid ${brand.borderColor};font-family:${brand.bodyFont};font-size:14px;color:${brand.textColor};text-align:right;vertical-align:top;width:110px;">
                    ${formatMoney(it.subtotal, currency)}
                  </td>
                </tr>`).join("");

  const shippingLabel = shipping.method === "pickup"
    ? "Retiro en taller"
    : "Envío a domicilio";

  const websiteCta = brand.websiteUrl
    ? `<a href="${escapeHtml(brand.websiteUrl)}" style="color:${headerSubColor};text-decoration:none;">${escapeHtml(brand.websiteUrl.replace(/^https?:\/\//, ""))}</a>`
    : "";

  const instagramLink = brand.instagramUrl
    ? `<a href="${escapeHtml(brand.instagramUrl)}" style="color:${headerSubColor};text-decoration:none;margin:0 6px;">Instagram</a>`
    : "";

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es" xml:lang="es">
${buildEmailHead({ title: `Pedido ${escapeHtml(orderId)} — ${escapeHtml(name)}`, brand })}
<body bgcolor="${brand.bgColor}" class="cream-bg" style="margin:0;padding:0;background-color:${brand.bgColor};font-family:${brand.bodyFont};-webkit-font-smoothing:antialiased;color:${brand.textColor};">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${brand.bgColor}" class="cream-bg" style="background-color:${brand.bgColor};">
    <tr>
      <td align="center" bgcolor="${brand.bgColor}" class="cream-bg" style="padding:40px 16px 48px;background-color:${brand.bgColor};">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${brand.cardBg}" class="card-bg" style="max-width:600px;width:100%;background-color:${brand.cardBg};border:1px solid ${brand.borderColor};border-radius:16px;overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td bgcolor="${brand.primaryColor}" class="wine-bg" style="background-color:${brand.primaryColor};padding:32px 40px;text-align:center;">
              <img src="${brand.logoUrl}" alt="${escapeHtml(name)}" width="${brand.logoWidth}" style="display:block;margin:0 auto 16px;border:0;outline:none;max-width:${brand.logoWidth}px;height:auto;" />
              <p class="cream-text" style="margin:0;font-family:${brand.fontFamily};font-size:12px;font-weight:600;letter-spacing:0.28em;color:${headerTextColor};text-transform:uppercase;">
                Joyas hechas a mano
              </p>
            </td>
          </tr>

          <!-- GREETING -->
          <tr>
            <td style="padding:36px 40px 8px;">
              <p class="wine-text" style="margin:0 0 6px;font-family:${brand.bodyFont};font-size:11px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:${brand.primaryColor};">
                Pedido ${escapeHtml(orderId)}
              </p>
              <h1 class="wine-text" style="margin:0;font-family:${brand.fontFamily};font-size:28px;font-weight:700;color:${brand.primaryColor};letter-spacing:-0.01em;line-height:1.2;">
                Hola, ${escapeHtml(customer.fullName.split(" ")[0])}.
              </h1>
              <p class="dark-text" style="margin:14px 0 0;font-family:${brand.bodyFont};font-size:16px;line-height:1.55;color:${brand.textColor};">
                Recibimos tu pedido. ${escapeHtml(copy.thanksLine)}
              </p>
            </td>
          </tr>

          <!-- STATUS PILL -->
          <tr>
            <td style="padding:20px 40px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td bgcolor="${statusBg}" class="${payment.status === "paid" ? "" : "wine-bg"}" style="background-color:${statusBg};border-radius:999px;padding:8px 16px;font-family:${brand.bodyFont};font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${statusFg};">
                    <span class="cream-text" style="color:${statusFg};">${escapeHtml(statusLabel)}</span>
                  </td>
                </tr>
              </table>
              <p class="muted-text" style="margin:14px 0 0;font-family:${brand.bodyFont};font-size:14px;line-height:1.6;color:${brand.secondaryText};">
                ${escapeHtml(statusNote)}
              </p>
            </td>
          </tr>

          <!-- ITEMS -->
          <tr>
            <td style="padding:28px 32px 0;">
              <p class="wine-text" style="margin:0 0 10px;font-family:${brand.bodyFont};font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${brand.primaryColor};">
                Tu pedido
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:2px solid ${brand.primaryColor};">
                <thead>
                  <tr>
                    <th align="left"   class="wine-text" style="padding:10px 12px;font-family:${brand.bodyFont};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${brand.primaryColor};font-weight:700;border-bottom:1px solid ${brand.borderColor};">Producto</th>
                    <th align="center" class="wine-text" style="padding:10px 12px;font-family:${brand.bodyFont};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${brand.primaryColor};font-weight:700;border-bottom:1px solid ${brand.borderColor};width:60px;">Cant.</th>
                    <th align="right"  class="wine-text" style="padding:10px 12px;font-family:${brand.bodyFont};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${brand.primaryColor};font-weight:700;border-bottom:1px solid ${brand.borderColor};width:110px;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>
            </td>
          </tr>

          <!-- TOTALS -->
          <tr>
            <td style="padding:8px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="muted-text" style="padding:10px 12px;font-family:${brand.bodyFont};font-size:13px;color:${brand.secondaryText};">Subtotal productos</td>
                  <td align="right" class="dark-text" style="padding:10px 12px;font-family:${brand.bodyFont};font-size:13px;color:${brand.textColor};">${formatMoney(totals.productsSubtotal, currency)}</td>
                </tr>
                <tr>
                  <td class="muted-text" style="padding:6px 12px 14px;font-family:${brand.bodyFont};font-size:13px;color:${brand.secondaryText};">Envío</td>
                  <td align="right" class="dark-text" style="padding:6px 12px 14px;font-family:${brand.bodyFont};font-size:13px;color:${brand.textColor};">${totals.shippingBase > 0 ? formatMoney(totals.shippingBase, currency) : "Por coordinar"}</td>
                </tr>
              </table>

              <!-- Total block navy -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${brand.primaryColor}" class="wine-bg" style="background-color:${brand.primaryColor};border-radius:12px;">
                <tr>
                  <td bgcolor="${brand.primaryColor}" class="wine-bg cream-text" style="padding:18px 22px;font-family:${brand.fontFamily};font-size:13px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${brand.bgColor};background-color:${brand.primaryColor};">
                    Total
                  </td>
                  <td align="right" bgcolor="${brand.primaryColor}" class="wine-bg cream-text" style="padding:18px 22px;font-family:${brand.fontFamily};font-size:26px;font-weight:700;color:${brand.bgColor};letter-spacing:-0.01em;background-color:${brand.primaryColor};">
                    ${formatMoney(totals.total, currency)}
                  </td>
                </tr>
              </table>

              <p class="muted-text" style="margin:10px 12px 0;font-family:${brand.bodyFont};font-size:11px;line-height:1.5;color:${brand.secondaryText};">
                El costo de envío se confirma según tu ubicación antes del despacho.
              </p>
            </td>
          </tr>

          <!-- SHIPPING BLOCK -->
          <tr>
            <td style="padding:28px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;overflow:hidden;border:1px solid ${brand.primaryColor};">
                <tr>
                  <td bgcolor="${brand.primaryColor}" class="wine-bg cream-text" style="background-color:${brand.primaryColor};padding:14px 20px;font-family:${brand.bodyFont};font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${brand.bgColor};">
                    ${escapeHtml(shippingLabel)}
                  </td>
                </tr>
                <tr>
                  <td bgcolor="${brand.cardBg}" class="body-bg" style="background-color:${brand.cardBg};padding:18px 20px;">
                    ${shipping.address
                      ? `<p class="wine-text" style="margin:0 0 8px;font-family:${brand.bodyFont};font-size:15px;line-height:1.55;color:${brand.primaryColor};font-weight:600;">${escapeHtml(shipping.address)}</p>`
                      : `<p class="muted-text" style="margin:0 0 8px;font-family:${brand.bodyFont};font-size:13px;color:${brand.secondaryText};font-style:italic;">Coordinaremos la dirección por correo.</p>`}
                    ${customer.phone ? `<p class="muted-text" style="margin:0 0 4px;font-family:${brand.bodyFont};font-size:13px;color:${brand.secondaryText};"><strong class="dark-text" style="color:${brand.textColor};font-weight:600;">Contacto:</strong> ${escapeHtml(customer.phone)}</p>` : ""}
                    ${shipping.notes ? `<p class="muted-text" style="margin:10px 0 0;font-family:${brand.bodyFont};font-size:13px;line-height:1.55;color:${brand.secondaryText};font-style:italic;">"${nl2br(shipping.notes)}"</p>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ETA / CLOSING -->
          <tr>
            <td style="padding:24px 32px 32px;">
              <p class="muted-text" style="margin:0;font-family:${brand.bodyFont};font-size:13px;line-height:1.6;color:${brand.secondaryText};text-align:center;">
                ${escapeHtml(copy.deliveryEtaLine)}<br/>
                Si tienes dudas, responde este correo y te ayudamos.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td bgcolor="${brand.primaryColor}" class="wine-bg" style="background-color:${brand.primaryColor};padding:22px 40px;text-align:center;">
              <p class="cream-text" style="margin:0 0 6px;font-family:${brand.fontFamily};font-size:13px;font-weight:600;letter-spacing:0.18em;color:${headerTextColor};text-transform:uppercase;">
                ${escapeHtml(name)}
              </p>
              <p class="cream-text" style="margin:0;font-family:${brand.bodyFont};font-size:11px;color:${headerSubColor};letter-spacing:0.04em;">
                ${websiteCta}${websiteCta && instagramLink ? " · " : ""}${instagramLink}
              </p>
            </td>
          </tr>

        </table>

        <p class="muted-text" style="margin:18px 0 0;font-family:${brand.bodyFont};font-size:10px;color:${brand.secondaryText};text-align:center;letter-spacing:0.06em;">
          Recibiste este correo porque realizaste un pedido en delacostastudio.com
        </p>

      </td>
    </tr>
  </table>

</body>
</html>`;
}
