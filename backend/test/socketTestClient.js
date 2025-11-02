// test/socketTestClient.js
import { io } from "socket.io-client";
import "dotenv/config";

const SOCKET_SERVER_URL = `http://localhost:${process.env.PORT}`;

const connectSocket = async () => {
  return new Promise((resolve, reject) => {
    const socket = io(SOCKET_SERVER_URL, {
      transports: ["polling", "websocket"],
      reconnectionAttempts: 5,
      timeout: 5000,
    });

    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO Server:", socket.id);
      resolve(socket);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error.message);
      reject(error);
    });
  });
};

const listenForNewOrders = async () => {
  try {
    const socket = await connectSocket();

    console.log("📡 Listening for 'order:new' events...");

    // Tunggu event order baru
    await new Promise((resolve) => {
      socket.on("order:new", (data) => {
        console.log("🆕 New order received!");
        console.log(JSON.stringify(data, null, 2));
        resolve(); // selesai setelah event pertama diterima
      });
    });

    // Tutup koneksi setelah menerima event
    console.log("🔌 Closing socket connection...");
    socket.disconnect();
  } catch (error) {
    console.error("❗ Error while listening to socket:", error.message);
  }
};

listenForNewOrders();
