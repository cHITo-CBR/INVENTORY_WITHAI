"use client";

import { useActionState, useState } from "react";
import { registerUser } from "@/app/actions/auth";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Image from "next/image";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(registerUser, null);
  const [passwordError, setPasswordError] = useState("");
  const [selectedRole, setSelectedRole] = useState("buyer");

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
    // Use startTransition to safely trigger the action
    formAction(formData);
  };

  const handleGoogleSignup = async () => {
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  };

  if (state?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F6] py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <Card className="w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 rounded-[24px] text-center p-6">
          <CardHeader className="space-y-4 flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-[#005914]" />
            <CardTitle className="text-2xl font-bold text-[#005914]">Registration Successful!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 font-medium">Waiting for admin approval. You will be able to log in once your account is active.</p>
          </CardContent>
          <CardFooter className="flex justify-center mt-4">
            <Link href="/login" className="text-[#005914] hover:underline font-bold bg-[#E2EBE5] px-6 py-2.5 rounded-full">Return to Login</Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Check for google pending success state from query params via window
  const isGooglePending = typeof window !== 'undefined' && window.location.search.includes('success=google_pending');

  if (isGooglePending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F6] py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <Card className="w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 rounded-[24px] text-center p-6">
          <CardHeader className="space-y-4 flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-[#005914]" />
            <CardTitle className="text-2xl font-bold text-[#005914]">Google Registration Successful!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 font-medium">Your Google account has been linked. Waiting for admin approval as a buyer. You will be able to log in once active.</p>
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
      {/* Subtle background gradient */}
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#E2EBE5] to-transparent opacity-50 z-0 pointer-events-none" />

      <div className="w-full max-w-[420px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10 flex flex-col mt-4 md:mt-2 mb-10">
        <div className="px-8 pt-8 pb-8 flex-1">
          <div className="flex items-center gap-2 mb-8 font-bold text-[#005914] text-[15px]">
            <Image src="/logo.png" alt="Century Pacific Food" width={140} height={32} className="h-8 w-auto object-contain" />
          </div>

          <div className="mb-6">
            <h1 className="text-[26px] font-bold text-gray-900 tracking-tight mb-2">Join the Curation</h1>
            <p className="text-[#6B7280] text-[13px] font-medium leading-relaxed max-w-[280px]">
              Enter your details to manage your precision inventory.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {state?.error && (
              <Alert variant="destructive" className="py-2.5 px-3 rounded-lg bg-red-50 border-red-100 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{state.error}</AlertDescription>
              </Alert>
            )}

            {passwordError && (
              <Alert variant="destructive" className="py-2.5 px-3 rounded-lg bg-red-50 border-red-100 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{passwordError}</AlertDescription>
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

            {/* Added Phone back to preserve functionality */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-[12px] font-semibold text-gray-700">Phone</Label>
              <Input id="phone" name="phone" type="text" placeholder="+1234567890" className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#005914] px-4 shadow-sm" />
            </div>

            {/* Role Selection Grid */}
            <div className="space-y-3 mb-6">
              <Label className="text-[13px] font-bold text-gray-800 uppercase tracking-wider">Choose Your Role</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "buyer", title: "Buyer", img: "/buyer-hero.png" },
                  { id: "salesman", title: "Seller", img: "/seller-hero.png" },
                  { id: "supervisor", title: "Supervisor", img: "/supervisor-hero.png" },
                ].map((role) => (
                  <label
                    key={role.id}
                    className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all cursor-pointer group hover:shadow-md ${
                      selectedRole === role.id 
                        ? "border-[#005914] bg-[#E2EBE5]/30" 
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.id}
                      className="sr-only"
                      checked={selectedRole === role.id}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      required
                    />
                    <div className="w-full aspect-square mb-2 overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center">
                      <Image 
                        src={role.img} 
                        alt={role.title} 
                        width={100} 
                        height={100} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-tight ${selectedRole === role.id ? "text-[#005914]" : "text-gray-500"}`}>
                      {role.title}
                    </span>
                    {selectedRole === role.id && (
                      <div className="absolute -top-1 -right-1 bg-[#005914] text-white rounded-full p-0.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
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

          <div className="relative flex items-center justify-center my-8">
            <div className="absolute inset-0 flex items-center w-[80%] mx-auto">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative bg-white px-3 text-[11px] font-semibold text-gray-500">
              Or continue with
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 bg-[#F3F4F6] border-0 rounded-full text-gray-700 font-semibold mb-6 hover:bg-gray-200 flex items-center justify-center gap-2"
            type="button"
            onClick={handleGoogleSignup}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </Button>

          <div className="text-center text-[13px] text-gray-600 font-medium mb-8">
            Already have an account?{" "}
            <Link href="/login" className="text-[#005914] hover:underline font-bold">
              Log in
            </Link>
          </div>

          <p className="text-center text-[10px] text-gray-400 uppercase tracking-wide leading-relaxed px-4 mb-2">
            By creating an account, you agree to our <br />
            <Link href="#" className="underline">Privacy Policy</Link> and <Link href="#" className="underline">Terms of Service</Link>.
          </p>
        </div>

        <div className="bg-[#FAFAFA] px-8 py-5 border-t border-gray-100">
          <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-relaxed mb-3">
            © 2024 Century Paci Food. Precision Curation.
          </p>
          <div className="flex gap-6 text-[10px] font-bold text-gray-400 tracking-wider">
            <Link href="#" className="hover:text-gray-600 transition-colors">SUPPORT</Link>
            <Link href="#" className="hover:text-gray-600 transition-colors">SYSTEM STATUS</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
