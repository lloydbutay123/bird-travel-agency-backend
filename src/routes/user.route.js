import { Router } from "express";
import { getMe, updateUser } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.patch("/me", protect, updateUser);
router.get("/me", protect, getMe);

export default router;
