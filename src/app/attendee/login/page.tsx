"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

const EventLogin = () => {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const isCorrectAnswer = answer === "800";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-black text-gray-900 dark:text-white">
      <Card className="p-8 w-11/12 max-w-lg flex flex-col items-center justify-center">
        <h2 className="text-lg font-semibold text-center mb-4">
          Please verify that you are human
        </h2>
        <h3 className="text-lg font-semibold text-center mb-4">
          What is 80 times 10?
        </h3>
        <input
          id="answer"
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 
                        dark:bg-zinc-900 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 
                        bg-gray-100 border-gray-300 text-black placeholder-gray-500"
          placeholder="Enter the answer"
        />
        <button
          className={`w-full py-2 bg-blue-500 text-black dark:from-purple-500 dark:to-pink-500 dark:text-white font-semibold rounded hover:opacity-90 ${
            !isCorrectAnswer && `cursor-not-allowed opacity-50`
          }`}
          onClick={() => router.push("/attendee/sort")}
          disabled={!isCorrectAnswer}
        >
          Verify
        </button>
      </Card>
    </div>
  );
};

export default EventLogin;
