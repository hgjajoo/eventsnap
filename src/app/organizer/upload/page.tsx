"use client";
import React from "react";

function CreateAlbum() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="flex flex-col items-center space-y-4 rounded-lg p-6 w-10/12 max-w-md shadow-lg border-2 border-gray-300 dark:border-white/50">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                    Create an Album
                </h1>

                <div className="w-full">
                    <input
                        id="albumName"
                        type="text"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter album name"
                    />
                </div>

                <div className="w-full flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700">
                        <input
                            id="generatedCode"
                            type="text"
                            readOnly
                            className="flex-1 text-gray-900 dark:text-gray-200 bg-transparent focus:outline-none py-2"
                            placeholder="Generated code will appear here"
                        />
                        <button className="ml-auto px-1.5 py-1.5 font-bold rounded-lg bg-purple-500 text-white hover:bg-purple-600">
                            Copy
                        </button>
                    </div>

                    <button className="w-full py-2 mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded hover:opacity-90">
                        Generate
                    </button>
                </div>

                <h1 className="text-xl font-bold pt-5 text-gray-800 dark:text-white">
                    Upload Event Photos
                </h1>

                <div className="w-full">
                    <input
                        id="folderSelector"
                        type="file"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none"
                    />
                </div>

                <button className="w-full py-2 mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded hover:opacity-90">
                    Submit
                </button>
            </div>
        </div>
    );
}

export default CreateAlbum;
