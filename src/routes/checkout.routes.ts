import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { requireApiKey } from "../middleware/auth.js";
import { checkout } from "../services/checkout.service.js";
import { checkoutSchema } from "../validation/schemas.js";

export const checkoutRouter = Router();

// POST /api/checkout  -> one-shot purchase: customer + order + items + stock
checkoutRouter.post(
  "/",
  requireApiKey,
  asyncHandler(async (req, res) => {
    const input = checkoutSchema.parse(req.body);
    const data = await checkout(input);
    res.status(201).json({ data });
  }),
);
