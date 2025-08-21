import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, RefreshCw, Calendar, Clock, Check, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Appointment } from "@shared/schema";

export default function AdminView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments', statusFilter],
    queryFn: () => api.getAppointments(statusFilter),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/appointments/stats'],
    queryFn: () => api.getStats(),
  });

  const { data: slots = [] } = useQuery({
    queryKey: ['/api/slots'],
    queryFn: () => api.getSlots(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'denied' }) =>
      api.updateAppointmentStatus(id, { status }),
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: variables.status === 'approved' 
          ? "Appointment approved successfully" 
          : "Appointment denied. Slot is now available for rebooking",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/slots'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'approved' });
  };

  const handleDeny = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'denied' });
  };

  const handleExportCSV = () => {
    const csvData = appointments.map(apt => {
      const slot = slots.find(s => s.id === apt.slotId);
      const date = slot ? new Date(slot.date).toLocaleDateString() : 'Unknown';
      const time = slot ? `${slot.startTime} - ${slot.endTime}` : 'Unknown';
      
      return {
        'Date': date,
        'Time': time,
        'Customer Name': apt.customerName,
        'Customer Email': apt.customerEmail,
        'Reason': apt.reason,
        'Status': apt.status,
        'Booked At': new Date(apt.bookedAt).toLocaleString(),
      };
    });

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appointments.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    queryClient.invalidateQueries({ queryKey: ['/api/appointments/stats'] });
  };

  // Filter appointments based on search query
  const filteredAppointments = appointments.filter(apt => {
    if (!searchQuery) return true;
    const searchTerm = searchQuery.toLowerCase();
    return (
      apt.customerName.toLowerCase().includes(searchTerm) ||
      apt.customerEmail.toLowerCase().includes(searchTerm) ||
      apt.reason.toLowerCase().includes(searchTerm)
    );
  });

  const formatAppointmentDateTime = (appointment: Appointment) => {
    const slot = slots.find(s => s.id === appointment.slotId);
    if (!slot) return { dateStr: 'Unknown', timeStr: 'Unknown' };

    const date = new Date(slot.date);
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    const startTime = new Date(2024, 0, 1, parseInt(slot.startTime.split(':')[0]), parseInt(slot.startTime.split(':')[1]));
    const endTime = new Date(2024, 0, 1, parseInt(slot.endTime.split(':')[0]), parseInt(slot.endTime.split(':')[1]));
    
    const timeStr = `${startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    
    return { dateStr, timeStr };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800';
      case 'denied':
        return 'inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800';
      default:
        return 'inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Manage appointments and approve bookings</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button 
            onClick={handleExportCSV}
            className="flex items-center bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={handleRefresh}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Slots</p>
              <p className="text-2xl font-semibold text-gray-800">
                {statsLoading ? '...' : stats?.totalSlots || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-800">
                {statsLoading ? '...' : stats?.pending || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-semibold text-gray-800">
                {statsLoading ? '...' : stats?.approved || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <X className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Denied</p>
              <p className="text-2xl font-semibold text-gray-800">
                {statsLoading ? '...' : stats?.denied || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Appointments</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name, email, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Appointment Requests</h3>
        </div>
        
        {appointmentsLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => {
                    const { dateStr, timeStr } = formatAppointmentDateTime(appointment);
                    return (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-800">{dateStr}</div>
                          <div className="text-sm text-gray-600">{timeStr}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-800">{appointment.customerName}</div>
                          <div className="text-sm text-gray-600">{appointment.customerEmail}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800 max-w-xs truncate" title={appointment.reason}>
                            {appointment.reason}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(appointment.status)}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {appointment.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApprove(appointment.id)}
                                disabled={updateStatusMutation.isPending}
                                className="text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                              >
                                <Check className="h-4 w-4 inline mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleDeny(appointment.id)}
                                disabled={updateStatusMutation.isPending}
                                className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                              >
                                <X className="h-4 w-4 inline mr-1" />
                                Deny
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-400 text-sm capitalize">{appointment.status}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">1</span> to{' '}
            <span className="font-medium">{filteredAppointments.length}</span> of{' '}
            <span className="font-medium">{filteredAppointments.length}</span> appointments
          </div>
        </div>
      </div>
    </div>
  );
}
