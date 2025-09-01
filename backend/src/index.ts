import express from "express";
import dotenv from "dotenv";
import prisma from "./prismaClient";

import appointmentRoutes from "./routes/appointment.routes"; 



dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use("/appointments", appointmentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ success: true, message: "API is running 🚀" });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

export default app;
