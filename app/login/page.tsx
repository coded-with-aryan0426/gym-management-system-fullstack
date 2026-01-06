"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    console.log("Login attempted");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden font-sans selection:bg-[#E63946] selection:text-white">
        {/* Background Effects - Optimized for performance */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#E63946] opacity-[0.05] blur-[80px] sm:blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-[#4361EE] opacity-[0.05] blur-[100px] sm:blur-[150px] rounded-full" />
        </div>

      <main className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center relative z-10 min-h-[calc(100vh-64px)]">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[420px] space-y-8"
        >
            <div className="flex flex-col items-center space-y-2">
                <Link href="/" className="mb-6 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#E63946] rounded-lg p-1">
                    <Logo size={50} />
                </Link>
            </div>

          <Card className="bg-[#0A0A0A]/90 border-white/10 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-1 pb-6 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight text-white">Welcome back</CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200 text-xs font-semibold uppercase tracking-wider">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    required 
                    className="h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946]/50 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-200 text-xs font-semibold uppercase tracking-wider">Password</Label>
                    <Link 
                        href="#" 
                        className="text-xs text-[#E63946] hover:text-[#E63946]/80 font-medium transition-colors focus:outline-none focus:underline"
                    >
                        Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        required 
                        className="h-11 bg-white/5 border-white/10 text-white focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946]/50 pr-10 transition-all duration-200"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-11 bg-gradient-to-r from-[#E63946] to-[#D62828] hover:from-[#D62828] hover:to-[#B91C1C] text-white font-semibold text-sm tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(230,57,70,0.3)] hover:shadow-[0_0_30px_rgba(230,57,70,0.5)]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Signing In...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-5 pt-2">
                <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                        <span className="bg-[#0A0A0A] px-2 text-gray-500">Or continue with</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                    <Button variant="outline" className="h-10 w-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white transition-colors">
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                        Google
                    </Button>
                    <Button variant="outline" className="h-10 w-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white transition-colors">
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="apple" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z"></path></svg>
                        Apple
                    </Button>
                </div>
                
                <div className="text-center text-sm text-gray-400 mt-4">
                    Don't have an account?{" "}
                    <Link href="#" className="text-[#E63946] hover:text-[#ff4f5e] font-semibold hover:underline transition-all">
                        Sign up free
                    </Link>
                </div>
            </CardFooter>
          </Card>
            
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-center"
            >
                <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-white transition-colors group">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>
            </motion.div>
        </motion.div>
      </main>
      
      <footer className="absolute bottom-4 w-full text-center text-[10px] text-gray-600">
        © 2025 AthlonX Inc. All rights reserved.
      </footer>
    </div>
  );
}
