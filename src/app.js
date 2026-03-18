import express from "express";
import cors from "cors";

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

// routes import
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

// routes declaration
app.use("/api/v1/users", authRouter);

export default app;
