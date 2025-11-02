/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: API untuk mengelola keranjang belanja
 */

import express from "express";
import { addToCart } from "../controllers/cart.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { getCart } from "../controllers/cart.controller.js";
import { updateCart } from "../controllers/cart.controller.js";
import { removeCart } from "../controllers/cart.controller.js";
import { admin0nly } from "../middleware/authMiddleware.js";
const router = express.Router();

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 68d0bb7e5957b871e082608c
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Product added to cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 68da24ceba2ce8b18f56872c
 *                 user:
 *                   type: string
 *                   example: 68d38dca23578b2d832e3eec
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 68d0bb7e5957b871e082608c
 *                           name:
 *                             type: string
 *                             example: Mackbook
 *                           price:
 *                             type: number
 *                             example: 200000
 *                       quantity:
 *                         type: integer
 *                         example: 2
 *                       _id:
 *                         type: string
 *                         example: 68da82936848b112cc09d4a0
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-09-29T06:18:54.590Z
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-09-30T14:31:00.363Z
 *                 __v:
 *                   type: integer
 *                   example: 13
 */

router.post("/", protect, addToCart);

/**
 * @swagger
 * components:
 *   schemas:
 *     CartProduct:
 *       type: object
 *       properties:
 *         product:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "68d0bb7e5957b871e082608c"
 *             name:
 *               type: string
 *               example: "Mackbook"
 *             price:
 *               type: number
 *               example: 200000
 *         quantity:
 *           type: integer
 *           example: 2
 *         _id:
 *           type: string
 *           example: "68da82936848b112cc09d4a0"
 *
 *     Cart:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "68da24ceba2ce8b18f56872c"
 *         user:
 *           type: string
 *           example: "68d38dca23578b2d832e3eec"
 *         products:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/CartProduct"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-09-29T06:18:54.590Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-09-30T14:39:39.226Z"
 *         __v:
 *           type: integer
 *           example: 13
 *
 * /cart:
 *   get:
 *     tags:
 *       - Cart
 *     summary: Ambil keranjang user
 *     description: Mengembalikan data keranjang lengkap untuk user yang sedang login
 *     responses:
 *       200:
 *         description: Cart berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Cart"
 *             example:
 *               _id: "68da24ceba2ce8b18f56872c"
 *               user: "68d38dca23578b2d832e3eec"
 *               products:
 *                 - product:
 *                     _id: "68d0bb7e5957b871e082608c"
 *                     name: "Mackbook"
 *                     price: 200000
 *                   quantity: 2
 *                   _id: "68da82936848b112cc09d4a0"
 *               createdAt: "2025-09-29T06:18:54.590Z"
 *               updatedAt: "2025-09-30T14:39:39.226Z"
 *               __v: 13
 *       401:
 *         description: Tidak terautentikasi
 */
router.get("/", protect, getCart);

/**
 * @swagger
 * /cart:
 *   put:
 *     summary: Update cart (tambah atau update quantity produk)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []   # kalau route ini butuh JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 68d0bb7e5957b871e082608c
 *               quantity:
 *                 type: integer
 *                 example: 6
 *     responses:
 *       200:
 *         description: Cart berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 68da24ceba2ce8b18f56872c
 *                 user:
 *                   type: string
 *                   example: 68d38dca23578b2d832e3eec
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: string
 *                         example: 68d0bb7e5957b871e082608c
 *                       quantity:
 *                         type: integer
 *                         example: 6
 *                       _id:
 *                         type: string
 *                         example: 68da82936848b112cc09d4a0
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-09-29T06:18:54.590Z
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-10-01T04:26:04.279Z
 *                 __v:
 *                   type: integer
 *                   example: 13
 *       404:
 *         description: Cart tidak ditemukan
 *       500:
 *         description: Server error
 */

router.put("/", protect, updateCart);

/**
 * @swagger
 * /api/cart/{productId}:
 *   delete:
 *     summary: Hapus produk dari cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID produk yang akan dihapus dari cart
 *     responses:
 *       200:
 *         description: Produk berhasil dihapus
 *       404:
 *         description: Produk tidak ditemukan di cart
 */
router.delete("/:id", protect, removeCart);

export default router;
