"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, CreditCard } from "lucide-react";
import { toast } from "sonner";
import JobDescriptionInput from "@/components/forms/JobDescriptionInput";
import CategorySelect from "@/components/forms/CategorySelect";
import BudgetSlider from "@/components/forms/BudgetSlider";
import DateTimePicker from "@/components/forms/DateTimePicker";
import ImageUploader from "@/components/forms/ImageUploader";
import { trpc } from "@/lib/trpc/client";

const postJobSchema = z.object({
  title: z.string().min(5, "Title must be 5+ chars"),
  description: z.string().min(20, "Description must be 20+ chars"),
  category: z.string().min(1, "Please select a category"),
  budget: z.number().min(10, "Budget must be at least RM 10"),
  location: z.string().min(5, "Location must be 5+ chars"),
  preferredDate: z.date().optional(),
});

type PostJobForm = z.infer<typeof postJobSchema>;

export default function PostJobPage() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [suggestedCategory, setSuggestedCategory] = useState("");
  const [suggestedBudget, setSuggestedBudget] = useState(50);

  const createJobMutation = trpc.jobs.create.useMutation({
    onSuccess: () => {
      toast.success("Job posted successfully! Technicians will start bidding soon.");
      router.push("/dashboard/customer/jobs");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create job");
    },
  });

  const form = useForm<PostJobForm>({
    resolver: zodResolver(postJobSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      budget: 50,
      location: "",
    },
  });

  const onSubmit = async (data: PostJobForm) => {
    createJobMutation.mutate({
      title: data.title,
      description: data.description,
      category: data.category,
      budget: data.budget * 100, // Convert to cents
      location: {
        lat: 0, // Would be populated by geocoding in production
        lng: 0,
        address: data.location,
      },
      images: [], // TODO: Upload images first
      scheduledTime: data.preferredDate?.toISOString(),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Post a New Job</h1>
        <p className="text-muted-foreground mt-2">
          Describe your job and connect with skilled technicians
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Provide detailed information about the work needed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                placeholder="e.g., Fix leaking kitchen faucet"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <JobDescriptionInput
              value={form.watch("description")}
              onChange={(value) => form.setValue("description", value)}
              onSuggestion={(category, budget) => {
                setSuggestedCategory(category);
                setSuggestedBudget(budget);
                if (!form.watch("category")) form.setValue("category", category);
                if (form.watch("budget") === 50) form.setValue("budget", budget);
              }}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CategorySelect
                value={form.watch("category")}
                onChange={(value) => form.setValue("category", value)}
                suggestedCategory={suggestedCategory}
              />
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
              )}

              <BudgetSlider
                value={form.watch("budget")}
                onChange={(value) => form.setValue("budget", value)}
                suggestedBudget={suggestedBudget}
              />
              {form.formState.errors.budget && (
                <p className="text-sm text-destructive">{form.formState.errors.budget.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="e.g., Kuala Lumpur, Malaysia"
                  className="pl-9"
                  {...form.register("location")}
                />
              </div>
              {form.formState.errors.location && (
                <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Preferred Date (Optional)</Label>
              <DateTimePicker
                value={form.watch("preferredDate")}
                onChange={(date) => form.setValue("preferredDate", date)}
                placeholder="Select preferred date"
              />
            </div>

            <div className="grid gap-2">
              <Label>Photos (Optional)</Label>
              <ImageUploader
                images={images}
                onChange={setImages}
                maxImages={5}
              />
            </div>

            <Button type="submit" className="w-full" disabled={createJobMutation.isPending}>
              {createJobMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CreditCard className="mr-2 h-4 w-4" />
              Post Job & Pay RM {form.watch("budget")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
