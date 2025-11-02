import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { healthCheck } from "../src/controllers/health.controller.js";

// Setup Express app untuk testing
const app = express();
app.get("/health", healthCheck);

describe("Health Check Controller", () => {
  describe("GET /health", () => {
    it("should return 200 and status ok when database is connected", async () => {
      // Arrange
      const startTime = Date.now();

      // Act
      const response = await request(app).get("/health");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("uptime");
      expect(response.body).toHaveProperty("db");
      expect(response.body).toHaveProperty("timestamp");

      // Verify uptime is a positive number
      expect(typeof response.body.uptime).toBe("number");
      expect(response.body.uptime).toBeGreaterThan(0);

      // Verify timestamp is valid ISO string
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.getTime()).toBeGreaterThanOrEqual(startTime);

      // Verify database status is 'connected' (readyState === 1)
      expect(response.body.db).toBe("connected");
    });

    it("should return correct database status based on connection state", async () => {
      // Test when DB is connected (default from jest.setup.js)
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body.db).toBe("connected");
      expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    });

    it("should return response with all required fields", async () => {
      // Act
      const response = await request(app).get("/health");

      // Assert - Check structure
      expect(response.body).toMatchObject({
        status: expect.any(String),
        uptime: expect.any(Number),
        db: expect.any(String),
        timestamp: expect.any(String),
      });
    });

    it("should return valid ISO timestamp format", async () => {
      // Act
      const response = await request(app).get("/health");

      // Assert
      const timestamp = response.body.timestamp;
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      expect(timestamp).toMatch(isoRegex);

      // Verify it's a valid date
      const date = new Date(timestamp);
      expect(date.toString()).not.toBe("Invalid Date");
    });

    it("should have uptime less than test execution time", async () => {
      // Arrange
      const maxExpectedUptime = 60; // 60 seconds (reasonable for test environment)

      // Act
      const response = await request(app).get("/health");

      // Assert
      expect(response.body.uptime).toBeLessThan(maxExpectedUptime);
    });

    it("should return JSON content type", async () => {
      // Act
      const response = await request(app).get("/health");

      // Assert
      expect(response.headers["content-type"]).toMatch(/application\/json/);
    });
  });

  describe("Database Connection States", () => {
    it("should correctly identify connected state (readyState = 1)", async () => {
      // MongoDB is already connected from jest.setup.js
      expect(mongoose.connection.readyState).toBe(1);

      const response = await request(app).get("/health");

      expect(response.body.db).toBe("connected");
    });
  });

  describe("Response Time", () => {
    it("should respond within acceptable time (< 1000ms)", async () => {
      // Arrange
      const startTime = Date.now();

      // Act
      await request(app).get("/health");

      // Assert
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(1000); // Should respond in less than 1 second
    });
  });

  describe("Multiple Requests", () => {
    it("should handle multiple concurrent health checks", async () => {
      // Arrange
      const requests = Array(5)
        .fill()
        .map(() => request(app).get("/health"));

      // Act
      const responses = await Promise.all(requests);

      // Assert
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("ok");
        expect(response.body.db).toBe("connected");
      });
    });
  });
});
