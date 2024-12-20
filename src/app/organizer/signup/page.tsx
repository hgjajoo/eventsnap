"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/components/ui/card";

const SignupForm = () => {
    const router = useRouter();

    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        email: "",
        phone: "",
        password: "",
    });

    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await axios.post("/api/auth/signup", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            setSuccessMessage(response.data.msg);
            setTimeout(() => {
                router.push("/organizer/verify");
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.err || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const containerClass = `bg-gray-100 dark:bg-black text-gray-900 dark:text-white`;
    const inputClass = `w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 
        dark:bg-zinc-900 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 
        bg-gray-100 border-gray-300 text-black placeholder-gray-500`;
    const buttonClass = `w-full py-2 mb-4 font-semibold rounded shadow-md hover:opacity-90 bg-blue-500  dark:text-white text-black`;

    return (
        <div
            className={`flex justify-center items-center h-screen ${containerClass}`}
        >
            <Card className="w-full px-6 py-4 max-w-md">
                <h1 className="text-2xl font-semibold mb-2">
                    Create an Account
                </h1>
                <p className="mb-6 text-gray-500 dark:text-gray-400">
                    Enter your information to sign up
                </p>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {successMessage && (
                    <p className="text-green-500 text-sm mb-4">
                        {successMessage}
                    </p>
                )}

                <form className="space-y-2" onSubmit={handleSubmit}>
                    <div className="text-left py-2">
                        <label
                            htmlFor="fullName"
                            className="block font-medium mb-1"
                        >
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className={inputClass}
                            required
                        />
                    </div>
                    <div className="text-left">
                        <label
                            htmlFor="username"
                            className="block font-medium mb-1"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            placeholder="johndoe"
                            value={formData.username}
                            onChange={handleInputChange}
                            className={inputClass}
                            required
                        />
                    </div>
                    <div className="text-left">
                        <label
                            htmlFor="email"
                            className="block font-medium mb-1"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="john.doe@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={inputClass}
                            required
                        />
                    </div>
                    <div className="text-left">
                        <label
                            htmlFor="phone"
                            className="block font-medium mb-1"
                        >
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            placeholder="+1234567890"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={inputClass}
                            required
                        />
                    </div>
                    <div className="text-left">
                        <label
                            htmlFor="password"
                            className="block font-medium mb-1"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="********"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={inputClass}
                            required
                        />
                    </div>
                    <p className="text-left text-sm text-gray-500 dark:text-gray-400">
                        Must be at least 8 characters, including a number and a
                        special character.
                    </p>
                    <button
                        type="submit"
                        className={buttonClass}
                        disabled={loading}
                    >
                        {loading ? "Signing Up..." : "Sign Up"}
                    </button>
                </form>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Already a member?{" "}
                    <span
                        onClick={() => router.push("/organizer/login")}
                        className="text-blue-500 font-medium hover:underline cursor-pointer"
                    >
                        Log in
                    </span>
                </p>
            </Card>
        </div>
    );
};

export default SignupForm;
