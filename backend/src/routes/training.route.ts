import express from "express";
import { body, param } from "express-validator";
import {
  createTraining,
  updateTraining,
  deleteTraining,
  getMyTrainings,
} from "../controllers/training.controller";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import validateRequestMiddleware from "../middlewares/validateRequest.middleware";

const router = express.Router();

router.use(protect, restrictTo("EMPLOYER"));

// POST /api/training/create
router.post(
  "/create",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("duration").optional(),
  ],
  validateRequestMiddleware,
  createTraining
);

// GET /api/training/view
router.get("/view", getMyTrainings);

// PUT /api/training/edit/:id
router.put(
  "/edit/:id",
  [
    param("id").isInt().withMessage("Id is required and must be an integer"),
    body("title").optional(),
    body("description").optional(),
    body("duration").optional(),
  ],
  validateRequestMiddleware,
  updateTraining
);

// DELETE /api/training/delete/:id
router.delete(
  "/delete/:id",
  [param("id").isInt().withMessage("Id is required and must be an integer")],
  validateRequestMiddleware,
  deleteTraining
);

export default router;
