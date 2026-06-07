import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { param } from "../utils/req.js";
import { requireApiKey } from "../middleware/auth.js";
import * as service from "../services/products.service.js";
import { HttpError } from "../utils/http-error.js";
import {
  productCreateSchema,
  productUpdateSchema,
  stockAdjustSchema,
  stockSetSchema,
} from "../validation/schemas.js";

export const productsRouter = Router();

// GET /api/products?estado=Activo&categoria=<id>&destacado=true&search=anillo&activos=true
productsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const data = await service.listProducts({
      estado: typeof req.query.estado === "string" ? req.query.estado : undefined,
      categoriaId: typeof req.query.categoria === "string" ? req.query.categoria : undefined,
      destacado:
        req.query.destacado === undefined ? undefined : req.query.destacado === "true",
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      soloActivos: req.query.activos === "true",
    });
    res.json({ data, count: data.length });
  }),
);

// Public storefront catalog: only active products.
productsRouter.get(
  "/catalogo",
  asyncHandler(async (_req, res) => {
    const data = await service.listProducts({ soloActivos: true });
    res.json({ data, count: data.length });
  }),
);

productsRouter.get(
  "/slug/:slug",
  asyncHandler(async (req, res) => {
    const data = await service.getProductBySlug(param(req, "slug"));
    if (!data) throw HttpError.notFound("Producto no encontrado");
    res.json({ data });
  }),
);

productsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = await service.getProduct(param(req, "id"));
    res.json({ data });
  }),
);

productsRouter.post(
  "/",
  requireApiKey,
  asyncHandler(async (req, res) => {
    const input = productCreateSchema.parse(req.body);
    const data = await service.createProduct(input);
    res.status(201).json({ data });
  }),
);

productsRouter.patch(
  "/:id",
  requireApiKey,
  asyncHandler(async (req, res) => {
    const input = productUpdateSchema.parse(req.body);
    const data = await service.updateProduct(param(req, "id"), input);
    res.json({ data });
  }),
);

// Set absolute stock.
productsRouter.patch(
  "/:id/stock",
  requireApiKey,
  asyncHandler(async (req, res) => {
    const { stock } = stockSetSchema.parse(req.body);
    const data = await service.setStock(param(req, "id"), stock);
    res.json({ data });
  }),
);

// Adjust stock by a delta (e.g. {"delta": -2}).
productsRouter.post(
  "/:id/stock/adjust",
  requireApiKey,
  asyncHandler(async (req, res) => {
    const { delta } = stockAdjustSchema.parse(req.body);
    const data = await service.adjustStock(param(req, "id"), delta);
    res.json({ data });
  }),
);
