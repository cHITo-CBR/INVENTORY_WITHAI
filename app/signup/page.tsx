"use client";

import { useActionState } from "react";
import { registerUser } from "@/app/actions/auth";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(registerUser, null);

  if (state?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-lg border-0 ring-1 ring-gray-100 text-center">
          <CardHeader className="space-y-4 flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <CardTitle className="text-2xl font-bold text-green-700">Registration Successful!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Waiting for admin approval. You will be able to log in once your account is active.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/login" className="text-primary hover:underline font-medium">Return to Login</Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg border-0 ring-1 ring-gray-100">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-extrabold tracking-tight">Create an account</CardTitle>
          <CardDescription>Enter your details to register</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" type="text" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" name="email" type="email" placeholder="name@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input id="phone" name="phone" type="text" placeholder="+1234567890" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" required defaultValue="buyer">
                  <SelectTrigger id="role" className="w-full bg-white">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="salesman">Salesman</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" required />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Registering..." : "Sign up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6">
          <div className="text-sm text-muted-foreground">
             Already have an account?{" "}
             <Link href="/login" className="text-primary hover:underline font-medium">
               Sign in
             </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
