"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MapPin,
  DollarSign,
  Calendar,
  Wrench,
  Upload,
  X,
  AlertCircle,
  CheckCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";

const jobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000, "Description must be less than 1000 characters"),
  category: z.string().min(1, "Please select a category"),
  location: z.object({
    address: z.string().min(5, "Please enter a valid address"),
    coordinates: z.object({
      lat: z.number().optional(),
      lng: z.number().optional(),
    }).optional(),
  }),
  budget: z.object({
    min: z.number().min(1, "Minimum budget must be at least $1"),
    max: z.number().min(1, "Maximum budget must be at least $1"),
    currency: z.string().default("USD"),
  }).refine(data => data.max >= data.min, {
    message: "Maximum budget must be greater than or equal to minimum budget",
    path: ["max"],
  }),
  urgency: z.enum(["low", "medium", "high", "emergency"]),
  scheduledDate: z.date().optional(),
  skills: z.array(z.string()).min(1, "Please select at least one required skill"),
  attachments: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

interface JobFormProps {
  initialData?: Partial<JobFormData>;
  onSuccess?: (jobId: string) => void;
  onCancel?: () => void;
}

const categories = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Carpentry",
  "Painting",
  "Landscaping",
  "Cleaning",
  "Appliance Repair",
  "Roofing",
  "Flooring",
  "Other"
];

const skills = [
  "Basic Tools",
  "Power Tools",
  "Electrical Work",
  "Plumbing",
  "HVAC Systems",
  "Carpentry",
  "Painting",
  "Landscaping",
  "Cleaning",
  "Appliance Repair",
  "Roofing",
  "Flooring",
  "Emergency Response",
  "Safety Certified",
  "Licensed",
  "Insured"
];

const urgencies = [
  { value: "low", label: "Low - Within a week", color: "bg-blue-100 text-blue-800" },
  { value: "medium", label: "Medium - Within 2-3 days", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High - Today or tomorrow", color: "bg-orange-100 text-orange-800" },
  { value: "emergency", label: "Emergency - ASAP", color: "bg-red-100 text-red-800" },
];

export default function JobForm({ initialData, onSuccess, onCancel }: JobFormProps) {
  const router = useRouter();
  const [attachments, setAttachments] = useState<string[]>(initialData?.attachments || []);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialData?.skills || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createJob = trpc.customer.createJob.useMutation({
    onSuccess: (data: any) => {
      toast.success("Job posted successfully!");
      if (onSuccess) {
        onSuccess(data.jobId);
      } else {
        router.push(`/dashboard/customer/jobs/${data.jobId}`);
      }
    },
    onError: (error: any) => {
      toast.error("Failed to post job");
      console.error("Job creation error:", error);
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      location: {
        address: initialData?.location?.address || "",
        coordinates: initialData?.location?.coordinates,
      },
      budget: {
        min: initialData?.budget?.min || 0,
        max: initialData?.budget?.max || 0,
        currency: initialData?.budget?.currency || "USD",
      },
      urgency: initialData?.urgency || "medium",
      scheduledDate: initialData?.scheduledDate,
      skills: initialData?.skills || [],
      attachments: initialData?.attachments || [],
      notes: initialData?.notes || "",
    }
  });

  const watchedBudgetMin = watch("budget.min");
  const watchedBudgetMax = watch("budget.max");

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);
    try {
      await createJob.mutateAsync({
        ...data,
        skills: selectedSkills,
        attachments,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // In a real app, you'd upload to a cloud storage service
    // For now, we'll just create object URLs
    const newAttachments = Array.from(files).map(file => URL.createObjectURL(file));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Post a New Job</h1>
          <p className="text-muted-foreground">
            Fill out the details below to find the right technician for your job
          </p>
        </div>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Provide the essential details about your job
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Fix leaking kitchen faucet"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the job in detail. Include what needs to be done, any specific requirements, and any relevant background information."
                rows={4}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
            <CardDescription>
              Where does the job need to be done?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="Enter the full address"
                {...register("location.address")}
              />
              {errors.location?.address && (
                <p className="text-sm text-red-600">{errors.location.address.message}</p>
              )}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your address will only be shared with technicians who accept your job.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget
            </CardTitle>
            <CardDescription>
              How much are you willing to pay for this job?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budgetMin">Minimum ($)</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  placeholder="0"
                  {...register("budget.min", { valueAsNumber: true })}
                />
                {errors.budget?.min && (
                  <p className="text-sm text-red-600">{errors.budget.min.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetMax">Maximum ($)</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  placeholder="0"
                  {...register("budget.max", { valueAsNumber: true })}
                />
                {errors.budget?.max && (
                  <p className="text-sm text-red-600">{errors.budget.max.message}</p>
                )}
              </div>
            </div>

            {watchedBudgetMin && watchedBudgetMax && watchedBudgetMax < watchedBudgetMin && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Maximum budget must be greater than minimum budget
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Urgency & Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline
            </CardTitle>
            <CardDescription>
              When do you need this job completed?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Urgency Level *</Label>
              <Select onValueChange={(value: any) => setValue("urgency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  {urgencies.map((urgency) => (
                    <SelectItem key={urgency.value} value={urgency.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${urgency.color.split(' ')[0]}`} />
                        {urgency.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.urgency && (
                <p className="text-sm text-red-600">{errors.urgency.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Preferred Date (Optional)</Label>
              <Input
                id="scheduledDate"
                type="date"
                {...register("scheduledDate", { valueAsDate: true })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Required Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Required Skills
            </CardTitle>
            <CardDescription>
              Select the skills needed for this job
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSkillToggle(skill)}
                  className={`p-2 text-sm border rounded-lg transition-colors ${
                    selectedSkills.includes(skill)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            {selectedSkills.length === 0 && (
              <p className="text-sm text-red-600 mt-2">Please select at least one skill</p>
            )}
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Attachments
            </CardTitle>
            <CardDescription>
              Upload photos or documents related to the job (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files:</Label>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((attachment, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <span className="truncate max-w-32">
                        File {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>
              Any additional information or special instructions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Special requirements, access instructions, or anything else the technician should know..."
              rows={3}
              {...register("notes")}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || selectedSkills.length === 0}
            className="min-w-32"
          >
            {isSubmitting ? (
              "Posting..."
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Post Job
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}