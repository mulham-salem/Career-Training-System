import express from "express";
import { body } from "express-validator";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import validateRequestMiddleware from "../middlewares/validateRequest.middleware";
import {
  handleCareerPaths,
  handleLearningPlan,
  handleCVAnalysis,
  handleCareerAdvice,
} from "../controllers/ai.controller";
import multer from 'multer';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.use(protect, restrictTo("JOB_SEEKER"), validateRequestMiddleware);

// POST /api/ai/career-paths
router.post(
  "/career-paths",
  [
    body("userId")
      .isInt({ gt: 0 })
      .withMessage("userId must be a positive integer"),
    body("userData").isObject().withMessage("userData must be an object"),
  ],
  handleCareerPaths
);

// POST /api/ai/learning-plan
router.post(
    "/learning-plan",
    [
        body("userId").isInt({ gt: 0 }).withMessage("userId must be a positive integer"),
        body("goal").isString().notEmpty().withMessage("goal is required"),
    ],
    handleLearningPlan
);

// POST /api/ai/cv-analysis
router.post(
    "/cv-analysis",
    upload.single("file"),
    [
        body("userId").isInt({ gt: 0 }).withMessage("userId must be a positive integer"),
        // cvText is optional if PDF is sent
        body("cvText").optional().isString().withMessage("cvText must be a string"),
    ],
    handleCVAnalysis
);

// POST /api/ai/career-advice
router.post(
    "/career-advice",
    [
        body("userId").isInt({ gt: 0 }).withMessage("userId must be a positive integer"),
        body("question").isString().notEmpty().withMessage("question is required"),
    ],
    handleCareerAdvice
);

export default router;
