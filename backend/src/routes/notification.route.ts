import express from "express";
import { body } from "express-validator";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import validateRequestMiddleware from "../middlewares/validateRequest.middleware";
import {
  getUnreadNotifications,
  markNotificationAsRead,
} from "../controllers/notification.controller";

const router = express.Router();

router.use(
  protect,
  restrictTo("JOB_SEEKER", "EMPLOYER"),
  validateRequestMiddleware
);

// GET /api/notifications/unread
router.get("/unread", getUnreadNotifications);

// PATCH /api/notifications/mark-read
router.patch(
  "/mark-read",
  [
    body("notificationIds")
      .isArray({ min: 1 })
      .withMessage("notificationIds must be a non-empty array of IDs"),
    body("notificationIds.*")
      .isInt({ gt: 0 })
      .withMessage("Each notification ID must be a positive integer"),
  ],
  markNotificationAsRead
);

export default router;