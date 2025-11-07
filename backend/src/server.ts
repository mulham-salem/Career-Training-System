import app from "./app";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import http from "http";
import { initSocket } from "./utils/socket";

dotenv.config();

const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Create new http server
const server = http.createServer(app);

async function startServer(): Promise<void> {
  try {
    // ✅ 1. Connect to database
    await prisma.$connect();
    console.log("✅ Database connected successfully!");

    // ✅ 2. Initialize Socket.IO
    initSocket(app, server);
    console.log("🛰️ WebSocket server initialized!");

    // ✅ 3. Run Http Server (Express + WebSocket)
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ DB connection failed. Server not started.", err);
  }
}

startServer().catch((err) => console.log("Unexpected error: ", err));
