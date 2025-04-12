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
import {
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { googleSignIn } from "../actions/auth";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "password") {
      // Check password strength
      let strength = 0;
      if (value.length >= 8) strength += 1;
      if (/[A-Z]/.test(value)) strength += 1;
      if (/[0-9]/.test(value)) strength += 1;
      if (/[^A-Za-z0-9]/.test(value)) strength += 1;
      setPasswordStrength(strength);
    }
    if (name === "name") {
      setName(value);
    } else if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else if (name === "terms") {
      setAcceptTerms(e.target.checked as boolean);
    }
  };

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (!acceptTerms) {
      setError("You must accept the terms and conditions");
      return false;
    }

    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setError("");

      // Placeholder for backend integration
      // const response = await createUserWithEmailAndPassword(email, password);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Signup attempt with:", { name, email, password });

      // Redirect after successful signup
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to create an account. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] flex flex-col justify-center items-center p-4">
      <Link
        href="/"
        className="absolute top-8 left-8 text-white text-xl font-bold"
      >
        CollabNext
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-[#080808] border-purple-900/20 shadow-xl shadow-purple-900/5">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white">
              Create an account
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Enter your information to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-md bg-red-900/20 border border-red-800 text-red-200 text-sm"
              >
                <AlertCircle className="inline-block w-4 h-4 mr-2" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={handleInputChange}
                  className="bg-[#111111] border-gray-800 text-white focus:ring-purple-600 focus:border-purple-600"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={handleInputChange}
                  className="bg-[#111111] border-gray-800 text-white focus:ring-purple-600 focus:border-purple-600"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={handleInputChange}
                    className="bg-[#111111] border-gray-800 text-white focus:ring-purple-600 focus:border-purple-600 pr-10"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {password && (
                  <div className="mt-2">
                    <div className="flex justify-between mb-1">
                      <p className="text-xs text-gray-400">
                        Password strength:
                      </p>
                      <p className="text-xs text-gray-400">
                        {passwordStrength === 0 && "Weak"}
                        {passwordStrength === 1 && "Fair"}
                        {passwordStrength === 2 && "Good"}
                        {passwordStrength === 3 && "Strong"}
                        {passwordStrength === 4 && "Very Strong"}
                      </p>
                    </div>
                    <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          passwordStrength === 0
                            ? "bg-red-500 w-1/4"
                            : passwordStrength === 1
                            ? "bg-orange-500 w-2/4"
                            : passwordStrength === 2
                            ? "bg-yellow-500 w-3/4"
                            : passwordStrength === 3
                            ? "bg-green-500 w-4/4"
                            : "bg-emerald-500 w-full"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={handleInputChange}
                  className="bg-[#111111] border-gray-800 text-white focus:ring-purple-600 focus:border-purple-600"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) =>
                    setAcceptTerms(checked as boolean)
                  }
                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                >
                  I accept the{" "}
                  <Link
                    href="/terms"
                    className="text-purple-400 hover:text-purple-300"
                  >
                    terms and conditions
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Create account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="relative flex items-center justify-center">
              <Separator className="absolute w-full bg-gray-800" />
              <span className="relative px-2 text-xs text-gray-400 bg-[#080808]">
                OR CONTINUE WITH
              </span>
            </div>

            <Button
              variant="outline"
              className="w-full border-gray-800 text-gray-300 hover:bg-gray-800/50 hover:text-white"
              onClick={() => googleSignIn()}
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="w-5 h-5 mr-2"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              Sign up with Google
            </Button>
          </CardContent>

          <CardFooter>
            <p className="text-sm text-gray-400 text-center w-full">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
