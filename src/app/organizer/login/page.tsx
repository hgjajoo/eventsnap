"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false); // Track if in forgot password mode

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "/api/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        // Redirect to the upload page upon successful login
        router.push("/organizer/upload");
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.err || "Failed to login. Please try again.");
      } else {
        setError("Failed to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "/api/auth/login", // Same endpoint as login, but with the emailForRecovery in the body
        { emailForRecovery: email },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.msg) {
        setError(response.data.msg);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.err || "Failed to send recovery email.");
      } else {
        setError("Failed to send recovery email.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center border border-gray-300 dark:border-gray-600">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          {isForgotPassword ? "Forgot Password" : "Sign In"}
        </h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Forgot Password Form */}
        {isForgotPassword ? (
          <>
            <div className="text-left mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 dark:text-gray-300 font-medium mb-1"
              >
                E-mail
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              className="w-full py-2 mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded hover:opacity-90"
              onClick={handleForgotPassword}
              disabled={loading}
            >
              {loading ? "Sending Recovery Email..." : "Send Recovery Email"}
            </button>

            <p
              className="text-blue-500 text-sm cursor-pointer"
              onClick={() => setIsForgotPassword(false)} // Toggle back to login form
            >
              Back to Sign In
            </p>
          </>
        ) : (
          <>
            {/* Login Form */}
            <div className="text-left mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 dark:text-gray-300 font-medium mb-1"
              >
                E-mail
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="text-left mb-4">
              <label
                htmlFor="password"
                className="block text-gray-700 dark:text-gray-300 font-medium mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              className="w-full py-2 mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded hover:opacity-90"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <p
              className="text-sm text-blue-500 cursor-pointer"
              onClick={() => setIsForgotPassword(true)} // Switch to forgot password form
            >
              Forgot Password?
            </p>

            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Don't have an account?{" "}
              <span
                onClick={() => router.push("/organizer/signup")}
                className="text-purple-500 font-medium hover:underline cursor-pointer"
              >
                Create an account
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
