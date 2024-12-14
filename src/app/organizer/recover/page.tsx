"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const PasswordRecoveryPage = ({ params }: any) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { recoverytoken } = params;

  useEffect(() => {
    if (!recoverytoken) {
      setError("Invalid or missing recovery token.");
    }
  }, [recoverytoken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post("/api/auth/recover", {
        token: recoverytoken,
        newPassword,
        confirmPassword,
      });
      
      if (response.data.msg) {
        setSuccess(true);
        setError("");
        setTimeout(() => {
          router.push("/organizer/login");
        }, 2000);
      } else {
        setError(response.data.err || "Something went wrong.");
      }
    } catch (error: any) {
      setError(error.response?.data?.err || "An error occurred.");
    }
  };

  const containerClass = `bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white`;
  const inputClass = `w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 
        dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 
        bg-gray-100 border-gray-300 text-black placeholder-gray-500`;
  const buttonClass = `w-full py-2 mb-4 font-semibold rounded shadow-md hover:opacity-90 
        bg-gradient-to-r 
        dark:from-purple-500 dark:to-pink-500 dark:text-white 
        from-blue-500 to-green-500 text-black`;

  return (
    <div
      className={`flex justify-center items-center h-screen ${containerClass}`}
    >
      <div className="w-full max-w-md px-6 py-4 rounded-lg shadow-md border-2 border-opacity-50">
        <h2 className="text-2xl font-semibold mb-2 text-center">Reset Your Password</h2>
        
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4 text-center">Password updated successfully! Redirecting...</p>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="text-left py-2">
            <label className="block font-medium mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div className="text-left py-2">
            <label className="block font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className={buttonClass}
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordRecoveryPage;
