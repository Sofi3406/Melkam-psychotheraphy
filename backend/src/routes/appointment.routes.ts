
import { Router } from "express";
import {
  listAppointments,       
  getAppointmentById,     
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointment.controller";
import { authenticate } from "../middlewares/auth";


const router = Router();

// Create
router.post("/", authenticate, createAppointment);

// List
router.get("/", authenticate, listAppointments);

// Get by ID
router.get("/:id", authenticate, getAppointmentById);

// Update
router.put("/:id", authenticate, updateAppointment);

// Delete
router.delete("/:id", authenticate, deleteAppointment);

export default router;
