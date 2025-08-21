import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const appointmentStatusEnum = pgEnum('appointment_status', ['pending', 'approved', 'denied']);

export const timeSlots = pgTable("time_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(), // YYYY-MM-DD format
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  isAvailable: text("is_available").notNull().default("true"), // "true" or "false"
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slotId: varchar("slot_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  reason: text("reason").notNull(),
  status: appointmentStatusEnum("status").notNull().default("pending"),
  bookedAt: timestamp("booked_at").notNull().default(sql`now()`),
});

export const insertTimeSlotSchema = createInsertSchema(timeSlots).pick({
  date: true,
  startTime: true,
  endTime: true,
  isAvailable: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  slotId: true,
  customerName: true,
  customerEmail: true,
  reason: true,
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'denied']),
});

export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type UpdateAppointmentStatus = z.infer<typeof updateAppointmentStatusSchema>;
