import { type TimeSlot, type InsertTimeSlot, type Appointment, type InsertAppointment, type UpdateAppointmentStatus } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Time slots
  getAllTimeSlots(): Promise<TimeSlot[]>;
  getTimeSlotById(id: string): Promise<TimeSlot | undefined>;
  createTimeSlot(slot: InsertTimeSlot): Promise<TimeSlot>;
  updateTimeSlot(id: string, updates: Partial<TimeSlot>): Promise<TimeSlot | undefined>;
  
  // Appointments
  getAllAppointments(): Promise<Appointment[]>;
  getAppointmentById(id: string): Promise<Appointment | undefined>;
  getAppointmentsByStatus(status: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: string, status: UpdateAppointmentStatus): Promise<Appointment | undefined>;
  
  // Initialize data
  initializeWeeklySlots(): Promise<void>;
}

export class MemStorage implements IStorage {
  private timeSlots: Map<string, TimeSlot>;
  private appointments: Map<string, Appointment>;

  constructor() {
    this.timeSlots = new Map();
    this.appointments = new Map();
    this.initializeWeeklySlots();
  }

  // Time slots methods
  async getAllTimeSlots(): Promise<TimeSlot[]> {
    return Array.from(this.timeSlots.values());
  }

  async getTimeSlotById(id: string): Promise<TimeSlot | undefined> {
    return this.timeSlots.get(id);
  }

  async createTimeSlot(insertSlot: InsertTimeSlot): Promise<TimeSlot> {
    const id = randomUUID();
    const slot: TimeSlot = { ...insertSlot, id };
    this.timeSlots.set(id, slot);
    return slot;
  }

  async updateTimeSlot(id: string, updates: Partial<TimeSlot>): Promise<TimeSlot | undefined> {
    const slot = this.timeSlots.get(id);
    if (!slot) return undefined;
    
    const updatedSlot = { ...slot, ...updates };
    this.timeSlots.set(id, updatedSlot);
    return updatedSlot;
  }

  // Appointments methods
  async getAllAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointmentById(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByStatus(status: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(apt => apt.status === status);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = {
      ...insertAppointment,
      id,
      status: "pending" as const,
      bookedAt: new Date(),
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointmentStatus(id: string, statusUpdate: UpdateAppointmentStatus): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, status: statusUpdate.status };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Initialize weekly slots (Monday-Friday, 9AM-5PM, 30-min intervals)
  async initializeWeeklySlots(): Promise<void> {
    const today = new Date();
    const currentWeek = this.getWeekDates(today);
    
    // Only weekdays (Monday-Friday)
    const weekdays = currentWeek.slice(0, 5);
    
    for (const date of weekdays) {
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Generate slots from 9:00 AM to 5:00 PM (30-minute intervals)
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const endHour = minute === 30 ? hour + 1 : hour;
          const endMinute = minute === 30 ? 0 : 30;
          const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
          
          await this.createTimeSlot({
            date: dateStr,
            startTime,
            endTime,
            isAvailable: "true"
          });
        }
      }
    }
  }

  private getWeekDates(date: Date): Date[] {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  }
}

export const storage = new MemStorage();
