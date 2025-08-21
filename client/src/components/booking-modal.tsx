import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { TimeSlot } from "@shared/schema";

interface BookingModalProps {
  slot: TimeSlot;
  onClose: () => void;
}

export default function BookingModal({ slot, onClose }: BookingModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bookingMutation = useMutation({
    mutationFn: (data: { slotId: string; customerName: string; customerEmail: string; reason: string }) =>
      api.createAppointment(data),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Appointment request submitted! You will receive confirmation once approved.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/slots'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.reason.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    bookingMutation.mutate({
      slotId: slot.id,
      customerName: formData.name.trim(),
      customerEmail: formData.email.trim(),
      reason: formData.reason.trim(),
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatSlotDateTime = (slot: TimeSlot) => {
    const date = new Date(slot.date);
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const startTime = new Date(2024, 0, 1, parseInt(slot.startTime.split(':')[0]), parseInt(slot.startTime.split(':')[1]));
    const endTime = new Date(2024, 0, 1, parseInt(slot.endTime.split(':')[0]), parseInt(slot.endTime.split(':')[1]));
    
    const timeStr = `${startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    
    return { dateStr, timeStr };
  };

  const { dateStr, timeStr } = formatSlotDateTime(slot);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Book Appointment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">{dateStr}</div>
          <div className="text-sm text-gray-600">{timeStr}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Full Name *
            </Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email address"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
              Reason for Appointment *
            </Label>
            <Textarea
              id="reason"
              required
              rows={3}
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Please describe the purpose of your appointment"
              className="mt-1"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={bookingMutation.isPending}
              className="flex-1"
            >
              {bookingMutation.isPending ? 'Booking...' : 'Book Appointment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
