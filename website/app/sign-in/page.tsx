"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Github, Twitter } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle sign in logic here
    console.log({ email, password, rememberMe });
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-[#080808] border-purple-900/20 shadow-xl shadow-purple-900/5">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white">
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#111111] border-gray-800 text-white focus:ring-purple-600 focus:border-purple-600"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#111111] border-gray-800 text-white focus:ring-purple-600 focus:border-purple-600"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={setRememberMe}
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
              >
                Remember me
              </label>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              onClick={handleSubmit}
            >
              Sign in
            </Button>

            <div className="relative flex items-center justify-center">
              <Separator className="absolute w-full bg-gray-800" />
              <span className="relative px-2 text-xs text-gray-400 bg-[#080808]">
                OR CONTINUE WITH
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="border-gray-800 text-gray-300 hover:bg-gray-800/50"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              <Button
                variant="outline"
                className="border-gray-800 text-gray-300 hover:bg-gray-800/50"
              >
                <Twitter className="mr-2 h-4 w-4" />
                Twitter
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
