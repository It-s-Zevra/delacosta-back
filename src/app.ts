import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env, isProd } from "./config/env.js";
import { categoriesRouter } from "./routes/categories.routes.js";
import { productsRouter } from "./routes/products.routes.js";
import { customersRouter } from "./routes/customers.routes.js";
import { ordersRouter } from "./routes/orders.routes.js";
import { checkoutRouter } from "./routes/checkout.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use(
    cors({
      origin: env.corsOrigin === "*" ? true : env.corsOrigin.split(",").map((s) => s.trim()),
    }),
  );
  app.use(morgan(isProd ? "combined" : "dev"));

  app.get("/", (_req, res) => {
    res.json({
      name: "Delacosta CRM API",
      status: "ok",
      docs: "/health para estado; /api/* para recursos",
    });
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.use("/api/categories", categoriesRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/customers", customersRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/checkout", checkoutRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
