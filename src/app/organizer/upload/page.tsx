"use client";
import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card } from "@/components/ui/card";

function CreateAlbum() {
    const [eventCode, setEventCode] = useState("");
    const [isGenerated, setIsGenerated] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const modelUrl = `http://${window.location.hostname}:8000`;

    const generateCode = () => {
        const characters = "abcdefghijklmnopqrstuvwxyz";
        let randomCode = "";
        for (let i = 0; i < 5; i++) {
            randomCode += characters.charAt(
                Math.floor(Math.random() * characters.length)
            );
        }
        setEventCode(randomCode);
        setIsGenerated(true);
    };

    const handleCopy = () => {
        const codeElement = document.getElementById("eventCode");
        if (codeElement) {
            (codeElement as HTMLInputElement).select();
            document.execCommand("copy");
            toast.success("Event code copied to clipboard!");
        }
    };

    const handleFileChange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            toast.error("Please select a file before submitting.");
            return;
        }

        const formData = new FormData();
        formData.append("EventId", eventCode);
        formData.append("file", selectedFile);

        try {
            const response = await axios.post(
                `${modelUrl}/upload-folder`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            if (response.data.err === "Done Uploading") {
                toast.success("File uploaded successfully!");
            } else {
                toast.error(`Error: ${response.data.err}`);
            }
            console.log("Response:", response.data);
        } catch (error) {
            console.error("Error uploading file:", error);
            toast.error("There was an error uploading the file.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
            <Card className="p-6 items-center space-y-4 ">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                    Create an Album
                </h1>

                <div className="w-full">
                    <input
                        id="albumName"
                        type="text"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter album name"
                    />
                </div>

                <button
                    className={`w-full py-2 mb-4 bg-blue-400 text-white font-semibold rounded hover:opacity-90 ${
                        isGenerated ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    onClick={generateCode}
                    disabled={isGenerated}
                >
                    Generate
                </button>

                <div className="w-full flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 w-full border border-gray-300 dark:border-gray-600 dark:bg-zinc-900 rounded-lg px-3 py-2">
                        <input
                            id="eventCode"
                            type="text"
                            value={eventCode}
                            readOnly
                            className="flex-1 text-gray-900 dark:text-gray-200 bg-transparent focus:outline-none py-2"
                            placeholder="Click 'Generate' to get code"
                        />
                        <button
                            className={`ml-auto px-1.5 py-1.5 font-bold rounded-lg bg-blue-400 text-white hover:bg-blue-500 ${
                                !eventCode
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                            }`}
                            onClick={handleCopy}
                            disabled={!eventCode}
                        >
                            Copy
                        </button>
                    </div>
                </div>

                <h1 className="text-xl font-bold pt-5 text-gray-800 dark:text-white">
                    Upload Event Photos
                </h1>

                <div className="w-full">
                    <input
                        id="folderSelector"
                        type="file"
                        accept=".zip"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-200 focus:outline-none"
                        onChange={handleFileChange}
                    />
                </div>

                <button
                    className="w-full py-2 mb-4 bg-blue-400 text-white font-semibold rounded hover:opacity-90"
                    onClick={handleSubmit}
                >
                    Submit
                </button>
            </Card>
           <ToastContainer position="bottom-right" />
        </div>
    );
}

export default CreateAlbum;
