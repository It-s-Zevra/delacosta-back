import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { param } from "../utils/req.js";
import { requireApiKey } from "../middleware/auth.js";
import * as service from "../services/customers.service.js";
import { HttpError } from "../utils/http-error.js";
import { customerCreateSchema, customerUpdateSchema } from "../validation/schemas.js";

export const customersRouter = Router();

// GET /api/customers?estado=VIP
customersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const estado = typeof req.query.estado === "string" ? req.query.estado : undefined;
    const data = await service.listCustomers({ estado });
    res.json({ data, count: data.length });
  }),
);

// GET /api/customers/find?email=cliente@correo.cl
customersRouter.get(
  "/find",
  asyncHandler(async (req, res) => {
    const email = typeof req.query.email === "string" ? req.query.email : "";
    if (!email) throw HttpError.badRequest("Parámetro `email` requerido");
    const data = await service.findCustomerByEmail(email);
    if (!data) throw HttpError.notFound("Cliente no encontrado");
    res.json({ data });
  }),
);

customersRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = await service.getCustomer(param(req, "id"));
    res.json({ data });
  }),
);

customersRouter.post(
  "/",
  requireApiKey,
  asyncHandler(async (req, res) => {
    const input = customerCreateSchema.parse(req.body);
    const data = await service.createCustomer(input);
    res.status(201).json({ data });
  }),
);

customersRouter.patch(
  "/:id",
  requireApiKey,
  asyncHandler(async (req, res) => {
    const input = customerUpdateSchema.parse(req.body);
    const data = await service.updateCustomer(param(req, "id"), input);
    res.json({ data });
  }),
);
