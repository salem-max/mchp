'use client';

import { Calendar, Clock, MapPin } from 'lucide-react';

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold">My Schedule</h1>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="p-8 rounded-2xl bg-card border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Upcoming Jobs</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center font-semibold text-blue-600">
                14
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">AC Service - Petaling Jaya</h3>
                <p className="text-sm text-muted-foreground">Ahmed Hassan</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>2:00 PM - 4:00 PM</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>Jalan Ampang</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-card border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold">Calendar</h2>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className={`p-3 rounded-lg text-sm font-medium h-16 flex items-center justify-center ${
                i % 7 === 3 ? 'bg-blue-100 text-blue-800' : 'text-muted-foreground hover:bg-gray-100 cursor-pointer'
              }`}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

