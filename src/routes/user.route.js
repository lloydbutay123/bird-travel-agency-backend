import { Router } from "express";
import {
  getMe,
  requestEmailChange,
  updateUser,
  verifyEmailChange,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.patch("/me", protect, updateUser);
router.get("/me", protect, getMe);

router.post("/change-email", protect, requestEmailChange);
router.post("/verify-email-change", protect, verifyEmailChange);

export default router;
