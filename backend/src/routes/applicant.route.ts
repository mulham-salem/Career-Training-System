import express from "express";
import { body, query, param } from "express-validator";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import validateRequestMiddleware from "../middlewares/validateRequest.middleware";
import {
  getApplicantsForOpportunities,
  filterApplicantsBySkill,
  updateApplicationStatus,
} from "../controllers/applicant.controller";

const router = express.Router();

router.use(protect, restrictTo("EMPLOYER"), validateRequestMiddleware);

// GET /api/applicant/fetch?type={type}
router.get(
  "/fetch",
  [query("type").notEmpty().isIn(["job", "training"])],
  getApplicantsForOpportunities
);

// GET /api/applicant/filter?skillName={skillName}
router.get(
  "/filter",
  [query("skillName").notEmpty().isString().trim().escape()],
  filterApplicantsBySkill
);

// PUT /api/applicant/update-status/:id
router.put(
  "/update-status/:id",
  [
    param("id").isInt().withMessage("Application ID must be an integer"),
    body("status")
      .isIn(["ACCEPTED", "REJECTED"])
      .withMessage("Status must be ACCEPTED or REJECTED"),
  ],
  updateApplicationStatus
);

export default router;
