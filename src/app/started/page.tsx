"use client";
import React from "react";
import { useRouter } from "next/navigation";

const TwoButtonComponent = () => {
    const router = useRouter();

    const containerClass = `bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white`;
    const buttonClass = `
        py-2 w-full mb-4 font-semibold rounded shadow-md hover:opacity-90 
        bg-gradient-to-r
        dark:from-purple-500 dark:to-pink-500 dark:text-white
        from-blue-500 to-green-500 text-black
    `;

    return (
        <div
            className={`flex flex-col justify-center items-center min-h-screen ${containerClass}`}
        >
            <div className="w-full max-w-sm p-6 rounded-lg border-2 border-opacity-50 text-center">
                <h1 className="mb-4 text-xl font-bold">Sign Up</h1>

                <button
                    className={buttonClass}
                    onClick={() => router.push("/organizer/signup")}
                >
                    Signup as Organizer
                </button>

                <button
                    className={buttonClass}
                    onClick={() => router.push("/attendee/login")}
                >
                    Attendee
                </button>
            </div>
        </div>
    );
};

export default TwoButtonComponent;
