import request from "supertest";
import app from "../src/app.js";
import Product from "../src/models/Product.js";
import generateToken from "../src/utils/generateToken.js";
import User from "../src/models/User.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

describe("Products end points ", () => {
  let adminToken;
  let userToken;

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash("admin", 5);
    const admin = await User.create({
      name: "admin",
      password: hashedPassword,
      email: "admin@gmail.com",
      role: "admin",
    });
    adminToken = generateToken(admin._id, admin.role);
    const user = await User.create({
      name: "user",
      password: hashedPassword,
      email: "user2@gmail.com",
      role: "user",
    });
    userToken = generateToken(user._id, user.role);
  });

  // get all products
  describe("GET /products", () => {
    it("should get all products with correct properties", async () => {
      const product1 = await Product.create({
        name: "Tablet",
        price: 2000,
        description: "ini tablet",
        category: "electronic",
        stock: 5,
        images: "test1.jpg",
      });
      const product2 = await Product.create({
        name: "Laptop",
        price: 9000,
        description: "ini laptop",
        category: "electronic",
        stock: 5,
        images: "test1.jpg",
      });

      const res = await request(app)
        .get("/api/products")
        .set("Authorization", `Bearer ${adminToken}`);
      await expect(res.statusCode).toBe(200);
      await expect(res.body.success).toBe(true);
      // cek bahwa harus ada semua properti di product
      res.body.data.forEach(async (product) => {
        await expect(product).toHaveProperty("name");
        await expect(product).toHaveProperty("price");
        await expect(product).toHaveProperty("description");
        await expect(product).toHaveProperty("stock");
        await expect(product).toHaveProperty("images");
      });
    });
  });
  it("should return pagination metadata", async () => {
    const res = await request(app)
      .get("/api/products")
      .set("authorization", `Bearer ${adminToken}`);
    await expect(res.statusCode).toBe(200);
    await expect(res.body.success).toBe(true);
    await expect(res.body).toHaveProperty("pagination");
    await expect(res.body.pagination).toHaveProperty("currentPage");
    await expect(res.body.pagination).toHaveProperty("totalPages");
  });
  // get products by id
  describe("Get /products/:id", () => {
    it("should 404 if product not found", async () => {
      const invalidProductId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/products/${invalidProductId}`)
        .set("authorization", `Bearer ${adminToken}`);
      await expect(res.statusCode).toBe(404);
      await expect(res.body.message).toBe("Product not found");
    });
    it("should return 500 if invalid MongoDb Format", async () => {
      const res = await request(app)
        .get("/api/products/invalidId")
        .set("authorization", `Bearer ${adminToken}`);

      await expect(res.statusCode).toBe(500);
      await expect(res.body.message).toBe("Server Error");
    });
    it("should get product by ID when product exists", async () => {
      const product = await Product.create({
        name: "Phone",
        price: 5000,
        description: "ini phone",
        category: "electronic",
        stock: 10,
        images: "test.jpg",
      });

      const res = await request(app)
        .get(`/api/products/${product._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(product._id.toString());
      expect(res.body.name).toBe("Phone");
    });
  });

  describe("POST /api/products", () => {
    it("should create a product successfully with admin role", async () => {
      const product1 = {
        name: "New Ipad",
        price: 5000,
        description: "Latest smartphone model",
        category: "electronic",
        stock: 20,
      };
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .field("name", product1.name)
        .field("price", product1.price)
        .field("description", product1.description)
        .field("category", product1.category)
        .field("stock", product1.stock);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("images");
      expect(res.body.name).toBe("New Ipad");
      expect(res.body.price).toBe(5000);
      expect(res.body.stock).toBe(20);
    });
    it("should return 400 if product name already exists", async () => {
      // Create first product
      await Product.create({
        name: "Duplicate Product",
        price: 1000,
        description: "First product",
        category: "electronic",
        stock: 5,
        images: "test.jpg",
      });
      // Try to create product with same name
      const productData = {
        name: "Duplicate Product",
        price: 2000,
        description: "Second product",
        category: "electronic",
        stock: 10,
      };
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(productData);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Product already exists");
    });
    it("should return 400 if required fields are missing", async () => {
      const productData = {
        name: "Incomplete Product",
        price: 1000,
        // missing description, category, stock
      };
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(productData);
      expect(res.statusCode).toBe(400);
    });
    it("should reject non-admin user from creating product", async () => {
      const productData = {
        name: "Unauthorized Product",
        price: 1000,
        description: "User trying to create",
        category: "electronic",
        stock: 5,
      };
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${userToken}`)
        .send(productData);
      expect(res.statusCode).toBe(403); // Forbidden
    });
    it("should return 401 if no authorization token provided", async () => {
      const productData = {
        name: "No Auth Product",
        price: 1000,
        description: "No token",
        category: "electronic",
        stock: 5,
      };
      const res = await request(app).post("/api/products").send(productData);
      expect(res.statusCode).toBe(401); // Unauthorized
    });
    it("should return 400 if price is negative", async () => {
      const productData = {
        name: "Negative Price Product",
        price: -1000,
        description: "Invalid price",
        category: "electronic",
        stock: 5,
      };
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(productData);
      expect(res.statusCode).toBe(400);
    });
    it("should return 400 if stock is negative", async () => {
      const productData = {
        name: "Negative Stock Product",
        price: 1000,
        description: "Invalid stock",
        category: "electronic",
        stock: -5,
      };
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(productData);
      expect(res.statusCode).toBe(400);
    });
  });
});
