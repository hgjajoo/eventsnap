"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

const EventLogin = () => {
    const router = useRouter();

    const containerClass = `bg-gray-100 dark:bg-black text-gray-900 dark:text-white`;
    const buttonClass = `w-full py-2  
        bg-blue-500 text-black 
        dark:from-purple-500 dark:to-pink-500 dark:text-white 
        font-semibold rounded hover:opacity-90`;

    return (
        <div
            className={`absolute inset-0 flex flex-col items-center justify-center ${containerClass}`}
        >
            <Card className="p-8 w-11/12 max-w-lg ">
                <button
                    className={buttonClass}
                    onClick={() => router.push("/attendee/sort")}
                >
                    Login with Google
                </button>
            </Card>
        </div>
    );
};

export default EventLogin;
