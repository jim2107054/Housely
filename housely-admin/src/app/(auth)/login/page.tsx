"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Home, Users, TrendingUp, DollarSign } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials or insufficient permissions");
      } else if (result?.ok) {
        toast.success("Login successful");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 text-white p-12 flex-col justify-between relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 40%, #1a4d7a 70%, #0f2d4a 100%)" }}>
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/30">
              <Home className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Housely</h1>
          </div>
          <p className="text-lg text-blue-200 font-medium">Platform Command Center</p>
        </div>

        <div className="z-10 space-y-7">
          <div>
            <h2 className="text-4xl font-bold leading-tight text-white">
              Complete control over your rental &amp; sales platform
            </h2>
            <p className="mt-3 text-blue-200 text-base">Manage users, properties, bookings and revenue — all in one place.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4">
                <Users className="w-7 h-7 text-sky-300 mb-2" />
                <p className="text-2xl font-bold text-white">10K+</p>
                <p className="text-sm text-blue-200">Active Users</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4">
                <Home className="w-7 h-7 text-emerald-300 mb-2" />
                <p className="text-2xl font-bold text-white">5K+</p>
                <p className="text-sm text-blue-200">Properties</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4">
                <TrendingUp className="w-7 h-7 text-green-300 mb-2" />
                <p className="text-2xl font-bold text-white">15K+</p>
                <p className="text-sm text-blue-200">Bookings</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4">
                <DollarSign className="w-7 h-7 text-yellow-300 mb-2" />
                <p className="text-2xl font-bold text-white">৳50M+</p>
                <p className="text-sm text-blue-200">Revenue</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Background glow decorations */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign in to Dashboard</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@housely.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-700"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in to Dashboard"}
              </Button>
              <p className="text-xs text-center text-gray-500 mt-4">
                Access restricted to administrators only
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
