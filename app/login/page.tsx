"use client";
import { CustomButton, SectionTitle } from "@/components";
import { useAuthStore } from "../_zustand/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "@/lib/api";

const LoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, setAuth } = useAuthStore();

  useEffect(() => {
    const expired = searchParams.get('expired');
    if (expired === 'true') {
      setError("Your session has expired. Please log in again.");
      toast.error("Your session has expired. Please log in again.");
    }

    // Check if already logged in using Zustand
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router, searchParams]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = e.target.email.value;
    const password = e.target.password.value;

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters");
      toast.error("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      console.log("🔑 Authenticating with custom MERN auth backend...");
      
      const response = await apiClient.post("/api/auth/login", {
        email,
        password,
      });

      const data = await response.json();

      if (response.ok) {
        // Save auth data in Zustand store (persisted in localStorage)
        setAuth(data.user, data.accessToken, data.refreshToken);
        toast.success("Welcome back! Successfully logged in.");
        
        router.push("/");
        setTimeout(() => {
          window.location.reload(); // Hard reload to clear client state
        }, 100);
      } else {
        setError(data.error || "Authentication failed");
        toast.error(data.error || "Authentication failed");
      }
    } catch (err) {
      toast.error("Something went wrong. Please check your credentials.");
      setError("Something went wrong. Please check your credentials.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = prompt("Please enter your registered email address:");
    if (!email) return;

    if (!isValidEmail(email)) {
      toast.error("Invalid email address format");
      return;
    }

    try {
      toast.loading("Sending password reset link...");
      const response = await apiClient.post("/api/auth/forgot-password", { email });
      toast.dismiss();

      if (response.ok) {
        toast.success("Reset link generated! Check your node console log for mock email output.");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to initiate password reset");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 border-solid"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <SectionTitle title="Login" path="Home | Login" />
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8 bg-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your orders, wishlist, and profile details
          </p>
        </div>

        <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-2xl sm:px-12 border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900 font-semibold"
                >
                  Email Address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900 font-semibold"
                >
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-3 block text-sm leading-6 text-gray-900"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm leading-6">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <div>
                <CustomButton
                  buttonType="submit"
                  text="Sign In Securely"
                  paddingX={3}
                  paddingY={2}
                  customWidth="full"
                  textSize="sm"
                />
              </div>

              <p className="text-red-600 text-center text-sm font-medium">
                {error && error}
              </p>

              <div className="text-center mt-4">
                <span className="text-sm text-gray-500">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Register here
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
};

export default LoginPage;
