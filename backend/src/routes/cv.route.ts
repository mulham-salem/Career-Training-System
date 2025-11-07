import express from "express";
import { param } from "express-validator";
import { upload as uploadMulter } from "../middlewares/multer.middleware";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import validateRequestMiddleware from "../middlewares/validateRequest.middleware";
import {
  uploadCV,
  updateCV,
  deleteCV,
  getMyCV,
} from "../controllers/cv.controller";

const router = express.Router();

router.use(protect, restrictTo("JOB_SEEKER"));

// POST /api/cv/upload
router.post("/upload", uploadMulter.single("cv"), uploadCV);


// GET /api/cv/view
router.get("/view", getMyCV);


// PUT /api/cv/update/:id
router.put(
  "/update/:id",
  uploadMulter.single("cv"),
  [param("id").isInt().withMessage("CV id is required and must be an integer")],
  validateRequestMiddleware,
  updateCV
);


// DELETE /api/cv/delete/:id
router.delete(
  "/delete/:id",
  uploadMulter.single("cv"),
  [param("id").isInt().withMessage("CV id is required and must be an integer")],
  validateRequestMiddleware,
  deleteCV
);


export default router;
