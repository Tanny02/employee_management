import express from "express";
import cors from "cors";
import helmet from "helmet";
import employeeRoutes from "./routes/employeeRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => res.json({ success: true, message: "API is running" }));
app.use("/api/employees", employeeRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
