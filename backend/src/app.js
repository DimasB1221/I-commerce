import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import healthRoutes from "./routes/health.routes.js";
import { swaggerUi, swaggerSpec } from "./config/swagger.js";
import setupMorgan from "./middleware/morgan.js";

const app = express();

app.use(express.json());
app.use(cors());

const morganMiddleware = setupMorgan();
morganMiddleware.forEach((middleware) => app.use(middleware));

// auth routes
app.use("/api/auth", authRoutes);

// product routes
app.use("/api/products", productRoutes);

// cart routes
app.use("/api/cart", cartRoutes);

// order routes
app.use("/api/orders", orderRoutes);

// health routes
app.use("/api", healthRoutes);

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
