import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import WeeklyCalendar from "./weekly-calendar";
import BookingModal from "./booking-modal";
import type { TimeSlot } from "@shared/schema";

export default function CustomerView() {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['/api/slots'],
    queryFn: () => api.getSlots(),
  });

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleCloseModal = () => {
    setShowBookingModal(false);
    setSelectedSlot(null);
  };

  // Get current week dates
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  const weekDates = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDates.push(date);
  }

  const formatDateRange = () => {
    const start = weekDates[0];
    const end = weekDates[4];
    return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { day: 'numeric' })}, ${start.getFullYear()}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Book Your Appointment</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose from available time slots throughout the week. All appointments are subject to approval.
        </p>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-8 bg-white rounded-lg p-4 shadow-sm">
        <button className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous Week
        </button>
        <h3 className="text-lg font-medium text-gray-800">{formatDateRange()}</h3>
        <button className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
          Next Week
          <ChevronRight className="h-4 w-4 ml-2" />
        </button>
      </div>

      {/* Weekly Calendar */}
      <WeeklyCalendar 
        slots={slots} 
        weekDates={weekDates}
        onSlotSelect={handleSlotSelect}
      />

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
        <h4 className="font-medium text-gray-800 mb-4">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded border-2 border-dashed border-blue-600 mr-2"></div>
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-gray-100 mr-2"></div>
            <span className="text-sm text-gray-600">Booked</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-yellow-100 mr-2"></div>
            <span className="text-sm text-gray-600">Pending Approval</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-red-100 mr-2"></div>
            <span className="text-sm text-gray-600">Denied</span>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && (
        <BookingModal 
          slot={selectedSlot}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
