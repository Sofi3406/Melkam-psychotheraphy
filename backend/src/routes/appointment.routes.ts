import { Router, Request, Response, NextFunction } from "express";
import {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointment.controller";
import { verifyToken } from "../middlewares/auth";


const router = Router();

/**
 * Middleware: patients can only create appointments for themselves
 */
function ensurePatientSelf(req: Request, res: Response, next: NextFunction) {
  const user = req.user as { id: string; role: string }; // injected by verifyToken
  const { patientId } = req.body;

  if (user.role === "PATIENT" && patientId !== user.id) {
    return res.status(403).json({
      success: false,
      message: "Patients can only create appointments for themselves.",
    });
  }

  next();
}

// Routes
router.post("/", verifyToken, ensurePatientSelf, createAppointment);
router.get("/", verifyToken, getAppointments);
router.get("/:id", verifyToken, getAppointment);
router.put("/:id", verifyToken, updateAppointment);
router.delete("/:id", verifyToken, deleteAppointment);

export default router;
