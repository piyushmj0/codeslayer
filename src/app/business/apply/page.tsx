"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { applyForBusiness } from "@/services/businessService";
import { BusinessApplyFormData, businessApplySchema } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import MapComponent from "@/components/map/Map"; // 1. Import the map component

export default function ApplyBusinessPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<BusinessApplyFormData>({
    resolver: zodResolver(businessApplySchema),
    defaultValues: { name: "", category: "", address: "", phone: "" },
  });

  const onSubmit = async (data: BusinessApplyFormData) => {
    // 3. Check if location has been set
    if (!data.latitude || !data.longitude) {
      toast.error(
        "Please drag the pin on the map to set your business location."
      );
      return;
    }

    setLoading(true);
    try {
      await applyForBusiness(data);
      toast.success("Application Submitted!", {
        description: "Your application is now pending review.",
      });
      router.push("/business/");
    } catch (error) {
      toast.error("Failed to submit application.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/business/">
            <ArrowLeft className="mr-2 h-4 w-4 text-[#4a0e0e]" />
            Back to Business Dashboard
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-[#4a0e0e]">New Business Application</CardTitle>
          <CardDescription>
            Fill out the details of your business for verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="The Grand Hotel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="category"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Hotel, Restaurant..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="address"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Park Avenue, New Delhi"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="phone"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+91..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2 pt-4 border-t">
                <FormLabel>Set Business Location</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Drag the pin to your business&apos;s exact location.
                </p>
                <div className="h-64 w-full rounded-md overflow-hidden border">
                  <MapComponent
                    pickerMode={true}
                    onMarkerDragEnd={(coords) => {
                      form.setValue("latitude", coords.lat);
                      form.setValue("longitude", coords.lng);
                      toast.success("Location Set!");
                    }}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit for Verification"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}