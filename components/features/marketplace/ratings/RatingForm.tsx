"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";

interface RatingFormProps {
  jobId: string;
  technicianId: string;
  onSuccess?: () => void;
}

export default function RatingForm({
  jobId,
  technicianId,
  onSuccess
}: RatingFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReview = trpc.customer.submitReview.useMutation({
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      setRating(0);
      setComment("");
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error("Failed to submit review");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReview.mutateAsync({
        jobId,
        technicianId,
        rating,
        comment: comment.trim() || undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Rate This Technician</CardTitle>
          <CardDescription>
            Share your experience to help other customers make informed decisions
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div className="space-y-2">
              <Label className="text-base">Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground">
                  {["Poor", "Fair", "Good", "Very Good", "Excellent"][rating - 1]}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">Your Feedback (Optional)</Label>
              <Textarea
                id="comment"
                placeholder="Tell other customers about your experience. What did the technician do well?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-muted-foreground text-right">
                {comment.length}/500
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isSubmitting || rating === 0}
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
