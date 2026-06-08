/**
 * Formatea montos en CLP ("$34.990") u otras monedas.
 * CLP siempre es entero; punto como separador de miles (convención chilena).
 */
export function formatMoney(n: number | null | undefined, currency = "CLP"): string {
  const value = Number(n) || 0;
  if (currency === "CLP") {
    return "$" + Math.round(value).toLocaleString("es-CL");
  }
  return `${currency} ${value.toFixed(2)}`;
}

export function escapeHtml(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c)
  );
}

export function nl2br(s: string): string {
  return escapeHtml(s).replace(/\n/g, "<br/>");
}

export function isColorDark(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length !== 6) return false;
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 0.5;
}
