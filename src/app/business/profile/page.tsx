"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import useAuthStore from "@/store/authStore";
import { updateMyProfile } from "@/services/userService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("A valid email is required."),
  // We can add a password change form here later
});
type ProfileFormData = z.infer<typeof profileSchema>;

export default function BusinessProfilePage() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "" },
  });

  // Populate the form with the user's current data
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "", // Assuming business users have an email
      });
    }
  }, [user, form]);

  const onProfileSubmit = (data: ProfileFormData) => {
    setLoading(true);
    toast.promise(updateMyProfile(data), {
      loading: "Updating profile...",
      success: (res) => {
        setUser(res.data);
        setLoading(false);
        return "Profile updated successfully!";
      },
      error: (err) => {
        setLoading(false);
        return err.response?.data?.message || "Failed to update profile.";
      },
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-[#4a0e0e]">Account Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-[#4a0e0e]">Personal Information</CardTitle>
          <CardDescription>
            Manage your login details and personal name.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Login Email</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}