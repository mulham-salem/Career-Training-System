import express from "express";
import { body, param } from "express-validator";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import validateRequestMiddleware from "../middlewares/validateRequest.middleware";
import {
  addUser,
  getUsers,
  updateUser,
  deleteUser,
  getOpportunities,
  deleteJob,
  deleteTraining,
  generateSystemReport
} from "../controllers/admin.controller";

const router = express.Router();

router.use(protect, restrictTo("ADMIN"), validateRequestMiddleware);

// POST /api/admin/add-user
router.post(
  "/add-user",
  [
    body("name")
      .notEmpty()
      .withMessage("Name is required.")
      .isString()
      .withMessage("Name must be a string."),
    body("email")
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Invalid email format."),
    body("password")
      .notEmpty()
      .withMessage("Password is required.")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters."),
    body("role")
      .notEmpty()
      .withMessage("Role is required.")
      .isIn(["JOB_SEEKER", "EMPLOYER", "ADMIN"])
      .withMessage("Invalid role type."),
  ],
  addUser
);

// GET /api/admin/users
router.get("/users", getUsers);

// PUT /api/admin/edit-user/:id
router.put(
  "/edit-user/:id",
  [
    param("id").isInt().withMessage("Invalid user ID."),
    body("name").optional().isString().withMessage("Name must be a string."),
    body("email").optional().isEmail().withMessage("Invalid email format."),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters."),
    body("role")
      .optional()
      .isIn(["JOB_SEEKER", "EMPLOYER", "ADMIN"])
      .withMessage("Invalid role type."),
  ],
  updateUser
);

// DELETE /api/admin/delete-user/:id
router.delete(
  "/delete-user/:id",
  [param("id").isInt().withMessage("Invalid user ID.")],
  deleteUser
);

// GET /api/admin/opportunities
router.get("/opportunities", getOpportunities);

// DELETE /api/admin/delete-job/:id
router.delete(
  "/delete-job/:id",
  [param("id").isInt().withMessage("Invalid job ID.")],
  deleteJob
);

// DELETE /api/admin/delete-training/:id
router.delete(
    "/delete-training/:id",
    [param("id").isInt().withMessage("Invalid training ID.")],
    deleteTraining
);

// GET /api/admin/report
router.get("/report", generateSystemReport);

export default router;
