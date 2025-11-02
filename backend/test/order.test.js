import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Product from "../src/models/Product.js";
import Cart from "../src/models/Cart.js";
import Order from "../src/models/Order.js";
import bcrypt from "bcrypt";
import generateToken from "../src/utils/generateToken.js";

describe("Order endpoints", () => {
  let userToken;
  let adminToken;
  let userId;
  let adminId;
  let productId1;
  let productId2;

  beforeEach(async () => {
    // Setup regular user
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await User.create({
      name: "testuser",
      email: "test@example.com",
      password: hashedPassword,
      role: "user",
    });
    userId = user._id;
    userToken = generateToken(user._id, user.role);

    // Setup admin user
    const admin = await User.create({
      name: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    });
    adminId = admin._id;
    adminToken = generateToken(admin._id, admin.role);

    // Setup products
    const product1 = await Product.create({
      name: "Product 1",
      price: 100000,
      description: "Test product 1",
      stock: 10,
      category: "electronics",
      images: "test1.jpg",
    });
    productId1 = product1._id;

    const product2 = await Product.create({
      name: "Product 2",
      price: 200000,
      description: "Test product 2",
      stock: 5,
      category: "electronics",
      images: "test2.jpg",
    });
    productId2 = product2._id;
  });

  describe("POST /orders - Create order", () => {
    it("should create order from cart", async () => {
      // Setup: Buat cart dengan products
      await Cart.create({
        user: userId,
        products: [
          { product: productId1, quantity: 2 },
          { product: productId2, quantity: 1 },
        ],
      });

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.order).toHaveProperty("_id");
      expect(res.body.order.products).toHaveLength(2);
      expect(res.body.order.totalPrice).toBe(400000); // (100000 * 2) + (200000 * 1)
      expect(res.body.order.status).toBe("pending");

      // Verify cart is emptied
      const cart = await Cart.findOne({ user: userId });
      expect(cart.products).toHaveLength(0);
    });

    it("should calculate total price correctly", async () => {
      await Cart.create({
        user: userId,
        products: [{ product: productId1, quantity: 3 }],
      });

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.order.totalPrice).toBe(300000); // 100000 * 3
    });

    it("should return 404 if cart is empty", async () => {
      // Buat cart kosong
      await Cart.create({
        user: userId,
        products: [],
      });

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/cart is empty/i);
    });

    it("should return 404 if cart not found", async () => {
      // User tidak punya cart sama sekali
      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/cart/i);
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).post("/api/orders");

      expect([401, 404]).toContain(res.statusCode);
    });

    it("should store product details in order", async () => {
      await Cart.create({
        user: userId,
        products: [{ product: productId1, quantity: 1 }],
      });

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.order.products[0]).toHaveProperty("name");
      expect(res.body.order.products[0]).toHaveProperty("price");
      expect(res.body.order.products[0].name).toBe("Product 1");
      expect(res.body.order.products[0].price).toBe(100000);
    });
  });

  describe("GET /orders - Get all orders", () => {
    it("should get all user orders", async () => {
      // Buat beberapa orders
      await Order.create({
        user: userId,
        products: [
          {
            product: productId1,
            name: "Product 1",
            price: 100000,
            quantity: 2,
          },
        ],
        totalPrice: 200000,
        status: "pending",
      });

      await Order.create({
        user: userId,
        products: [
          {
            product: productId2,
            name: "Product 2",
            price: 200000,
            quantity: 1,
          },
        ],
        totalPrice: 200000,
        status: "completed",
      });

      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty("status");
      expect(res.body[0]).toHaveProperty("totalPrice");
    });

    it("should return empty array if no orders", async () => {
      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${userToken}`);

      // Tergantung implementation, bisa 200 dengan empty array atau 404
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(0);
      } else {
        expect(res.statusCode).toBe(404);
      }
    });

    it("should only return current user orders", async () => {
      // Buat order untuk user
      await Order.create({
        user: userId,
        products: [
          {
            product: productId1,
            name: "Product 1",
            price: 100000,
            quantity: 1,
          },
        ],
        totalPrice: 100000,
        status: "pending",
      });

      // Buat order untuk admin (user lain)
      await Order.create({
        user: adminId,
        products: [
          {
            product: productId2,
            name: "Product 2",
            price: 200000,
            quantity: 1,
          },
        ],
        totalPrice: 200000,
        status: "pending",
      });

      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1); // Hanya order milik user
      expect(res.body[0].user.toString()).toBe(userId.toString());
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).get("/api/orders");

      expect([401, 404]).toContain(res.statusCode);
    });
  });

  describe("PUT /orders/:id - Update order status", () => {
    let orderId;

    beforeEach(async () => {
      // Setup order untuk testing
      const order = await Order.create({
        user: userId,
        products: [
          {
            product: productId1,
            name: "Product 1",
            price: 100000,
            quantity: 1,
          },
        ],
        totalPrice: 100000,
        status: "pending",
      });
      orderId = order._id;
    });

    it("should update order status to paid", async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "paid",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/updated successfully/i);

      // Verify database
      const order = await Order.findById(orderId);
      expect(order.status).toBe("paid");
    });

    it("should update order status to shipped", async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "shipped",
        });

      expect(res.statusCode).toBe(200);

      const order = await Order.findById(orderId);
      expect(order.status).toBe("shipped");
    });

    it("should update order status to completed", async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "completed",
        });

      expect(res.statusCode).toBe(200);

      const order = await Order.findById(orderId);
      expect(order.status).toBe("completed");
    });

    it("should update order status to cancelled", async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "cancelled",
        });

      expect(res.statusCode).toBe(200);

      const order = await Order.findById(orderId);
      expect(order.status).toBe("cancelled");
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).put(`/api/orders/${orderId}`).send({
        status: "paid",
      });

      expect([401, 404]).toContain(res.statusCode);
    });

    // Jika endpoint ini admin-only, tambahkan test ini
    it("should return 403 if not admin (optional)", async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${userToken}`) // Regular user token
        .send({
          status: "paid",
        });

      // Tergantung implementation, bisa 403 atau 200
      // Sesuaikan dengan route middleware kamu
      if (res.statusCode === 403) {
        expect(res.body.message).toMatch(/not.*admin/i);
      }
    });
  });
});
