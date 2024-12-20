"use client";
import React from "react";
import { useRouter } from "next/navigation";
import DarkThemeCard from "@/components/custom/Card";
import Hero_section from "@/components/custom/Hero";
const LandingPage = () => {
    const router = useRouter();

    const handleSignUpClick = () => {
        router.push("/signin");
    };

    return (
        <div className="bg-gray-100 dark:bg-black text-black dark:text-white">
            <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-6 px-4 max-w-4xl mx-auto">
                <div className="bg-[url('../../public/images/bg0.jpg')] bg-cover bg- h-[70vh] w-[95vw]  border-xl rounded-3xl filter blur-s">
                    <div className=" mt-40">
                        <Hero_section />
                        <div className="pt-6">
                            <button
                                className="px-6 py-3 bg-gray-100 dark:bg-black text-black dark:text-white font-bold rounded-lg text-xl"
                                onClick={handleSignUpClick}
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div className="h-[100vh] flex flex-col items-center justify-center">
                    <div className="relative h-[70vh] w-[95vw] border-xl rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-[url('../../public/images/bg1.jpg')] bg-center bg-cover filter blur-sm z-0"></div>

                        <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
                            <p className="text-6xl font-serif font-bold text-gray-900 dark:text-white mt-10">
                                Features
                            </p>
                            <div className="flex items-center justify-center gap-6 mt-6">
                                <DarkThemeCard
                                    title="AI-Driven Face Recognition"
                                    description="Utilizes computer vision algorithms to accurately match attendee photos with event images, saving time and effort.
"
                                />
                                <DarkThemeCard
                                    title="Automatic Event ID Generation"
                                    description="Automatically generates a unique event ID for every event, ensuring organized and easy photo management.
"
                                />
                                <DarkThemeCard
                                    title="Personalized Photo Retrieval"
                                    description="Attendees can quickly retrieve their photos by uploading a face scan or a few images, making the experience hassle-free and efficient.
                                "
                                />
                            </div>{" "}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default LandingPage;
