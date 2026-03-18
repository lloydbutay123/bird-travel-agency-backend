import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// routes import
import authRouter from "./routes/auth.route.js";

// routes declaration
app.use("/api/v1/users", authRouter);

export default app;
