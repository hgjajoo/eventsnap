"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const VerifyAccount = () => {
    const [token, setToken] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleVerify = async () => {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await axios.post(
                "/api/auth/verify",
                { token },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            setMessage(response.data.msg);
            setTimeout(() => {
                router.push("/organizer/upload");
            }, 2000);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data?.err || "Something went wrong");
            } else {
                setError("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    const containerClass = `bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white`;
    const inputClass = `w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 
        dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 
        bg-gray-100 border-gray-300 text-black placeholder-gray-500`;
    const buttonClass = `w-full py-2 mb-4 font-semibold rounded shadow-md hover:opacity-90 
        dark:from-purple-500 dark:to-pink-500 dark:text-white 
        from-blue-500 to-green-500 text-black`;

    return (
        <div
            className={`flex justify-center items-center h-screen ${containerClass}`}
        >
            <div className="w-full max-w-md px-6 py-4 rounded-lg shadow-md border-2 border-opacity-50">
                <h1 className="text-2xl font-semibold mb-2">
                    Verify Your Account
                </h1>
                <p className="mb-6 text-gray-500 dark:text-gray-400">
                    Enter the token sent to your email to verify your account.
                </p>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {message && (
                    <p className="text-green-500 text-sm mb-4">{message}</p>
                )}

                <div className="text-left py-2">
                    <label htmlFor="token" className="block font-medium mb-1">
                        Verification Token
                    </label>
                    <input
                        type="text"
                        id="token"
                        placeholder="Enter your token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className={inputClass}
                        required
                    />
                </div>

                <button
                    onClick={handleVerify}
                    className={buttonClass}
                    disabled={loading}
                >
                    {loading ? "Verifying..." : "Verify Account"}
                </button>
            </div>
        </div>
    );
};

export default VerifyAccount;
