import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://bird-travel-agency-frontend.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// routes declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

export default app;
