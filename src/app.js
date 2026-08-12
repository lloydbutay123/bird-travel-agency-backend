import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import travelInquiryRouter from "./routes/travelInquiry.route.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://bird-travel-agency-frontend.vercel.app",
      "https://mytravelicious-travel-agency.vercel.app/",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// routes declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

app.use("/api/v1/travel-inquiries", travelInquiryRouter);

export default app;
