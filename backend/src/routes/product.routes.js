import { getAllProducts } from "../controllers/product.controller.js";
import { getProductById } from "../controllers/product.controller.js";
import { createProduct } from "../controllers/product.controller.js";
import { updateProduct } from "../controllers/product.controller.js";
import { deleteProduct } from "../controllers/product.controller.js";
import express from "express";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin0nly } from "../middleware/authMiddleware.js";

const router = express.Router();

// get all products
router.get("/", protect, getAllProducts);

// get product by id
router.get("/:id", protect, getProductById);

// create product - admin only
router.post("/", protect, admin0nly, upload.single("images"), createProduct);

// update product - admin only
router.put("/:id", admin0nly, updateProduct);

// delete product - admin only
router.delete("/:id", admin0nly, deleteProduct);

export default router;
