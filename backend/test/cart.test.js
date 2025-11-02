import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Product from "../src/models/Product.js";
import Cart from "../src/models/Cart.js";
import bcrypt from "bcrypt";
import generateToken from "../src/utils/generateToken.js";

describe("Cart endpoints", () => {
  let userToken;
  let userId;
  let productId1;
  let productId2;

  // Setup: Buat user dan product untuk testing
  beforeEach(async () => {
    // Buat user untuk testing
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await User.create({
      name: "testuser",
      email: "test@example.com",
      password: hashedPassword,
      role: "user",
    });
    userId = user._id;
    userToken = generateToken(user._id, user.role);

    // Buat product untuk testing
    const product1 = await Product.create({
      name: "Product 1",
      price: 100000,
      description: "Test product 1",
      stock: 10,
      category: "electronics",
      images: "test1.jpg", // String (bukan array)
    });
    productId1 = product1._id;

    const product2 = await Product.create({
      name: "Product 2",
      price: 200000,
      description: "Test product 2",
      stock: 5,
      category: "electronics",
      images: "test2.jpg", // String (bukan array)
    });
    productId2 = product2._id;
  });

  describe("POST /cart - Add to cart", () => {
    it("should create new cart and add product for first time", async () => {
      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          productId: productId1,
          quantity: 2,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("user");
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].quantity).toBe(2);
      expect(res.body.products[0].product.toString()).toBe(
        productId1.toString()
      );
    });

    it("should add new product to existing cart", async () => {
      // Buat cart terlebih dahulu
      await Cart.create({
        user: userId,
        products: [{ product: productId1, quantity: 1 }],
      });

      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          productId: productId2,
          quantity: 3,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.products).toHaveLength(2);
      expect(res.body.products[1].product._id.toString()).toBe(
        productId2.toString()
      );
      expect(res.body.products[1].quantity).toBe(3);
    });

    it("should increase quantity if product already exists in cart", async () => {
      // Buat cart dengan product yang sudah ada
      await Cart.create({
        user: userId,
        products: [{ product: productId1, quantity: 2 }],
      });

      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          productId: productId1,
          quantity: 3,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].quantity).toBe(5); // 2 + 3
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).post("/api/cart").send({
        productId: productId1,
        quantity: 1,
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /cart - Get cart", () => {
    it("should get user cart with products", async () => {
      // Buat cart terlebih dahulu
      await Cart.create({
        user: userId,
        products: [
          { product: productId1, quantity: 2 },
          { product: productId2, quantity: 1 },
        ],
      });

      const res = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body.products).toHaveLength(2);
      expect(res.body.products[0].product).toHaveProperty("name");
      expect(res.body.products[0].product).toHaveProperty("price");
    });

    it("should return 404 if cart not found", async () => {
      const res = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${userToken}`);
      console.log(res.body);
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message");
    });

    it("should return 401 or 404 if not authenticated", async () => {
      const res = await request(app).get("/api/cart");

      // API bisa return 401 (Unauthorized) atau 404 (Not Found)
      expect([401, 404]).toContain(res.statusCode);
    });
  });

  describe("PUT /cart - Update cart", () => {
    it("should update quantity of existing product", async () => {
      // Buat cart terlebih dahulu
      await Cart.create({
        user: userId,
        products: [{ product: productId1, quantity: 2 }],
      });

      const res = await request(app)
        .put("/api/cart")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          productId: productId1,
          quantity: 3,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.products[0].quantity).toBe(5); // 2 + 3
    });

    it("should add new product if not exists in cart", async () => {
      // Buat cart dengan satu product
      await Cart.create({
        user: userId,
        products: [{ product: productId1, quantity: 1 }],
      });

      const res = await request(app)
        .put("/api/cart")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          productId: productId2,
          quantity: 2,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.products).toHaveLength(2);
    });

    it("should return 404 if cart not found", async () => {
      const res = await request(app)
        .put("/api/cart")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          productId: productId1,
          quantity: 1,
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Cart not found");
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).put("/api/cart").send({
        productId: productId1,
        quantity: 1,
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("DELETE /cart/:id - Remove from cart", () => {
    it("should decrease quantity of product", async () => {
      // Buat cart dengan quantity 5
      await Cart.create({
        user: userId,
        products: [{ product: productId1, quantity: 5 }],
      });

      const res = await request(app)
        .delete(`/api/cart/${productId1}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          quantity: 2,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(res.body.cart.products[0].quantity).toBe(3); // 5 - 2
    });

    it("should delete cart if all products removed", async () => {
      // Buat cart dengan satu product
      await Cart.create({
        user: userId,
        products: [{ product: productId1, quantity: 2 }],
      });

      const res = await request(app)
        .delete(`/api/cart/${productId1}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          quantity: 2,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Cart deleted successfully");

      // Verify cart is deleted
      const cart = await Cart.findOne({ user: userId });
      expect(cart).toBeNull();
    });

    it("should return 404 if cart not found", async () => {
      const res = await request(app)
        .delete(`/api/cart/${productId1}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          quantity: 1,
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Cart not found");
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).delete(`/api/cart/${productId1}`).send({
        quantity: 1,
      });

      expect(res.statusCode).toBe(401);
    });
  });
});
