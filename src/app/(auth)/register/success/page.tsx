"use client";

import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";

export default function RegisterSuccessPage() {
  const router = useRouter();
  const { newDigitalId, setNewDigitalId } = useAuthStore();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!newDigitalId && !isNavigating) {
      router.replace('/register');
    }
  }, [newDigitalId, isNavigating, router]);

  const handleCopy = () => {
    if (newDigitalId) {
      navigator.clipboard.writeText(newDigitalId).then(() => {
        toast.success("Copied to clipboard!");
      }).catch(err => {
        console.error('Failed to copy ID: ', err);
        toast.error("Could not copy ID automatically.", {
          description: "Please select the ID and copy it manually."
        });
      });
    }
  };
  
  const handleProceedToLogin = () => {
    setIsNavigating(true);
    setNewDigitalId(null);
    router.push('/login');
  };

  if (!newDigitalId) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-300 to-orange-200">
      <Card className="w-full max-w-md text-center p-4">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="mt-4 text-2xl text-[#3D1212]">Registration Successful!</CardTitle>
          <CardDescription>
            Please copy and save your Unique Digital Trip ID. You will need it to log in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-slate-100 border-dashed border-2 border-slate-300 rounded-lg">
            <p className="text-sm text-muted-foreground">Your Digital Trip ID</p>
            <p className="text-lg font-mono break-all font-semibold select-all">{newDigitalId}</p>
          </div>
          <Button onClick={handleCopy} variant="outline" className="w-full text-[#3D1212]">
            <Copy className="mr-2 h-4 w-4 text-[#3D1212]" />
            Copy ID
          </Button>
          <Button onClick={handleProceedToLogin} className="w-full">
            Proceed to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}