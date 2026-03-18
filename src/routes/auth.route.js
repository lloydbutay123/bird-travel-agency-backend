import { Router } from "express";
import { getMe, login, signup } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", signup);
router.post("/login", login);
router.get("/me", protect, getMe);

export default router;
