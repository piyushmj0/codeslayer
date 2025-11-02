"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import axios from "axios";
import { ArrowLeft, Eye, EyeOff, User, Building } from "lucide-react";
import AnimatedLoader from "@/components/ui/animated-loader";

import { registerAndCreateTrip, registerBusiness } from "@/services/authService";
import { RegisterFormData, registerSchema, BusinessRegisterFormData, businessRegisterSchema } from "@/types";
import useAuthStore from "@/store/authStore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "@/components/Logo";


const TravelerForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setNewDigitalId = useAuthStore((state) => state.setNewDigitalId);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      password: "",
      phoneNumber: "",
      governmentIdType: "AADHAAR",
      idValue: "",
      startDate: "",
      endDate: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const response = await registerAndCreateTrip(data);
      const digitalId = response.data.uniqueDigitalId;
      setNewDigitalId(digitalId);
      toast.success("Trip Registered Successfully!");
      router.push("/register/success");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(
          error.response.data.message || "Registration failed."
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="phoneNumber"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number</FormLabel>
                <FormControl>
                  <Input placeholder="+91 9876543210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Create Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t border-border pt-3">
          <h3 className="text-md font-semibold text-primary mb-2">
            Identity Verification
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              name="governmentIdType"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ID Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AADHAAR">Aadhaar</SelectItem>
                      <SelectItem value="PASSPORT">Passport</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="idValue"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Official identification number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <h3 className="text-md font-semibold text-primary mb-2">
            Trip Duration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              name="startDate"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="endDate"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <>
          {loading && <AnimatedLoader message="Generating Your Secure Trip ID" />}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-xl hover:shadow-amber-500/50 transition-all duration-300" 
            disabled={loading}
          >
            Generate Secure Trip ID
          </Button>
        </>
      </form>
    </Form>
  );
};




const BusinessForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<BusinessRegisterFormData>({
    resolver: zodResolver(businessRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (data: BusinessRegisterFormData) => {
    setLoading(true);
    try {
      await registerBusiness(data);
      toast.success("Business Account Created!", {
        description: "Please log in to manage your businesses.",
      });
      router.push("/login");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(
          error.response.data.message || "Registration failed."
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Login Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@company.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="phoneNumber"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+91..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Create Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <>
          {loading && <AnimatedLoader message="Creating Your Business Account" />}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-xl hover:shadow-amber-500/50 transition-all duration-300" 
            disabled={loading}
          >
            Create Business Account
          </Button>
        </>
      </form>
    </Form>
  );
};


export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-300 to-orange-200 p-4">
      <Card className="w-full max-w-lg border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Create Your Account</CardTitle>
          <CardDescription className="text-slate-600">
            Select your account type to get started.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="traveler" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="traveler" >
                <User className="w-4 h-4 mr-2 " /> Traveler
              </TabsTrigger>
              <TabsTrigger value="business" >
                <Building className="w-4 h-4 mr-2 " /> Business
              </TabsTrigger>
            </TabsList>

            <TabsContent value="traveler">
              <TravelerForm />
            </TabsContent>
            <TabsContent value="business">
              <BusinessForm />
            </TabsContent>
          </Tabs>

          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Login here
              </Link>
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline mt-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Back To Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
