"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { format, addDays, isBefore, startOfDay } from "date-fns";

interface JobSchedulingProps {
  jobId: string;
  technicianId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
  booked?: boolean;
}

export default function JobScheduling({
  jobId,
  technicianId,
  onSuccess,
  onCancel
}: JobSchedulingProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get available slots
  const { data: slots, isLoading: slotsLoading } = trpc.job.getAvailableSlots.useQuery(
    {
      jobId,
      technicianId: technicianId!,
      date: selectedDate
    },
    { enabled: !!selectedDate && !!technicianId }
  );

  // Schedule job mutation
  const scheduleJob = trpc.job.scheduleJob.useMutation({
    onSuccess: () => {
      toast.success("Job scheduled successfully!");
      setSelectedDate("");
      setSelectedTime("");
      setNotes("");
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error("Failed to schedule job");
    }
  });

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time");
      return;
    }

    setIsSubmitting(true);
    try {
      await scheduleJob.mutateAsync({
        jobId,
        technicianId: technicianId!,
        date: selectedDate,
        time: selectedTime,
        notes: notes.trim() || undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate next 14 days
  const nextDays = Array.from({ length: 14 }, (_, i) =>
    addDays(new Date(), i)
  ).filter(date => !isBefore(date, startOfDay(new Date())));

  // Time slots
  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Job
          </CardTitle>
          <CardDescription>
            Choose a convenient time for the technician to complete the job
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSchedule} className="space-y-6">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="date">Preferred Date *</Label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a date" />
                </SelectTrigger>
                <SelectContent>
                  {nextDays.map((date) => (
                    <SelectItem
                      key={date.toISOString()}
                      value={date.toISOString().split("T")[0]}
                    >
                      {format(date, "EEEE, MMMM d, yyyy")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-2">
                <Label>Preferred Time Slot *</Label>
                {slotsLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin">
                      <Clock className="h-5 w-5" />
                    </div>
                  </div>
                ) : slots && slots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-2 text-sm border rounded transition-colors ${
                          selectedTime === slot.time
                            ? "bg-primary text-primary-foreground border-primary"
                            : slot.available
                            ? "hover:bg-muted border-gray-200"
                            : "opacity-50 cursor-not-allowed bg-gray-50"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No available time slots for this date. Please choose a different date.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="e.g., Please call before arriving, gate code is 1234"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={250}
              />
              <p className="text-xs text-muted-foreground text-right">
                {notes.length}/250
              </p>
            </div>

            {/* Info Alert */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                The technician will receive this scheduling request and can accept or suggest alternative times.
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || !selectedDate || !selectedTime}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                {isSubmitting ? "Scheduling..." : "Schedule Job"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
