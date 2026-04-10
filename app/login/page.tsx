"use client";

import { useActionState, useEffect, Suspense } from "react";
import { loginUser } from "@/app/actions/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const origin = window.location.origin;
    const next = searchParams.get("next") || "";
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7F6] py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#E2EBE5] to-transparent opacity-50 z-0 pointer-events-none" />

      <div className="w-full max-w-[420px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10 overflow-hidden flex flex-col">
        <div className="px-8 pt-10 pb-8 flex-1">
          <div className="flex flex-col items-center mb-8">
            <Image src="/logo.png" alt="Century Pacific Food" width={200} height={48} className="h-12 w-auto mb-4 object-contain" priority />
          </div>

          <Button
            variant="outline"
            className="w-full h-12 rounded-full border-gray-200 text-gray-700 font-medium mb-6 hover:bg-gray-50 flex items-center justify-center gap-2"
            type="button"
            onClick={handleGoogleLogin}
            disabled={pending}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative bg-white px-4 text-[11px] font-semibold text-gray-400 tracking-wider uppercase">
              Or use email
            </div>
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
            New to the curator?{" "}
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
