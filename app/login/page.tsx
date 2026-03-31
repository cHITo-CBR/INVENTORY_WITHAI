"use client";

import { useActionState, useEffect, Suspense } from "react";
import { loginUser } from "@/app/actions/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(loginUser, null);
  
  const error = state?.error || searchParams.get("error");

  useEffect(() => {
    if (state?.success) {
      const next = searchParams.get("next");
      if (next) {
        router.push(next);
        return;
      }

      switch (state.role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "salesman":
          router.push("/salesman/dashboard");
          break;
        case "supervisor":
          router.push("/supervisor/dashboard");
          break;
        case "buyer":
          router.push("/customers/catalog/products");
          break;
        default:
          router.push("/login");
          break;
      }
    }
  }, [state, router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7F6] py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#E2EBE5] to-transparent opacity-50 z-0 pointer-events-none" />
      
      <div className="w-full max-w-[420px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10 overflow-hidden flex flex-col">
        <div className="px-8 pt-10 pb-8 flex-1">
          <div className="flex flex-col items-center mb-8">
            <Image src="/logo.png" alt="Century Pacific Food" width={200} height={48} className="h-12 w-auto mb-4 object-contain" priority />
          </div>

          <form action={formAction} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="py-2.5 px-3 rounded-lg bg-red-50 border-red-100 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium text-gray-700">Email address</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                className="h-11 rounded-xl border-gray-200 focus-visible:ring-[#005914] focus-visible:border-[#005914] px-4 shadow-sm transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[13px] font-medium text-gray-700">Password</Label>
                <Link href="#" className="text-[12px] font-semibold text-[#005914] hover:underline">Forgot?</Link>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="h-11 rounded-xl border-gray-200 focus-visible:ring-[#005914] focus-visible:border-[#005914] px-4 shadow-sm transition-all text-xl tracking-widest placeholder:tracking-normal placeholder:text-sm"
              />
            </div>

            <Button type="submit" className="w-full h-12 rounded-full bg-[#005914] hover:bg-[#004a11] text-white font-medium text-[15px] shadow-md transition-all mt-2" disabled={pending}>
              {pending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-8 text-center text-[13px] text-gray-500 font-medium">
             New here?{" "}
             <Link href="/signup" className="text-[#005914] hover:underline font-bold">
               Sign up
             </Link>
          </div>
        </div>

        <div className="bg-[#FAFAFA] px-8 py-6 border-t border-gray-100">
          <div className="flex justify-center items-center gap-6 mb-4 text-[10px] font-bold text-gray-400 tracking-wider">
            <Link href="#" className="hover:text-gray-600 transition-colors uppercase">Privacy Policy</Link>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <Link href="#" className="hover:text-gray-600 transition-colors uppercase">Terms of Service</Link>
          </div>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold text-center leading-loose">
            © 2024 Century Pacific Food. <br/> All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F4F7F6]">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
