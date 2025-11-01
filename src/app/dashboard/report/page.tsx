"use client";

import { useState } from "react";
import { useForm, SubmitHandler, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReportFormData, reportSchema } from "@/types";
import { toast } from "sonner";
import { submitReport } from "@/services/reportService";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import MapComponent from "@/components/map/Map"; 

export default function ReportPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: "",
      description: "",
      reportType: "UNSAFE",
    },
  });

  const onSubmit: SubmitHandler<ReportFormData> = async (data) => {
    if (!data.latitude || !data.longitude) {
      toast.error("Please drag the pin on the map to set a location.");
      return;
    }
    setLoading(true);
    try {
      await submitReport(data);
      toast.success("Report Submitted", {
        description: "An admin will review your report shortly. Thank you!",
      });
      router.push("/dashboard"); // Go back to the dashboard
      form.reset();
    } catch (error) {
      toast.error("Failed to submit report.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = (errors: FieldErrors<ReportFormData>) => {
    console.error("Form validation failed:", errors);
    if (errors.title) {
      toast.error("Validation Error", { description: errors.title.message });
    } else {
      toast.error("Validation Error", { description: "Please check all fields." });
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Submit a Safety Report</CardTitle>
          <CardDescription>
            Help other travelers by reporting a safe or unsafe area. Drag the red pin to the exact location of the incident.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
              
              <div className="h-80 w-full rounded-md overflow-hidden border">
                <MapComponent
                  pickerMode={true}
                  onMarkerDragEnd={(coords) => {
                    form.setValue('latitude', Number(coords.lat));
                    form.setValue('longitude', Number(coords.lng));
                    toast.success("Location Set!");
                  }}
                />
              </div>
              
              <FormField
                name="title"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="e.g., 'Unsafe street crossing' or 'Helpful Police'" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="reportType"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="UNSAFE">Unsafe Area</SelectItem>
                          <SelectItem value="SAFE">Safe Spot</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="Describe what you saw..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Report
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};