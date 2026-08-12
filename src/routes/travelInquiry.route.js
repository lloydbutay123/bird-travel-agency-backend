import { Router } from "express";
import { submitTravelInquiry } from "../controllers/travelInquiry.controller.js";

const router = Router();

router.post("/", submitTravelInquiry);

export default router;
