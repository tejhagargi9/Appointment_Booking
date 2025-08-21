import { useState } from "react";
import { Calendar, Users } from "lucide-react";
import CustomerView from "@/components/customer-view";
import AdminView from "@/components/admin-view";

export default function Home() {
  const [currentView, setCurrentView] = useState<'customer' | 'admin'>('customer');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="text-blue-600 h-8 w-8 mr-3" />
              <h1 className="text-xl font-semibold text-gray-800">AppointmentBook</h1>
            </div>
            <nav className="flex space-x-1">
              <button
                onClick={() => setCurrentView('customer')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'customer'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Customer View
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Admin Panel
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {currentView === 'customer' ? <CustomerView /> : <AdminView />}
    </div>
  );
}
