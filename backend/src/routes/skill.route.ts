import express from "express";
import { body } from "express-validator";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import validateRequestMiddleware from "../middlewares/validateRequest.middleware";
import {
  upsertUserSkill,
  getUserSkills,
} from "../controllers/skill.controller";

const router = express.Router();

router.use(protect, restrictTo("JOB_SEEKER"));

// GET /api/skill/view
router.get("/view", getUserSkills);

// PUT /api/skill/upsert
router.put(
  "/upsert",
  [
    body("skills")
      .isArray({ min: 1 })
      .withMessage("Skills must be a non-empty array"),
    body("skills.*")
      .isString()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Each skill must be a valid string"),
  ],
  validateRequestMiddleware,
  upsertUserSkill
);

export default router;
