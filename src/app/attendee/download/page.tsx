"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

const DownloadSamples = () => {
  const [theme, setTheme] = useState<string>("dark");
  const [username, setUsername] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const modelUrl = process.env.NEXT_PUBLIC_MODEL_URL || "http://localhost:5000";

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

  const handleDownload = async () => {
    if (!username) {
      alert("Please enter your username.");
      return;
    }

    try {
      setIsDownloading(true);
      const response = await axios.post(
        `${modelUrl}/download-zip`,
        new URLSearchParams({ Username: username }),
        { responseType: "arraybuffer" } // Binary data
      );

      // Directly let the browser handle the file download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      window.location.href = url;

      alert("Download started successfully!");
    } catch (error) {
      console.error("Error downloading the file:", error);
      alert("Failed to download file. Ensure the username is correct.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col items-center p-8 rounded-lg w-full max-w-md space-y-6 shadow-lg border border-opacity-50 bg-white dark:bg-gray-900 dark:border-white">
        <h1 className="text-xl font-semibold text-center text-black dark:text-white">
          Enter the name of your image file you uploaded in the last page.
        </h1>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full focus:outline-none bg-transparent text-black dark:text-white border-black dark:border-white"
          placeholder="Enter username"
        />
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`px-4 py-2 font-semibold rounded border border-black text-black bg-transparent dark:border-white dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition ${
            isDownloading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isDownloading ? "Downloading..." : "Click here to download your images."}
        </button>
      </div>
    </div>
  );
};

export default DownloadSamples;
