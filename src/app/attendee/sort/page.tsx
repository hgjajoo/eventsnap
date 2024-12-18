"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

const UploadSamples = () => {
    const [theme, setTheme] = useState<string>("dark");
    const [eventCode, setEventCode] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const modelUrl = `http://${window.location.hostname}:8000`;
    // process.env.NEXT_PUBLIC_MODEL_URL!
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
            alert("Please enter an event code.");
            return;
        }
        if (!selectedFile) {
            alert("Please select an image file.");
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
                alert("Sorting complete! You can now download your results.");
            } else {
                alert(`Error: ${response.data.err}`);
            }
        } catch (error) {
            console.error("Error sending request:", error);
            alert("An error occurred while processing the request.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        let str = selectedFile ? selectedFile.name : "";
        str = str.replace(/\.(jpg|jpeg|png)$/i, "");
        console.log(str);
        try {
            const response = await axios.post(
                `${modelUrl}/download-zip`,
                new URLSearchParams({ Username: str }),
                { responseType: "arraybuffer" } // Binary data
            );

            // Directly let the browser handle the file download
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            window.location.href = url;

            // alert("Download started successfully!");
        } catch (error) {
            console.error("Error downloading the file:", error);
            alert("Failed to download file. Ensure the username is correct.");
        } finally {
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-black">
            <div className="flex flex-col items-center p-8 rounded-lg w-full max-w-md space-y-6 shadow-lg border border-opacity-50 bg-white dark:bg-black dark:border-white">
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
                        className="border rounded-lg px-4 py-2 w-full focus:outline-none bg-white/15 text-black dark:text-white border-black dark:border-white"
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
                    className="border rounded-lg px-4 py-2 w-full focus:outline-none bg-transparent text-black dark:text-white border-black dark:border-white"
                />

                <h2 className="text-lg font-semibold text-center text-black dark:text-white">
                    Sort your Personalized Photos
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
            </div>
        </div>
    );
};

export default UploadSamples;
