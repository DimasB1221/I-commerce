import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import bcrypt from "bcrypt"; // atau 'bcrypt' sesuai yang kamu pakai

describe("Auth endpoints", () => {
  describe("POST /auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "testuser",
        email: "test@example.com",
        password: "password123",
        role: "user",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
      // Response langsung berisi data user, bukan nested di property 'user'
      expect(res.body).toHaveProperty("email");
      expect(res.body.email).toBe("test@example.com");

      // Cek di DB
      const userInDb = await User.findOne({ email: "test@example.com" });
      expect(userInDb).not.toBeNull();
    });

    it("should not allow duplicate email", async () => {
      // Buat user pertama dengan password yang di-hash
      const hashedPassword = await bcrypt.hash("password123", 10);
      await User.create({
        name: "dup",
        email: "dup@example.com",
        password: hashedPassword,
        role: "user",
      });

      // Coba register dengan email yang sama
      const res = await request(app).post("/api/auth/register").send({
        name: "other",
        email: "dup@example.com",
        password: "password123",
        role: "user",
      });

      console.log("REGISTER RESPONSE:", res.body);
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      // Hash password sebelum disimpan ke DB
      const hashedPassword = await bcrypt.hash("password123", 10);
      await User.create({
        name: "loginuser",
        email: "login@example.com",
        password: hashedPassword,
        role: "user",
      });
    });

    it("should login with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      // Sesuaikan dengan struktur response API kamu
      expect(res.body.email).toBe("login@example.com");
    });

    it("should reject invalid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message");
    });
  });
});
