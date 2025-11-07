import express from "express";
import { body } from "express-validator";
import { upsertProfile, getMyProfile } from "../controllers/profile.controller";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import validateRequestMiddleware from "../middlewares/validateRequest.middleware";

const router = express.Router();

router.use(protect);
router.use(restrictTo("EMPLOYER", "JOB_SEEKER"));
router.use(validateRequestMiddleware);


// POST /api/profile/upsert
router.post(
  "/upsert",
  [
    body("bio").optional().isString(),
    body("location").optional().isString(),
    body("website").optional().isURL().withMessage("Invalid website URL"),
    body("phone").optional().isString(),
    body("experience").optional().isString(),
    body("education").optional().isString(),
  ],
  upsertProfile
);

// GET /api/profile/view
router.get("/view", getMyProfile);

export default router;
