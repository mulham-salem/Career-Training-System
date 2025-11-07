import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc Get unread notifications for a user
 * @route GET /api/notifications/unread
 * @access Private
 * @role (JOB_SEEKER - EMPLOYER)
 * @param req
 * @param res
 */
export const getUnreadNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = Number((req as any).user.id);

        const notifications = await prisma.notification.findMany({
            where: { userId, read: false },
            orderBy: { createdAt: "desc" },
        });

        res.status(200).json({ notifications });
    } catch (err) {
        console.error("❌ Error fetching unread notifications:", err);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

/**
 * @desc Mark notifications as read
 * @route PATCH /api/notifications/mark-read
 * @access Private
 * @role (JOB_SEEKER - EMPLOYER)
 * @param req
 * @param res
 */
export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = Number((req as any).user.id);
        const { notificationIds } = req.body;

        await prisma.notification.updateMany({
            where: {
                id: { in: notificationIds },
                userId,
            },
            data: { read: true },
        });
        res.status(200).json({ message: "Notifications marked as read successfully" });
    } catch (err) {
        console.error("❌ Error marking notifications as read:", err);
        res.status(500).json({ message: "Failed to mark notifications as read" });
    }
};