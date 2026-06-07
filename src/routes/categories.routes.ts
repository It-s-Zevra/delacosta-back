import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { param } from "../utils/req.js";
import { requireApiKey } from "../middleware/auth.js";
import * as service from "../services/categories.service.js";
import { categoryCreateSchema, categoryUpdateSchema } from "../validation/schemas.js";

export const categoriesRouter = Router();

// GET /api/categories?activas=true
categoriesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const soloActivas = req.query.activas === "true";
    const data = await service.listCategories({ soloActivas });
    res.json({ data });
  }),
);

categoriesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = await service.getCategory(param(req, "id"));
    res.json({ data });
  }),
);

categoriesRouter.post(
  "/",
  requireApiKey,
  asyncHandler(async (req, res) => {
    const input = categoryCreateSchema.parse(req.body);
    const data = await service.createCategory(input);
    res.status(201).json({ data });
  }),
);

categoriesRouter.patch(
  "/:id",
  requireApiKey,
  asyncHandler(async (req, res) => {
    const input = categoryUpdateSchema.parse(req.body);
    const data = await service.updateCategory(param(req, "id"), input);
    res.json({ data });
  }),
);
