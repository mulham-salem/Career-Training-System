import { Router } from "express";
import { body } from "express-validator";
import { registerUser } from "../controllers/auth.controller";
import { loginUser } from "../controllers/auth.controller";
import validateRequestMiddleware from "../middlewares/validateRequest.middleware";

const router = Router();

router.use(validateRequestMiddleware);

// POST /api/auth/signup
router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("name").notEmpty().withMessage("Name is required"),
    body("role")
      .isIn(["JOB_SEEKER", "EMPLOYER"])
      .withMessage("Role must be JOB_SEEKER or  EMPLOYER"),
  ],
  registerUser
);

// POST /api/auth/signIn
router.post(
  "/signIn",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  loginUser
);

export default router;
