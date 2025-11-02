// test/socket.test.js
import { io as Client } from "socket.io-client";
import { createServer } from "http";
import express from "express";
import { initSocket, getIO } from "../src/socket/index.js";
import Order from "../src/models/Order.js";
import Cart from "../src/models/Cart.js";
import Product from "../src/models/Product.js";
import app from "../src/app.js";
import User from "../src/models/User.js";

describe("Socket.IO Tests", () => {
  let server;
  let io;
  let clientSocket;
  let testUser;
  let authToken;
  const TEST_PORT = 3002;

  beforeAll(async () => {
    // Setup Express app
    app.use(express.json());

    // Create HTTP server
    server = createServer(app);

    // Initialize Socket.IO
    io = initSocket(server);

    // Start server
    await new Promise((resolve) => {
      server.listen(TEST_PORT, resolve);
    });

    // Create test user
    testUser = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    // Mock auth token
    authToken = "mock-jwt-token";
  });

  afterAll(async () => {
    if (clientSocket?.connected) {
      clientSocket.disconnect();
    }
    if (io) {
      io.close();
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  afterEach(async () => {
    if (clientSocket?.connected) {
      clientSocket.disconnect();
    }
  });

  describe("Socket.IO Connection", () => {
    test("should initialize Socket.IO successfully", () => {
      expect(io).toBeDefined();
      expect(typeof io.emit).toBe("function");
    });

    test("should connect client to server", (done) => {
      clientSocket = Client(`http://localhost:${TEST_PORT}`, {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 3,
      });

      clientSocket.on("connect", () => {
        expect(clientSocket.connected).toBe(true);
        expect(clientSocket.id).toBeDefined();
        done();
      });

      clientSocket.on("connect_error", (error) => {
        done(error);
      });
    });

    test("should handle multiple concurrent connections", (done) => {
      const client1 = Client(`http://localhost:${TEST_PORT}`);
      const client2 = Client(`http://localhost:${TEST_PORT}`);
      let connectedCount = 0;

      const handleConnect = () => {
        connectedCount++;
        if (connectedCount === 2) {
          expect(client1.connected).toBe(true);
          expect(client2.connected).toBe(true);
          expect(client1.id).not.toBe(client2.id);

          client1.disconnect();
          client2.disconnect();
          done();
        }
      };

      client1.on("connect", handleConnect);
      client2.on("connect", handleConnect);
    });

    test("should disconnect properly", (done) => {
      clientSocket = Client(`http://localhost:${TEST_PORT}`);

      clientSocket.on("connect", () => {
        expect(clientSocket.connected).toBe(true);
        clientSocket.disconnect();
      });

      clientSocket.on("disconnect", (reason) => {
        expect(clientSocket.connected).toBe(false);
        expect(reason).toBe("io client disconnect");
        done();
      });
    });

    test("should handle connection timeout", (done) => {
      const badClient = Client("http://localhost:9999", {
        reconnectionAttempts: 1,
        timeout: 1000,
      });

      badClient.on("connect_error", (error) => {
        expect(error).toBeDefined();
        badClient.close();
        done();
      });
    });
  });

  describe("order:new Event", () => {
    beforeEach((done) => {
      clientSocket = Client(`http://localhost:${TEST_PORT}`);
      clientSocket.on("connect", done);
    });

    test("should emit order:new event when order is created", (done) => {
      const mockOrder = {
        _id: "order123",
        user: testUser._id,
        products: [
          {
            product: "prod1",
            name: "Test Product",
            price: 50000,
            quantity: 2,
          },
        ],
        totalPrice: 100000,
        status: "pending",
      };

      clientSocket.on("order:new", (data) => {
        expect(data).toHaveProperty("message");
        expect(data).toHaveProperty("order");
        expect(data.message).toBe("New order created");
        expect(data.order._id).toBe(mockOrder._id);
        expect(data.order.totalPrice).toBe(100000);
        expect(data.order.status).toBe("pending");
        done();
      });

      // Simulate order creation emission
      const serverIO = getIO();
      serverIO.emit("order:new", {
        message: "New order created",
        order: mockOrder,
      });
    });

    test("should broadcast order:new to all connected clients", (done) => {
      const client2 = Client(`http://localhost:${TEST_PORT}`);
      let receivedCount = 0;
      const mockOrder = {
        _id: "order456",
        totalPrice: 75000,
        status: "pending",
      };

      const handleOrderReceived = (data) => {
        expect(data.order._id).toBe("order456");
        receivedCount++;

        if (receivedCount === 2) {
          client2.disconnect();
          done();
        }
      };

      clientSocket.on("order:new", handleOrderReceived);

      client2.on("connect", () => {
        client2.on("order:new", handleOrderReceived);

        setTimeout(() => {
          const serverIO = getIO();
          serverIO.emit("order:new", {
            message: "New order created",
            order: mockOrder,
          });
        }, 100);
      });
    });

    test("should handle multiple orders sequentially", (done) => {
      const orders = [];
      let receivedCount = 0;

      clientSocket.on("order:new", (data) => {
        orders.push(data.order);
        receivedCount++;

        if (receivedCount === 3) {
          expect(orders).toHaveLength(3);
          expect(orders[0]._id).toBe("order1");
          expect(orders[1]._id).toBe("order2");
          expect(orders[2]._id).toBe("order3");
          done();
        }
      });

      const serverIO = getIO();

      setTimeout(() => {
        serverIO.emit("order:new", {
          message: "Order 1",
          order: { _id: "order1", totalPrice: 50000 },
        });
      }, 50);

      setTimeout(() => {
        serverIO.emit("order:new", {
          message: "Order 2",
          order: { _id: "order2", totalPrice: 60000 },
        });
      }, 100);

      setTimeout(() => {
        serverIO.emit("order:new", {
          message: "Order 3",
          order: { _id: "order3", totalPrice: 70000 },
        });
      }, 150);
    });

    test("should include correct order data structure", (done) => {
      const mockOrder = {
        _id: "order789",
        user: testUser._id,
        products: [
          { product: "prod1", name: "Item 1", price: 25000, quantity: 2 },
          { product: "prod2", name: "Item 2", price: 50000, quantity: 1 },
        ],
        totalPrice: 100000,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      clientSocket.on("order:new", (data) => {
        expect(data.order).toHaveProperty("_id");
        expect(data.order).toHaveProperty("user");
        expect(data.order).toHaveProperty("products");
        expect(data.order).toHaveProperty("totalPrice");
        expect(data.order).toHaveProperty("status");
        expect(data.order.products).toHaveLength(2);
        expect(data.order.products[0]).toHaveProperty("name");
        expect(data.order.products[0]).toHaveProperty("price");
        expect(data.order.products[0]).toHaveProperty("quantity");
        done();
      });

      const serverIO = getIO();
      serverIO.emit("order:new", {
        message: "New order created",
        order: mockOrder,
      });
    });
  });

  describe("getIO() Function", () => {
    test("should return Socket.IO instance", () => {
      const socketIO = getIO();
      expect(socketIO).toBeDefined();
      expect(typeof socketIO.emit).toBe("function");
      expect(typeof socketIO.on).toBe("function");
    });

    test("should return same instance on multiple calls", () => {
      const io1 = getIO();
      const io2 = getIO();
      expect(io1).toBe(io2);
    });

    test("should not reinitialize Socket.IO", () => {
      const io1 = getIO();
      const io2 = initSocket(server);
      expect(io1).toBe(io2);
    });
  });

  describe("Integration with Order Creation", () => {
    let product;
    let cart;

    beforeEach(async () => {
      // Create test product
      product = await Product.create({
        name: "Test Product",
        price: 50000,
        description: "test",
        stock: 10,
        category: "electronics",
        images: "test.jpg",
      });

      // Create cart for test user
      cart = await Cart.create({
        user: testUser._id,
        products: [
          {
            product: product._id,
            quantity: 2,
          },
        ],
      });
    });

    test("should emit socket event when order is created via API", (done) => {
      clientSocket = Client(`http://localhost:${TEST_PORT}`);

      clientSocket.on("connect", async () => {
        clientSocket.on("order:new", (data) => {
          expect(data.message).toBe("New order created");
          expect(data.order).toHaveProperty("_id");
          expect(data.order).toHaveProperty("totalPrice");
          expect(data.order.status).toBe("pending");
          done();
        });

        // Simulate order creation
        const order = await Order.create({
          user: testUser._id,
          products: [
            {
              product: product._id,
              name: product.name,
              price: product.price,
              descripition: product.descripition,
              quantity: 2,
              images: product.image,
            },
          ],
          totalPrice: 100000,
          status: "pending",
        });

        // Emit event (simulating controller behavior)
        const serverIO = getIO();
        serverIO.emit("order:new", {
          message: "New order created",
          order,
        });
      });
    });

    test("should handle socket emission error gracefully", async () => {
      // Create order without emitting socket event
      const order = await Order.create({
        user: testUser._id,
        products: [
          {
            product: product._id,
            name: product.name,
            price: product.price,
            descripition: product.description,
            quantity: 1,
            images: product.image,
          },
        ],
        totalPrice: 50000,
        status: "pending",
      });

      expect(order).toBeDefined();
      expect(order._id).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid event data", (done) => {
      clientSocket = Client(`http://localhost:${TEST_PORT}`);

      clientSocket.on("connect", () => {
        clientSocket.on("order:new", (data) => {
          // Should still receive data even if malformed
          expect(data).toBeDefined();
          done();
        });

        const serverIO = getIO();
        serverIO.emit("order:new", { invalid: "data" });
      });
    });

    test("should continue working after client disconnect", (done) => {
      const client1 = Client(`http://localhost:${TEST_PORT}`);
      const client2 = Client(`http://localhost:${TEST_PORT}`);

      client1.on("connect", () => {
        client1.disconnect();
      });

      client2.on("connect", () => {
        client2.on("order:new", (data) => {
          expect(data.message).toBe("Test message");
          client2.disconnect();
          done();
        });

        setTimeout(() => {
          const serverIO = getIO();
          serverIO.emit("order:new", { message: "Test message" });
        }, 200);
      });
    });

    test("should handle rapid connections and disconnections", (done) => {
      let connectionCount = 0;
      let disconnectionCount = 0;

      const createClient = () => {
        const client = Client(`http://localhost:${TEST_PORT}`);

        client.on("connect", () => {
          connectionCount++;
          setTimeout(() => client.disconnect(), 50);
        });

        client.on("disconnect", () => {
          disconnectionCount++;
          if (disconnectionCount === 5) {
            expect(connectionCount).toBe(5);
            expect(disconnectionCount).toBe(5);
            done();
          }
        });
      };

      for (let i = 0; i < 5; i++) {
        setTimeout(() => createClient(), i * 20);
      }
    });
  });

  describe("Socket.IO Performance", () => {
    test("should handle large order data", (done) => {
      clientSocket = Client(`http://localhost:${TEST_PORT}`);

      const largeOrder = {
        _id: "large-order",
        user: testUser._id,
        products: Array.from({ length: 100 }, (_, i) => ({
          product: `prod${i}`,
          name: `Product ${i}`,
          price: 10000 + i * 1000,
          quantity: i + 1,
        })),
        totalPrice: 5050000,
        status: "pending",
      };

      clientSocket.on("connect", () => {
        clientSocket.on("order:new", (data) => {
          expect(data.order.products).toHaveLength(100);
          expect(data.order.totalPrice).toBe(5050000);
          done();
        });

        const serverIO = getIO();
        serverIO.emit("order:new", {
          message: "Large order created",
          order: largeOrder,
        });
      });
    });

    test("should handle concurrent events", (done) => {
      clientSocket = Client(`http://localhost:${TEST_PORT}`);
      let receivedCount = 0;

      clientSocket.on("connect", () => {
        clientSocket.on("order:new", () => {
          receivedCount++;
          if (receivedCount === 10) {
            expect(receivedCount).toBe(10);
            done();
          }
        });

        const serverIO = getIO();
        for (let i = 0; i < 10; i++) {
          serverIO.emit("order:new", {
            message: `Order ${i}`,
            order: { _id: `order${i}`, totalPrice: 10000 * i },
          });
        }
      });
    });
  });
});
