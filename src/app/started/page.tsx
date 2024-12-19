"use client";
import React from "react";
import { useRouter } from "next/navigation";

const TwoButtonComponent = () => {
    const router = useRouter();

    const containerClass = `bg-gray-100 dark:bg-black text-gray-900 dark:text-white`;
    const buttonClass = `
        py-2 w-full mb-4 font-semibold rounded shadow-md hover:opacity-90 
        bg-blue-500 hover:bg-blue-700 text-white
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
