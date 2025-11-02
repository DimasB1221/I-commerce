import express from "express";
import { createOrder } from "../controllers/order.controller.js";
import { admin0nly } from "../middleware/authMiddleware.js";
import { getAllOrders } from "../controllers/order.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { updateOrderStatus } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, getAllOrders);
router.put("/:id", protect, admin0nly, updateOrderStatus);

export default router;
