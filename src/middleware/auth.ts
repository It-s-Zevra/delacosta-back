import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

/**
 * Optional shared-key guard for write endpoints. If API_KEY is unset, the guard
 * is a no-op (handy for local dev). When set, requests must send a matching
 * `x-api-key` header.
 */
export function requireApiKey(req: Request, _res: Response, next: NextFunction) {
  if (!env.apiKey) return next();
  const provided = req.header("x-api-key");
  if (provided !== env.apiKey) {
    return next(HttpError.unauthorized("API key inválida o ausente"));
  }
  next();
}
