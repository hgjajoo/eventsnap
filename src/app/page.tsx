"use client";
import React from "react";
import { useRouter } from "next/navigation";
import DarkThemeCard from "@/components/custom/Card";
import Hero_section from "@/components/custom/Hero";
const LandingPage = () => {
    const router = useRouter();

    const handleSignUpClick = () => {
        router.push("/started");
    };

    return (
        <div className="bg-gray-100 dark:bg-black text-black dark:text-white">
            <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-6 px-4 max-w-4xl mx-auto">
                <div className="bg-[url('../../public/images/bg0.jpg')] bg-cover bg- h-[70vh] w-[95vw]  border-xl rounded-3xl filter blur-s">
                    <div className=" mt-40">
                        <Hero_section />
                        <div className="pt-6">
                            <button
                                className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-500 transition"
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
                                    title="Reusable Components"
                                    description="This card demonstrates how you can reuse components across your application.Lorem ipsum dolor sit amet consectetur.lorem2"
                                />
                                <DarkThemeCard
                                    title="Tailwind CSS"
                                    description="Built with Tailwind CSS for easy styling and responsiveness.Lorem ipsum dolor sit amet consectetur.lorem2"
                                />
                                <DarkThemeCard
                                    title="Dark and Light Mode"
                                    description="Supports both light and dark modes dynamically.Lorem ipsum dolor sit amet consectetur.lorem2
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
