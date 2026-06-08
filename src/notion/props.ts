/**
 * Helpers to READ values out of Notion property objects and to BUILD the
 * property payloads Notion expects when creating/updating pages.
 *
 * Never write computed properties (unique_id, formula, rollup, created_time);
 * Notion rejects or ignores them.
 */

type Props = Record<string, any>;

/* ----------------------------- readers ----------------------------- */

export function readTitle(props: Props, name: string): string {
  const arr = props?.[name]?.title ?? [];
  return arr.map((t: any) => t?.plain_text ?? "").join("").trim();
}

export function readRichText(props: Props, name: string): string {
  const arr = props?.[name]?.rich_text ?? [];
  return arr.map((t: any) => t?.plain_text ?? "").join("").trim();
}

export function readNumber(props: Props, name: string): number | null {
  const v = props?.[name]?.number;
  return typeof v === "number" ? v : null;
}

export function readCheckbox(props: Props, name: string): boolean {
  return Boolean(props?.[name]?.checkbox);
}

export function readSelect(props: Props, name: string): string | null {
  return props?.[name]?.select?.name ?? null;
}

export function readMultiSelect(props: Props, name: string): string[] {
  const arr = props?.[name]?.multi_select ?? [];
  return arr.map((o: any) => o?.name).filter(Boolean);
}

export function readUrl(props: Props, name: string): string | null {
  return props?.[name]?.url ?? null;
}

export function readEmail(props: Props, name: string): string | null {
  return props?.[name]?.email ?? null;
}

export function readPhone(props: Props, name: string): string | null {
  return props?.[name]?.phone_number ?? null;
}

export function readDate(props: Props, name: string): string | null {
  return props?.[name]?.date?.start ?? null;
}

export function readCreatedTime(props: Props, name: string): string | null {
  return props?.[name]?.created_time ?? null;
}

export function readRelationIds(props: Props, name: string): string[] {
  const arr = props?.[name]?.relation ?? [];
  return arr.map((r: any) => r?.id).filter(Boolean);
}

/**
 * First URL from a `files` property. Handles both external files (a URL pasted
 * into Notion) and uploaded files (Notion-hosted; note: those URLs are signed
 * and expire after ~1h, so prefer a stable URL in `URL imagen`).
 */
export function readFirstFileUrl(props: Props, name: string): string | null {
  const files = props?.[name]?.files ?? [];
  for (const f of files) {
    const url = f?.external?.url ?? f?.file?.url;
    if (url) return url;
  }
  return null;
}

/** unique_id -> "DLC-12" */
export function readUniqueId(props: Props, name: string): string | null {
  const u = props?.[name]?.unique_id;
  if (!u || typeof u.number !== "number") return null;
  return u.prefix ? `${u.prefix}-${u.number}` : String(u.number);
}

/** formula of type number -> number | null (also handles string/boolean) */
export function readFormula(props: Props, name: string): number | string | boolean | null {
  const f = props?.[name]?.formula;
  if (!f) return null;
  switch (f.type) {
    case "number":
      return typeof f.number === "number" ? f.number : null;
    case "string":
      return f.string ?? null;
    case "boolean":
      return typeof f.boolean === "boolean" ? f.boolean : null;
    case "date":
      return f.date?.start ?? null;
    default:
      return null;
  }
}

/** rollup -> number for sum/count style rollups */
export function readRollupNumber(props: Props, name: string): number | null {
  const r = props?.[name]?.rollup;
  if (!r) return null;
  if (r.type === "number") return typeof r.number === "number" ? r.number : 0;
  return null;
}

/* ----------------------------- writers ----------------------------- */

export function title(text: string) {
  return { title: [{ text: { content: text } }] };
}

export function richText(text: string | null | undefined) {
  return { rich_text: text ? [{ text: { content: text } }] : [] };
}

export function number(value: number | null | undefined) {
  return { number: value ?? null };
}

export function checkbox(value: boolean) {
  return { checkbox: Boolean(value) };
}

export function select(name: string | null | undefined) {
  return { select: name ? { name } : null };
}

export function multiSelect(names: string[] | null | undefined) {
  return { multi_select: (names ?? []).map((name) => ({ name })) };
}

export function url(value: string | null | undefined) {
  return { url: value || null };
}

export function email(value: string | null | undefined) {
  return { email: value || null };
}

export function phone(value: string | null | undefined) {
  return { phone_number: value || null };
}

export function date(value: string | null | undefined) {
  return { date: value ? { start: value } : null };
}

export function relation(ids: string[] | string | null | undefined) {
  const list = ids == null ? [] : Array.isArray(ids) ? ids : [ids];
  return { relation: list.map((id) => ({ id })) };
}

/**
 * Build a properties object from a map, skipping `undefined` values so callers
 * can pass partial updates without clearing fields they didn't mean to touch.
 */
export function buildProps(
  map: Record<string, unknown | undefined>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(map)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}
