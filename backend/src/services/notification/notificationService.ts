import { PrismaClient } from "@prisma/client";
import { getIO } from "../../utils/socket";

interface NotificationPayload {
  userId: number;
  title: string;
  message: string;
}

const prisma = new PrismaClient();

export const createNotification = async ({
  userId,
  title,
  message,
}: NotificationPayload): Promise<{
  id: number;
  userId: number;
  message: string;
  read: boolean;
  title: string;
  createdAt: Date;
}> => {

  // 1️⃣  Store the notification in db
  const notification = await prisma.notification.create({
    data: { userId, title, message },
  });

  // 2️⃣ if the user online send notification via WebSocket
  try {
    const io = getIO();
    io.to(String(userId)).emit("notification", notification);

  } catch (err) {
    console.log("⚠️ Socket.io not initialized or user offline", err);
  }

  return notification;
};
