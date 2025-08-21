import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, updateAppointmentStatusSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all time slots
  app.get("/api/slots", async (req, res) => {
    try {
      const slots = await storage.getAllTimeSlots();
      res.json(slots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch time slots" });
    }
  });

  // Get all appointments (for admin)
  app.get("/api/appointments", async (req, res) => {
    try {
      const { status } = req.query;
      let appointments;
      
      if (status && typeof status === 'string' && status !== 'all') {
        appointments = await storage.getAppointmentsByStatus(status);
      } else {
        appointments = await storage.getAllAppointments();
      }
      
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Create new appointment
  app.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      
      // Check if slot exists and is available
      const slot = await storage.getTimeSlotById(validatedData.slotId);
      if (!slot) {
        return res.status(404).json({ message: "Time slot not found" });
      }
      
      if (slot.isAvailable !== "true") {
        return res.status(400).json({ message: "Time slot is not available" });
      }
      
      // Check if slot is already booked
      const existingAppointments = await storage.getAllAppointments();
      const slotBooked = existingAppointments.some(
        apt => apt.slotId === validatedData.slotId && apt.status !== "denied"
      );
      
      if (slotBooked) {
        return res.status(400).json({ message: "Time slot is already booked" });
      }
      
      // Create appointment
      const appointment = await storage.createAppointment(validatedData);
      
      // Mark slot as unavailable
      await storage.updateTimeSlot(validatedData.slotId, { isAvailable: "false" });
      
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  // Update appointment status (approve/deny)
  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateAppointmentStatusSchema.parse(req.body);
      
      const appointment = await storage.updateAppointmentStatus(id, validatedData);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // If appointment is denied, make the slot available again
      if (validatedData.status === "denied") {
        await storage.updateTimeSlot(appointment.slotId, { isAvailable: "true" });
      }
      
      res.json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid status data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });

  // Get appointment statistics
  app.get("/api/appointments/stats", async (req, res) => {
    try {
      const appointments = await storage.getAllAppointments();
      const slots = await storage.getAllTimeSlots();
      
      const stats = {
        totalSlots: slots.length,
        pending: appointments.filter(apt => apt.status === 'pending').length,
        approved: appointments.filter(apt => apt.status === 'approved').length,
        denied: appointments.filter(apt => apt.status === 'denied').length,
        totalAppointments: appointments.length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
