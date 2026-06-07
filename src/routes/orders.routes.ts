import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { param } from "../utils/req.js";
import { requireApiKey } from "../middleware/auth.js";
import * as service from "../services/orders.service.js";
import * as productsService from "../services/products.service.js";
import { HttpError } from "../utils/http-error.js";
import { itemCreateSchema, orderCreateSchema, orderUpdateSchema } from "../validation/schemas.js";

export const ordersRouter = Router();

// GET /api/orders?estado=Pendiente&pago=Pagado&cliente=<id>
ordersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const data = await service.listOrders({
      estadoPedido: typeof req.query.estado === "string" ? req.query.estado : undefined,
      estadoPago: typeof req.query.pago === "string" ? req.query.pago : undefined,
      clienteId: typeof req.query.cliente === "string" ? req.query.cliente : undefined,
    });
    res.json({ data, count: data.length });
  }),
);

// GET /api/orders/:id  -> order with resolved line items
ordersRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = await service.getOrderWithItems(param(req, "id"));
    res.json({ data });
  }),
);

ordersRouter.post(
  "/",
  requireApiKey,
  asyncHandler(async (req, res) => {
    const input = orderCreateSchema.parse(req.body);
    const data = await service.createOrder({ numero: "", ...input });
    res.status(201).json({ data });
  }),
);

ordersRouter.patch(
  "/:id",
  requireApiKey,
  asyncHandler(async (req, res) => {
    const input = orderUpdateSchema.parse(req.body);
    const data = await service.updateOrder(param(req, "id"), input);
    res.json({ data });
  }),
);

// POST /api/orders/:id/items  -> add a line item (price frozen from product unless provided)
ordersRouter.post(
  "/:id/items",
  requireApiKey,
  asyncHandler(async (req, res) => {
    const input = itemCreateSchema.parse(req.body);
    const product = await productsService.getProduct(input.productoId);
    const precioUnitario = input.precioUnitario ?? product.precioOferta ?? product.precio;
    if (precioUnitario == null) {
      throw HttpError.conflict(`«${product.nombre}» no tiene precio definido`);
    }
    const item = await service.addItem({
      item: input.item ?? `${product.nombre} x${input.cantidad}`,
      pedidoId: param(req, "id"),
      productoId: input.productoId,
      cantidad: input.cantidad,
      precioUnitario,
    });
    res.status(201).json({ data: item });
  }),
);
