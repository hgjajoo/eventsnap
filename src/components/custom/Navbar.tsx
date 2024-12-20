"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
const ToggleButton = () => {
    
    const [theme, setTheme] = useState(
        typeof window !== "undefined" && localStorage.theme === "dark"
            ? "dark"
            : "light"
    );
    const [isMounted, setIsMounted] = useState(false);
  
    
    
    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem("theme", theme);
        setIsMounted(true);

    }, [theme]);

    if (!isMounted) {
        return null; // Avoid rendering on the server
      }
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
    };

    return (
        <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded  dark:text-gray-100 transition transform hover:scale-105"
        >
            {theme === "dark" ? <Moon /> : <Sun />}
        </button>
    );
};

const Navbar = () => {
    const router = useRouter();
    const handleClick = () => {
        router.push("/");
    };
    const handleAboutClick = () => {
        router.push("/about");
    };
    const handleContactClick = () => {
        router.push("/contact");
    };
    return (
        <div className=" px-2">
            <nav className="bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-100 rounded-2xl shadow-xl fixed left-1/2 transform -translate-x-1/2 w-11/12 z-10">
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
                        <button onClick={handleAboutClick} className="hover:underline text-center hover:scale-105 transition transform">About</button>
                        <button onClick={handleContactClick} className="hover:underline text-center hover:scale-105 transition transform">Contact</button>
                        
                    </div>

                    <ToggleButton />
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
