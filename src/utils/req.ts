import type { Request } from "express";
import { HttpError } from "./http-error.js";

/** Read a required route param, throwing a clean 400 if it's missing. */
export function param(req: Request, name: string): string {
  const value = req.params[name];
  if (!value) throw HttpError.badRequest(`Parámetro de ruta «${name}» requerido`);
  return value;
}
