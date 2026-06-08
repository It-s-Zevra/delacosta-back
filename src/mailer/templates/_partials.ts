import type { TenantBrand } from "../config/tenants.js";

/**
 * <head> compartido con soporte de dark mode intencional para la paleta navy/cream de Delacosta.
 *
 * Clases semánticas usadas en las plantillas:
 *   .wine-bg     → fondo navy (header, footer, total, bloque envío)
 *   .wine-text   → texto navy → en dark pasa a cream
 *   .cream-bg    → fondo exterior cream → en dark fondo oscuro navy-tinted
 *   .cream-text  → texto cream sobre navy → invariante
 *   .card-bg     → card principal → en dark: card oscura
 *   .body-bg     → bloques internos blancos → en dark: más oscuro
 *   .dark-text   → texto principal ink → en dark: cream
 *   .muted-text  → texto secundario tobacco → adapta
 *   .divider     → líneas finas stone → adapta
 */
export function buildEmailHead({ title, brand }: { title: string; brand: TenantBrand }): string {
  const navy   = brand.primaryColor;  // #010169
  const cream  = brand.bgColor;       // #f4e3b2
  const dark   = brand.textColor;     // #1a1a1a
  const muted  = brand.secondaryText; // #5d372a
  const card   = brand.cardBg;        // #fbf8f2
  const border = brand.borderColor;   // #dbd3c9

  void dark; void muted; void card; void border; // used in templates directly

  // Dark palette — navy-tinted deep darks
  const dNavy   = navy;       // navy stays — already very dark
  const dCream  = cream;      // cream text on navy stays vivid
  const dBgOut  = "#0d0c15";  // exterior very dark navy-tinted
  const dCard   = "#14122a";  // dark card
  const dInner  = "#100f24";  // inner blocks
  const dMuted  = "#b0aac8";  // muted text in dark
  const dBorder = "#1e1c3a";  // subtle border

  const overrides = `
      .wine-bg     { background-color: ${dNavy}  !important; }
      .wine-text   { color: ${dCream} !important; }
      .cream-bg    { background-color: ${dBgOut} !important; }
      .cream-text  { color: ${dCream} !important; }
      .card-bg     { background-color: ${dCard}  !important; }
      .body-bg     { background-color: ${dInner} !important; }
      .dark-text   { color: ${dCream} !important; }
      .muted-text  { color: ${dMuted} !important; }
      .divider     { background-color: ${dBorder} !important; border-color: ${dBorder} !important; }
      .force-white { color: #ffffff !important; }
  `.trim();

  return `<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${title}</title>
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    table { border-collapse: collapse; }
    img   { -ms-interpolation-mode: bicubic; }

    /* === Dark mode (Apple Mail, Gmail web, Outlook web) === */
    @media (prefers-color-scheme: dark) {
${overrides.split("\n").map((l) => "      " + l).join("\n")}
    }

    /* === Gmail iOS (data-ogsc) === */
${overrides
  .split("\n")
  .map((l) => "    [data-ogsc] " + l.trim())
  .filter((l) => l.trim() !== "[data-ogsc]")
  .join("\n")}

    /* === Outlook 365 dark (data-ogsb) === */
${overrides
  .split("\n")
  .map((l) => "    [data-ogsb] " + l.trim())
  .filter((l) => l.trim() !== "[data-ogsb]")
  .join("\n")}
  </style>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <style>table { border-collapse: collapse; } td { font-family: Georgia, serif; }</style>
  <![endif]-->
</head>`;
}
