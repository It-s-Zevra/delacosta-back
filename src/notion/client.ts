import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

const BASE_URL = "https://api.notion.com/v1";
const MAX_RETRIES = 4;

export interface NotionPage {
  id: string;
  object: "page";
  created_time: string;
  last_edited_time: string;
  archived: boolean;
  properties: Record<string, any>;
  url?: string;
}

export interface QueryResponse {
  object: "list";
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Thin wrapper over the Notion REST API.
 * - Adds auth + version headers.
 * - Retries on 429 (rate limit, ~3 req/s) and 5xx with exponential backoff,
 *   honouring the `Retry-After` header when present.
 * - Normalises Notion errors into HttpError.
 */
async function notionRequest<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${env.notionToken}`,
        "Notion-Version": env.notionVersion,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (res.ok) {
      return (await res.json()) as T;
    }

    const isRetryable = res.status === 429 || res.status >= 500;
    if (isRetryable && attempt < MAX_RETRIES) {
      const retryAfter = Number(res.headers.get("retry-after"));
      const backoff = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : Math.min(2 ** attempt * 400, 8000);
      await sleep(backoff);
      continue;
    }

    let payload: any = undefined;
    try {
      payload = await res.json();
    } catch {
      /* body was not JSON */
    }

    const message =
      payload?.message || `Notion API error (${res.status})`;
    // Surface a friendly hint for the most common setup mistake.
    if (res.status === 404 && /share|integration/i.test(message)) {
      throw new HttpError(
        502,
        "Notion devolvió 404: la base no está compartida con la integración. " +
          "Conecta la integración a la página «Delacosta · CRM» en Notion.",
        payload,
      );
    }
    throw new HttpError(
      res.status === 400 ? 400 : 502,
      message,
      payload,
    );
  }

  // Unreachable, but keeps TypeScript happy.
  throw new HttpError(502, "Notion API: retries exhausted");
}

export const notion = {
  /** Query a data source (collection) with optional filter/sorts/pagination. */
  queryDataSource(
    dataSourceId: string,
    body: Record<string, unknown> = {},
  ): Promise<QueryResponse> {
    return notionRequest<QueryResponse>(
      "POST",
      `/data_sources/${dataSourceId}/query`,
      body,
    );
  },

  /** Read a single page (row) by id. */
  getPage(pageId: string): Promise<NotionPage> {
    return notionRequest<NotionPage>("GET", `/pages/${pageId}`);
  },

  /** Create a page (row) inside a data source. */
  createPage(
    dataSourceId: string,
    properties: Record<string, unknown>,
  ): Promise<NotionPage> {
    return notionRequest<NotionPage>("POST", `/pages`, {
      parent: { type: "data_source_id", data_source_id: dataSourceId },
      properties,
    });
  },

  /** Update a page's properties. */
  updatePage(
    pageId: string,
    properties: Record<string, unknown>,
  ): Promise<NotionPage> {
    return notionRequest<NotionPage>("PATCH", `/pages/${pageId}`, {
      properties,
    });
  },

  /** Fetch a data source schema (useful for debugging select options). */
  getDataSource(dataSourceId: string): Promise<unknown> {
    return notionRequest("GET", `/data_sources/${dataSourceId}`);
  },

  /**
   * Query every page of a data source, transparently following pagination.
   * Use for small/medium bases (catalog scale of a handmade brand).
   */
  async queryAll(
    dataSourceId: string,
    body: Record<string, unknown> = {},
  ): Promise<NotionPage[]> {
    const all: NotionPage[] = [];
    let cursor: string | null = null;
    do {
      const page: QueryResponse = await notion.queryDataSource(dataSourceId, {
        ...body,
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      });
      all.push(...page.results);
      cursor = page.has_more ? page.next_cursor : null;
    } while (cursor);
    return all;
  },
};
