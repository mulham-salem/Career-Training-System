import express from "express";
import { body, param } from "express-validator";
import {
    createJob,
    updateJob,
    deleteJob,
    getMyJobs,
} from "../controllers/job.controller";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import validateRequestMiddleware from "../middlewares/validateRequest.middleware";

const router = express.Router();

router.use(protect, restrictTo("EMPLOYER"));

// POST /api/job/create
router.post(
  "/create",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("location").optional(),
    body("type").optional().isIn(["full-time", "part-time", "internship"]),
  ],
  validateRequestMiddleware,
  createJob
);

// GET /api/job/view
router.get("/view", getMyJobs);

// PUT /api/job/edit/:id
router.put(
  "/edit/:id",
  [
    param("id").isInt().withMessage("Id is required and must be an integer"),
    body("title").optional(),
    body("description").optional(),
    body("location").optional(),
    body("type").optional().isIn(["full-time", "part-time", "internship"]),
  ],
  validateRequestMiddleware,
  updateJob
);

// DELETE /api/job/delete/:id
router.delete(
  "/delete/:id",
  [param("id").isInt().withMessage("Id is required and must be an integer")],
  validateRequestMiddleware,
  deleteJob
);


export default router;
