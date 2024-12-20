"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card } from "@/components/ui/card";

const UploadSamples = () => {
    const [theme, setTheme] = useState<string>("dark");
    const [eventCode, setEventCode] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const modelUrl = process.env.NEXT_PUBLIC_MODEL_URL!;
    
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setSelectedFile(file || null);
    };

    const handleSort = async () => {
        if (!eventCode) {
            toast.error("Please enter an event code.");
            return;
        }
        if (!selectedFile) {
            toast.error("Please select an image file.");
            return;
        }

        const formData = new FormData();
        formData.append("EventId", eventCode);
        formData.append("file", selectedFile);

        try {
            setLoading(true);
            const response = await axios.post(
                `${modelUrl}/attendee-data`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.err === "go-to-download") {
                toast.success(
                    "Sorting complete! You can now download your results."
                );
            } else {
                toast.error(`Error: ${response.data.err}`);
            }
        } catch (error) {
            console.error("Error sending request:", error);
            toast.error("An error occurred while processing the request.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        let str = selectedFile ? selectedFile.name : "";
        str = str.replace(/\.(jpg|jpeg|png)$/i, "");
        try {
            const response = await axios.post(
                `${modelUrl}/download-zip`,
                new URLSearchParams({ Username: str }),
                { responseType: "arraybuffer" } // Binary data
            );

            // Directly let the browser handle the file download
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${str}.zip`); 
            document.body.appendChild(link);
            link.click();
            link.target = '_blank';
            link.remove(); 
            // window.location.href = url;
        } catch (error) {
            console.error("Error downloading the file:", error);
            toast.error(
                "Failed to download file. Sort to download the file."
            );
        }
    };
    const inputClass = `w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 
        dark:bg-zinc-900 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 
        bg-gray-100 border-gray-300 text-black placeholder-gray-500`;
    return (
        <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-black">
            <Card className="p-8 space-y-4 flex flex-col items-center w-full max-w-md">
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
                        value={eventCode}
                        onChange={(e) => setEventCode(e.target.value)}
                        className={inputClass}
                        placeholder="Enter event code"
                    />
                </div>

                <h1 className="text-xl font-semibold text-center text-black dark:text-white">
                    Upload Samples
                </h1>
                <input
                    id="fileInput"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className={inputClass}
                />

                <h2 className="text-lg font-semibold text-center text-black dark:text-white">
                    Sort Personalized Photo
                </h2>
                <button
                    onClick={handleSort}
                    disabled={loading}
                    className={`px-4 py-2 font-semibold rounded border text-black bg-transparent hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black transition ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    {loading ? "Sorting..." : "Sort"}
                </button>
                <button
                    onClick={handleDownload}
                    className={`${
                        !eventCode ? "cursor-not-allowed opacity-50" : ""
                    } px-4 py-2 font-semibold rounded border border-black text-black bg-blue-400 dark:border-white dark:text-white hover:bg-blue-500 hover:text-white dark:hover:bg-white dark:hover:text-black transition`}
                >
                    Download
                </button>
            </Card>
                <ToastContainer position="bottom-right" />
        </div>
    );
};

export default UploadSamples;
