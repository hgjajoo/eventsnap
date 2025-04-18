"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

const UploadSamples = () => {
  const [theme, setTheme] = useState<string>("dark");
  const [eventCode, setEventCode] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const modelUrl = process.env.NEXT_PUBLIC_MODEL_URL!;

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.body.classList.remove("dark", "light");
    document.body.classList.add(savedTheme);
  }, []);

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
      const response = await axios.post(`${modelUrl}/attendee-data`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.err === "go-to-download") {
        toast.success(
          "Sorting complete! You can now download your personalized photos."
        );
        setVisible(true);
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
        { responseType: "arraybuffer" }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${str}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading the file:", error);
      toast.error("Download failed. Please sort the images first.");
    }
  };

  const inputClass = `w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-400 
    dark:bg-[#0f0f0f] dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-400 
    bg-white border-gray-300 text-black placeholder-gray-500`;

  return (
    <>
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0f0f0f] transition-colors px-4">
        {/* Page Heading */}
        <h1 className="text-3xl font-bold text-center text-black dark:text-white mb-8">
          Sort your Photos with Ease
        </h1>

        {/* Glassmorphic Card */}
        <Card className="backdrop-blur-md bg-white/40 dark:bg-[#0f0f0f]/40 border border-gray-300 dark:border-gray-700 shadow-xl p-10 space-y-6 flex flex-col items-center w-full max-w-2xl rounded-2xl transition-all duration-300">
          <div className="w-full flex flex-col items-center space-y-4">
            <label
              htmlFor="eventCode"
              className="text-2xl font-bold text-black dark:text-white"
            >
              What's your Event Code?
            </label>
            <input
              id="eventCode"
              type="text"
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value)}
              className={inputClass}
              placeholder="Enter your event code"
            />
          </div>

          <div className="w-full flex flex-col items-center space-y-3">
            <label className="text-xl font-semibold text-center text-black dark:text-white">
              Upload your Sample Image
            </label>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 font-semibold rounded border border-gray-300 dark:border-gray-600 text-black dark:text-white bg-white dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#222] transition"
            >
              Choose an Option
            </button>
          </div>

          <h2 className="text-lg font-medium text-center text-black dark:text-white">
            Ready to Sort Your Photos?
          </h2>
          <button
            onClick={handleSort}
            disabled={loading}
            className={`px-6 py-2 font-semibold rounded border border-gray-300 dark:border-gray-600 text-black dark:text-white bg-white dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#222] transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Sorting in progress..." : "Sort Now"}
          </button>

          {visible && (
            <button
              onClick={handleDownload}
              className="px-6 py-2 font-semibold rounded border border-gray-300 dark:border-gray-600 text-black dark:text-white bg-white dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#222] transition"
            >
              Download Results
            </button>
          )}
        </Card>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/40">
            <div className="relative bg-white dark:bg-[#0f0f0f] bg-opacity-90 dark:bg-opacity-90 rounded-3xl p-12 shadow-2xl border border-gray-300 dark:border-gray-700 w-full max-w-xl">
              <button
                className="absolute top-5 right-5 text-gray-600 dark:text-gray-300 hover:text-red-500"
                onClick={() => setShowModal(false)}
              >
                <X size={28} />
              </button>
              <h3 className="text-2xl font-semibold text-center mb-12 text-black dark:text-white">
                Select an Upload Method
              </h3>
              <div className="flex gap-16 justify-center">
                <div className="flex flex-col items-center w-48 h-48 bg-gray-100 dark:bg-[#1a1a1a] rounded-3xl text-black dark:text-white hover:bg-gray-200 dark:hover:bg-[#222] cursor-pointer transition shadow-xl">
                  <img
                    src={
                      theme === "dark"
                        ? "/images/scan-dark.png"
                        : "/images/scan.png"
                    }
                    alt="Scan"
                    className="w-28 h-28 mt-4"
                  />
                  <span className="mt-6 text-lg font-medium">Scan Face</span>
                </div>
                <label
                  htmlFor="fileInput"
                  className="flex flex-col items-center justify-center w-48 h-48 bg-gray-100 dark:bg-[#1a1a1a] rounded-3xl text-black dark:text-white hover:bg-gray-200 dark:hover:bg-[#222] cursor-pointer transition shadow-xl"
                >
                  <img
                    src={
                      theme === "dark"
                        ? "/images/upload-dark.png"
                        : "/images/upload.png"
                    }
                    alt="Upload"
                    className="w-28 h-28"
                  />
                  <span className="mt-6 text-lg font-medium">Upload Image</span>
                </label>
                <input
                  id="fileInput"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="bottom-right" />
      </div>
    </>
  );
};

export default UploadSamples;
