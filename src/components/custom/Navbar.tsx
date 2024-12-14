"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ToggleButton = () => {
    const [theme, setTheme] = useState(
        typeof window !== "undefined" && localStorage.theme === "dark"
            ? "dark"
            : "light"
    );

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
    };

    return (
        <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition transform hover:scale-105"
        >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
    );
};

const Navbar = () => {
    const router = useRouter();
    const handleClick = () => {
        router.push("/");
    };

    return (
        <div className="mt-5 px-2">
            <nav className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl shadow-md fixed left-1/2 transform -translate-x-1/2 w-11/12 z-10">
                <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-12">
                    {/* Logo Section */}
                    <button
                        className="text-3xl font-bold font-serif hover:text-purple-500 transition"
                        onClick={handleClick}
                    >
                        EventSnap
                    </button>

                    {/* Buttons Section */}
                    <div className="flex items-center space-x-10 text-xl">
                        <a
                            href="#home"
                            className="hover:underline text-center hover:scale-105 transition transform"
                        >
                            Home
                        </a>
                        <a
                            href="#about"
                            className="hover:underline text-center hover:scale-105 transition transform"
                        >
                            About
                        </a>
                        <a
                            href="#contact"
                            className="hover:underline text-center hover:scale-105 transition transform"
                        >
                            Contact
                        </a>
                    </div>

                    <ToggleButton />
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
