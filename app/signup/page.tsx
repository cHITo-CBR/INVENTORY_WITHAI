"use client";

import { useActionState, useState, Suspense } from "react";
import { registerUser } from "@/app/actions/auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Image from "next/image";

function SignupForm() {
  const [state, formAction, pending] = useActionState(registerUser, null);
  const [passwordError, setPasswordError] = useState("");
  const searchParams = useSearchParams();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    setPasswordError("");
    formAction(formData);
  };

  if (state?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F6] py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <Card className="w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 rounded-[24px] text-center p-6">
          <CardHeader className="space-y-4 flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-[#005914]" />
            <CardTitle className="text-2xl font-bold text-[#005914]">
              Registration Successful!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 font-medium">
              Waiting for admin approval. You will be able to log in once your account is active.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center mt-4">
            <Link href="/login" className="text-[#005914] hover:underline font-bold bg-[#E2EBE5] px-6 py-2.5 rounded-full">Return to Login</Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex py-10 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden items-start justify-center overflow-y-auto bg-[#F4F7F6]">
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#E2EBE5] to-transparent opacity-50 z-0 pointer-events-none" />
      
      <div className="w-full max-w-[420px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10 flex flex-col mt-4 md:mt-2 mb-10">
        <div className="px-8 pt-8 pb-8 flex-1">
          <div className="flex items-center gap-2 mb-8 font-bold text-[#005914] text-[15px]">
            <Image src="/logo.png" alt="Century Pacific Food" width={140} height={32} className="h-8 w-auto object-contain" priority />
          </div>

          <div className="mb-6">
            <h1 className="text-[26px] font-bold text-gray-900 tracking-tight mb-2">Join the Curation</h1>
            <p className="text-[#6B7280] text-[13px] font-medium leading-relaxed max-w-[280px]">
              Enter your details to manage your precision inventory.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {(state?.error || passwordError) && (
              <Alert variant="destructive" className="py-2.5 px-3 rounded-lg bg-red-50 border-red-100 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{state?.error || passwordError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-[12px] font-semibold text-gray-700">Full Name</Label>
              <Input id="fullName" name="fullName" type="text" placeholder="Alexander Paci" required className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#005914] px-4 shadow-sm" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[12px] font-semibold text-gray-700">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="curator@centurypaci.com" required className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#005914] px-4 shadow-sm" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-[12px] font-semibold text-gray-700">Phone</Label>
              <Input id="phone" name="phone" type="text" placeholder="+1234567890" className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#005914] px-4 shadow-sm" />
            </div>

            <div className="space-y-1.5 z-50 relative">
              <Label htmlFor="role" className="text-[12px] font-semibold text-gray-700">Role</Label>
              <Select name="role" required defaultValue="buyer">
                <SelectTrigger id="role" className="h-11 rounded-lg border-gray-300 focus:ring-[#005914] bg-white">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white">
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="salesman">Salesman</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[12px] font-semibold text-gray-700">Password</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#005914] px-4 shadow-sm text-xl tracking-widest placeholder:tracking-normal placeholder:text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-[12px] font-semibold text-gray-700">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#005914] px-4 shadow-sm text-xl tracking-widest placeholder:tracking-normal placeholder:text-sm" />
            </div>

            <Button type="submit" className="w-full h-12 rounded-full bg-[#005914] hover:bg-[#004a11] text-white font-medium text-[15px] shadow-md transition-all mt-4" disabled={pending}>
              {pending ? "Creating..." : "Create Account"}
            </Button>
          </form>

          <div className="text-center text-[13px] text-gray-600 font-medium my-8">
             Already have an account?{" "}
             <Link href="/login" className="text-[#005914] hover:underline font-bold">
               Log in
             </Link>
          </div>

          <p className="text-center text-[10px] text-gray-400 uppercase tracking-wide leading-relaxed px-4 mb-2">
            By creating an account, you agree to our <br/> 
            <Link href="#" className="underline">Privacy Policy</Link> and <Link href="#" className="underline">Terms of Service</Link>.
          </p>
        </div>

        <div className="bg-[#FAFAFA] px-8 py-5 border-t border-gray-100">
          <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-relaxed mb-3">
            © 2024 Century Pacific Food. Precision Curation.
          </p>
          <div className="flex gap-6 text-[10px] font-bold text-gray-400 tracking-wider">
            <Link href="#" className="hover:text-gray-600 transition-colors uppercase">Support</Link>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <Link href="#" className="hover:text-gray-600 transition-colors uppercase">System Status</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
