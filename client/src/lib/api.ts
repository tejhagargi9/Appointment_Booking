import { apiRequest } from "@/lib/queryClient";
import type { TimeSlot, Appointment, InsertAppointment, UpdateAppointmentStatus } from "@shared/schema";

export const api = {
  // Slots
  getSlots: async (): Promise<TimeSlot[]> => {
    const res = await apiRequest("GET", "/api/slots");
    return res.json();
  },

  // Appointments
  getAppointments: async (status?: string): Promise<Appointment[]> => {
    const url = status && status !== 'all' ? `/api/appointments?status=${status}` : '/api/appointments';
    const res = await apiRequest("GET", url);
    return res.json();
  },

  createAppointment: async (appointment: InsertAppointment): Promise<Appointment> => {
    const res = await apiRequest("POST", "/api/appointments", appointment);
    return res.json();
  },

  updateAppointmentStatus: async (id: string, status: UpdateAppointmentStatus): Promise<Appointment> => {
    const res = await apiRequest("PATCH", `/api/appointments/${id}`, status);
    return res.json();
  },

  getStats: async (): Promise<{
    totalSlots: number;
    pending: number;
    approved: number;
    denied: number;
    totalAppointments: number;
  }> => {
    const res = await apiRequest("GET", "/api/appointments/stats");
    return res.json();
  }
};
