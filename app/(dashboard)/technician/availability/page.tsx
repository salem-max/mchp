'use client';

import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function AvailabilityPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold">Availability</h1>
      </div>

      <div className="p-8 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-emerald-800 mb-2">Available Now</h2>
            <p className="text-emerald-700">You&apos;re currently available to receive job requests</p>
          </div>
          <Switch checked={true} disabled className="data-[state=checked]:bg-emerald-600" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-card border">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Schedule
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-7">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center p-3 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                <div className="font-semibold text-sm">{day}</div>
                <div className="space-x-1 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full inline-block"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full inline-block"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full inline-block"></div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">9AM - 6PM</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border">
          <h2 className="text-xl font-bold mb-6">Service Areas</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span>Kuala Lumpur (Within 20km)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <XCircle className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <span>Petaling Jaya</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

