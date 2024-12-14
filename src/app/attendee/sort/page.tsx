"use client";
import React, { useState, useEffect } from "react";

const UploadSamples = () => {
    const [theme, setTheme] = useState<string>("dark");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "dark";
        setTheme(savedTheme);
        document.body.classList.remove("dark", "light");
        document.body.classList.add(savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.body.classList.remove("dark", "light");
        document.body.classList.add(newTheme);
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="flex flex-col items-center p-8 rounded-lg w-full max-w-md space-y-6 shadow-lg border border-opacity-50 bg-white dark:bg-gray-900 dark:border-white">
                <div className="w-full flex flex-col items-center space-y-4">
                    <label
                        htmlFor="eventCode"
                        className="text-lg font-semibold text-black dark:text-white"
                    >
                        Enter the Event Code
                    </label>
                    <input
                        id="eventCode"
                        type="text"
                        className="border rounded-lg px-4 py-2 w-full focus:outline-none bg-transparent text-black dark:text-white border-black dark:border-white"
                        placeholder="Enter event code"
                    />
                    <button
                        onClick={() => alert("Event code submitted!")}
                        className="px-4 py-2 font-semibold rounded border border-black text-black bg-transparent dark:border-white dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
                        aria-label="Submit event code"
                    >
                        Submit
                    </button>
                </div>

                <h1 className="text-xl font-semibold text-center text-black dark:text-white">
                    Upload Samples
                </h1>
                <input
                    type="file"
                    className="border rounded-lg px-4 py-2 w-full focus:outline-none bg-transparent text-black dark:text-white border-black dark:border-white"
                />

                <h2 className="text-lg font-semibold text-center text-black dark:text-white">
                    Sort Personalized Photo
                </h2>
                <button
                    className="px-4 py-2 font-semibold rounded border border-black text-black bg-transparent dark:border-white dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
                    aria-label="Sort photos"
                >
                    Sort
                </button>
                <button className="px-4 py-2 font-semibold rounded border border-black text-black bg-transparent dark:border-white dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition">
                    Download
                </button>
            </div>
        </div>
    );
};

export default UploadSamples;
