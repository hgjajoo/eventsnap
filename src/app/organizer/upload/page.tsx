"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card } from "@/components/ui/card";
import { ClipboardCopy } from "lucide-react";

function CreateAlbum() {
  const [theme, setTheme] = useState<string>("dark");
  const [eventCode, setEventCode] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const modelUrl = process.env.NEXT_PUBLIC_MODEL_URL!;

  // REVERTED THEME LOGIC (more reliable)
  useEffect(() => {
    const savedTheme =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    setTheme(savedTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(savedTheme);
  }, []);

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
    navigator.clipboard.writeText(eventCode);
    toast.success("Event code copied to clipboard!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

    setIsUploading(true);

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
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("There was an error uploading the file.");
    } finally {
      setIsUploading(false);
    }
  };

  const inputClass = `w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-400 
    dark:bg-[#0f0f0f] dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-400 
    bg-white border-gray-300 text-black placeholder-gray-500`;

  const actionButtonClass =
    "w-full px-6 py-3 font-semibold rounded-md border border-gray-300 dark:border-gray-600 text-black dark:text-white bg-white dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#222] transition shadow-md";

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0f0f0f] transition-colors px-4">
      <Card className="bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-gray-700 shadow-xl p-10 space-y-6 flex flex-col items-center w-full max-w-2xl rounded-2xl">
        <h1 className="text-3xl font-bold text-center text-black dark:text-white mb-2">
          Create an Album
        </h1>

        <div className="w-full flex flex-col space-y-2">
          <label
            htmlFor="albumName"
            className="text-xl font-semibold text-black dark:text-white"
          >
            Name your Event
          </label>
          <input
            id="albumName"
            type="text"
            className={inputClass}
            placeholder="Enter album name"
          />
        </div>

        <button
          className={`${actionButtonClass} ${
            isGenerated ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={generateCode}
          disabled={isGenerated}
        >
          Generate Code
        </button>

        <div className="w-full">
          <label className="block mb-2 font-medium text-black dark:text-white">
            Your Event Code
          </label>
          <div className="relative flex items-center w-full">
            <input
              id="eventCode"
              type="text"
              value={eventCode}
              readOnly
              className={inputClass}
              placeholder="Click 'Generate' to get code"
            />
            {eventCode && (
              <button
                className="absolute right-3 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                onClick={handleCopy}
              >
                <ClipboardCopy size={20} />
              </button>
            )}
          </div>
        </div>

        <h2 className="text-xl font-semibold text-center text-black dark:text-white pt-4">
          Upload Event Photos
        </h2>

        <label
          htmlFor="folderSelector"
          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-black dark:text-white bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-200 dark:hover:bg-[#222] transition cursor-pointer"
        >
          <span className="text-lg font-medium">Click to Upload ZIP File</span>
          <span className="text-sm mt-1 opacity-70">Only .zip files supported</span>
        </label>
        <input
          id="folderSelector"
          type="file"
          accept=".zip"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          className={`${actionButtonClass} ${
            isUploading ? "opacity-50 cursor-wait" : ""
          }`}
          onClick={handleSubmit}
          disabled={isUploading}
        >
          {isUploading ? "Submitting..." : "Submit"}
        </button>

        <ToastContainer position="bottom-right" />
      </Card>
    </div>
  );
}

export default CreateAlbum;
