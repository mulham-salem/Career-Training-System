import express from "express";
import { body, query } from "express-validator";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import validateRequestMiddleware from "../middlewares/validateRequest.middleware";
import {
  browseOpportunities,
  searchOpportunities,
  applyForOpportunities,
  getUserApplications,
  getUserRecommendations,
} from "../controllers/opportunity.controller";

const router = express.Router();

router.use(protect, restrictTo("JOB_SEEKER"));

// GET /api/opportunity/browse
router.get("/browse", browseOpportunities);

// GET /api/opportunity/search?keyword={keyword}&type={type}&location={location}
router.get(
  "/search",
  [
    query("keyword").optional().isString().trim().escape(),
    query("type")
      .optional()
      .isString()
      .isIn(["full-time", "part-time", "internship"])
      .withMessage("Invalid type"),
    query("location").optional().isString().trim().escape(),
  ],
  validateRequestMiddleware,
  searchOpportunities
);

// POST /api/opportunity/apply
router.post(
    "/apply",
    [
        body("jobId").optional().isInt({ gt: 0 }).withMessage("Job ID must be a positive integer"),
        body("trainingId").optional().isInt({ gt: 0 }).withMessage("Training ID must be a positive integer"),
        body().custom((body) => {
            if ( !body.jobId && !body.trainingId ) {
                throw new Error("Either jobId or trainingId is required");
            }
            return true;
        }),
    ],
    validateRequestMiddleware,
    applyForOpportunities
)

// GET /api/opportunity/applications
router.get("/applications", getUserApplications);

// GET /api/opportunity/recommendations
router.get("/recommendations", getUserRecommendations);

export default router;
