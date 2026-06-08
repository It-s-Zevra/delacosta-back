export interface TenantBrand {
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  cardBg: string;
  textColor: string;
  secondaryText: string;
  borderColor: string;
  logoUrl: string;
  logoWidth: number;
  fontFamily: string;
  bodyFont: string;
  websiteUrl: string;
  instagramUrl?: string;
}

export interface TenantCopy {
  customerSubject: (args: { orderId: string }) => string;
  adminSubject: (args: { orderId: string; total: number; currency: string; customerName: string }) => string;
  thanksLine: string;
  pendingNote: string;
  paidNote: string;
  deliveryEtaLine: string;
}

export interface TenantConfig {
  name: string;
  recipientEmail: string | undefined;
  brand: TenantBrand;
  copy: TenantCopy;
}

const TENANTS: Record<string, TenantConfig> = {
  delacosta: {
    name: "Delacosta Studio",
    recipientEmail: process.env.TENANT_DELACOSTA_EMAIL,
    brand: {
      primaryColor:  "#010169",
      accentColor:   "#960018",
      bgColor:       "#f4e3b2",
      cardBg:        "#fbf8f2",
      textColor:     "#1a1a1a",
      secondaryText: "#5d372a",
      borderColor:   "#dbd3c9",
      logoUrl:       "https://res.cloudinary.com/dg1x0cwdc/image/upload/v1777812567/icoJ2_vkzi1k.png",
      logoWidth:     120,
      fontFamily:    "'Georgia', 'Times New Roman', serif",
      bodyFont:      "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      websiteUrl:    "https://delacostastudio.com",
      instagramUrl:  "https://www.instagram.com/delacosta.studio",
    },
    copy: {
      customerSubject: ({ orderId }) =>
        `Tu pedido ${orderId} está confirmado — Delacosta Studio`,
      adminSubject: ({ orderId, total, currency, customerName }) =>
        `Nuevo pedido ${orderId} · ${formatCLPSubject(total, currency)} · ${customerName}`,
      thanksLine:      "Gracias por elegir Delacosta Studio. Tu joya está hecha a mano con amor.",
      pendingNote:     "Revisaremos tu transferencia en las próximas horas y te confirmaremos por este mismo correo.",
      paidNote:        "Pago confirmado. Estamos preparando tu pedido.",
      deliveryEtaLine: "Envíos con BlueExpress en 2–5 días hábiles a todo Chile.",
    },
  },
};

function formatCLPSubject(total: number, currency: string): string {
  if (currency === "CLP") {
    return "$" + Math.round(total).toLocaleString("es-CL");
  }
  return `${currency} ${total}`;
}

export function getTenant(tenantId: string): TenantConfig | null {
  return TENANTS[tenantId] ?? null;
}

export function isTenantRegistered(tenantId: string): boolean {
  return tenantId in TENANTS;
}

export function getTenantIds(): string[] {
  return Object.keys(TENANTS);
}
