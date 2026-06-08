"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Calendar,
  Briefcase,
  Award,
  MessageSquare,
  Share2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";

interface TechnicianDetailProps {
  technicianId: string;
}

export default function TechnicianDetail({ technicianId }: TechnicianDetailProps) {
  const router = useRouter();
  const [messaging, setMessaging] = useState(false);

  // Get technician details
  const { data: technician, isLoading, error } = trpc.technician.profile.useQuery({
    technicianId
  });

  // Get technician reviews
  const { data: reviews } = trpc.technician.reviews.useQuery({
    technicianId
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !technician) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-medium mb-2">Technician Not Found</h3>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const averageRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar className="h-32 w-32 shrink-0">
              <AvatarImage src={technician.avatar} />
              <AvatarFallback className="text-3xl">
                {technician.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{technician.name}</h1>
                  {technician.verified && (
                    <CheckCircle className="h-6 w-6 text-blue-500" />
                  )}
                </div>
                <p className="text-muted-foreground">{technician.bio || "Professional service provider"}</p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>
                    <strong>{averageRating}</strong> ({reviews?.length || 0} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span><strong>{technician.completedJobs || 0}</strong> completed jobs</span>
                </div>

                {technician.hourlyRate && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">RM {technician.hourlyRate}/hour</span>
                  </div>
                )}

                {technician.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{technician.location}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Profile
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="skills" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* Skills Tab */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Professional Skills</CardTitle>
              <CardDescription>
                Services and expertise offered by this technician
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {technician.skills?.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium mb-2">Status</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        technician.isAvailable ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <span>
                      {technician.isAvailable ? "Available" : "Currently Busy"}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Response Time</p>
                  <span className="text-sm text-muted-foreground">
                    {technician.responseTime || "Within 2 hours"}
                  </span>
                </div>
              </div>

              {technician.workingHours && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium mb-2">Working Hours</p>
                    <p className="text-sm text-muted-foreground">
                      {technician.workingHours}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <div className="space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={review.customerAvatar} />
                        <AvatarFallback>
                          {review.customerName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{review.customerName}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {format(new Date(review.createdAt), "MMMM d, yyyy")}
                        </p>
                        <p className="text-sm">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No reviews yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Contact Information */}
      {(technician.email || technician.phone) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {technician.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <a href={`mailto:${technician.email}`} className="hover:underline">
                  {technician.email}
                </a>
              </div>
            )}
            {technician.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <a href={`tel:${technician.phone}`} className="hover:underline">
                  {technician.phone}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
