import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { TimeSlot, Appointment } from "@shared/schema";

interface WeeklyCalendarProps {
  slots: TimeSlot[];
  weekDates: Date[];
  onSlotSelect: (slot: TimeSlot) => void;
}

export default function WeeklyCalendar({ slots, weekDates, onSlotSelect }: WeeklyCalendarProps) {
  const { data: appointments = [] } = useQuery({
    queryKey: ['/api/appointments'],
    queryFn: () => api.getAppointments(),
  });

  // Generate time slots from 9:00 AM to 5:00 PM in 30-minute intervals
  const timeSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = new Date(2024, 0, 1, hour, minute).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      timeSlots.push({ startTime, displayTime });
    }
  }

  const getSlotStatus = (date: Date, startTime: string) => {
    const dateStr = date.toISOString().split('T')[0];
    const slot = slots.find(s => s.date === dateStr && s.startTime === startTime);
    
    if (!slot) return 'unavailable';

    const appointment = appointments.find(apt => apt.slotId === slot.id && apt.status !== 'denied');
    
    if (appointment) {
      return appointment.status; // 'pending' or 'approved'
    }
    
    return slot.isAvailable === "true" ? 'available' : 'booked';
  };

  const handleSlotClick = (date: Date, startTime: string) => {
    const dateStr = date.toISOString().split('T')[0];
    const slot = slots.find(s => s.date === dateStr && s.startTime === startTime);
    
    if (slot && getSlotStatus(date, startTime) === 'available') {
      onSlotSelect(slot);
    }
  };

  const getSlotClassName = (status: string) => {
    switch (status) {
      case 'available':
        return 'w-full p-2 text-sm rounded border-2 border-dashed border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer';
      case 'pending':
        return 'w-full p-2 text-sm rounded bg-yellow-100 text-yellow-800 cursor-not-allowed';
      case 'approved':
      case 'booked':
        return 'w-full p-2 text-sm rounded bg-gray-100 text-gray-500 cursor-not-allowed';
      case 'denied':
        return 'w-full p-2 text-sm rounded bg-red-100 text-red-800 cursor-not-allowed';
      default:
        return 'w-full p-2 text-sm rounded bg-gray-100 text-gray-500 cursor-not-allowed';
    }
  };

  const getSlotText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Booked';
      case 'denied':
        return 'Denied';
      default:
        return 'Unavailable';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
      {/* Header */}
      <div className="grid grid-cols-6 gap-0 border-b border-gray-200">
        <div className="p-4 bg-gray-50 text-sm font-medium text-gray-600">Time</div>
        {weekDates.map((date, index) => (
          <div key={index} className="p-4 bg-gray-50 text-sm font-medium text-gray-600 text-center">
            {date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
          </div>
        ))}
      </div>

      {/* Time Slots */}
      {timeSlots.map((timeSlot, timeIndex) => (
        <div key={timeIndex} className="grid grid-cols-6 gap-0 border-b border-gray-100">
          <div className="p-3 text-sm text-gray-600 bg-gray-50">{timeSlot.displayTime}</div>
          {weekDates.map((date, dateIndex) => {
            const status = getSlotStatus(date, timeSlot.startTime);
            return (
              <div key={dateIndex} className="p-2">
                <div
                  className={getSlotClassName(status)}
                  onClick={() => handleSlotClick(date, timeSlot.startTime)}
                >
                  {getSlotText(status)}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Footer */}
      <div className="p-4 text-center text-gray-500 text-sm">
        <span>•••</span> Additional time slots continue through 5:00 PM
      </div>
    </div>
  );
}
