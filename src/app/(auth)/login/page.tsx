"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import axios from "axios";

import { loginWithDigitalId, loginAdmin } from "@/services/authService";
import useAuthStore from "@/store/authStore";

import {
  LoginFormData,
  loginSchema,
  AdminLoginFormData,
  adminLoginSchema,
} from "@/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  User,
  UserCheck,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import AnimatedLoader from "@/components/ui/animated-loader";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [loadingTraveler, setLoadingTraveler] = useState(false);
  const [loadingAuthority, setLoadingAuthority] = useState(false);
  const [showTravelerPassword, setShowTravelerPassword] = useState(false);
  const [showAuthorityPassword, setShowAuthorityPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("traveler");

  const travelerForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { uniqueDigitalId: "", password: "" },
  });

  const authorityForm = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onTravelerSubmit = async (data: LoginFormData) => {
    try {
      setLoadingTraveler(true);
      const response = await loginWithDigitalId(data);
      setAuth(response.data.token, response.data.user);
      toast.success("Login Successful!", {
        description: "Redirecting to your dashboard...",
      });
      router.push("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Login failed.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoadingTraveler(false);
    }
  };

  const onAuthoritySubmit = async (data: AdminLoginFormData) => {
    try {
      setLoadingAuthority(true);
      const response = await loginAdmin(data);
      const user = response.data.user;
      setAuth(response.data.token, user);

      if (user.role === "ADMIN") {
        toast.success("Access Granted", { description: "Redirecting to the control panel..." });
        router.push("/admin/");
      } else if (user.role === "BUSINESS") {
        toast.success("Login Successful!", { description: "Redirecting to your business portal..." });
        router.push("/business/");
      } else {
        toast.error("Access Denied", { description: "This account does not have a valid role." });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Login failed.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoadingAuthority(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-300 to-orange-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center justify-center gap-2 mb-4">
            <Logo size="md" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Welcome Back</CardTitle>
          <CardDescription className="text-slate-600">Select your login method</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue="traveler"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="traveler" >
                <User className="w-4 h-4 mr-2 " />
                Traveler
              </TabsTrigger>
              <TabsTrigger value="authority">
                <UserCheck className="w-4 h-4 mr-2 " />
                Business / Authority
              </TabsTrigger>
            </TabsList>

            {/* --- Traveler Login Form --- */}
            <TabsContent value="traveler">
              <Form {...travelerForm}>
                <form
                  onSubmit={travelerForm.handleSubmit(onTravelerSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    name="uniqueDigitalId"
                    control={travelerForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Digital Trip ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your trip ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="password"
                    control={travelerForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showTravelerPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                              onClick={() =>
                                setShowTravelerPassword(!showTravelerPassword)
                              }
                            >
                              {showTravelerPassword ? <EyeOff /> : <Eye />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <>
                    {loadingTraveler && <AnimatedLoader message="Logging into your Dashboard" />}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-xl hover:shadow-amber-500/50 transition-all duration-300"
                      disabled={loadingTraveler}
                    >
                      Login to Dashboard
                    </Button>
                  </>
                </form>
              </Form>
            </TabsContent>

            {/* --- Authority Login Form --- */}
            <TabsContent value="authority">
              <Form {...authorityForm}>
                <form
                  onSubmit={authorityForm.handleSubmit(onAuthoritySubmit)}
                  className="space-y-6"
                >
                  <FormField
                    name="email"
                    control={authorityForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Official ID / Email</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="official@dept.gov"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="password"
                    control={authorityForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showAuthorityPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                              onClick={() =>
                                setShowAuthorityPassword(!showAuthorityPassword)
                              }
                            >
                              {showAuthorityPassword ? <EyeOff /> : <Eye />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <>
                    {loadingAuthority && (
                      <AnimatedLoader 
                        message={
                          authorityForm.getValues("email")?.includes("admin") 
                            ? "Accessing Admin Control Panel" 
                            : "Accessing Business Portal"
                        } 
                      />
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loadingAuthority}
                    >
                      Sign In
                    </Button>
                  </>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-6">
            {activeTab === "traveler" ? (
              <p className="text-sm text-muted-foreground">
                Starting a new trip?{" "}
                <Link
                  href="/register"
                  className="text-primary hover:underline font-semibold"
                >
                  Register here
                </Link>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Own a business?{" "}
                <Link
                  href="/register"
                  className="text-primary hover:underline font-semibold"
                >
                  Register as a Verified Business
                </Link>
              </p>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline mt-2"
            >
              <ArrowLeft className="h-3 w-3 " />
              Back To Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
