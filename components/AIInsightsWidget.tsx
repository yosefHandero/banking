"use client";

import { useState, useRef } from "react";
import AISuggestionCard from "./AISuggestionCard";
import Link from "next/link";
import { Button } from "./ui/button";

interface AIInsightsWidgetProps {
  userId: string;
}

export default function AIInsightsWidget({ userId }: AIInsightsWidgetProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const isLoadingRef = useRef(false);

  const loadSuggestions = async () => {
    if (isLoadingRef.current) {
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    
    try {
      isLoadingRef.current = true;
      setError(null);
      setLoading(true);

      const response = await fetch(`/api/ai/suggestions`, {
        cache: 'no-store',
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server error: Received ${contentType || 'unknown'} response. Please check the server logs.`);
      }

      const data = await response.json();

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      if (response.ok) {
        setSuggestions(data.suggestions?.slice(0, 3) || []);
        setError(null);
      } else {
        if (response.status === 429) {
          const errorMessage = data.errorType === 'quota_exceeded' 
            ? 'Groq quota exceeded. Please check your Groq account limits at https://console.groq.com/limits'
            : 'Rate limit exceeded. Please wait 1-2 minutes before trying again.';
          throw new Error(errorMessage);
        }
        throw new Error(data.error || "Failed to load suggestions");
      }
    } catch (error: any) {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }
      
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error("Error loading suggestions: Invalid JSON response", error);
        setError("Server error: Invalid response format. Please check the server logs or try again later.");
      } else {
        console.error("Error loading suggestions:", error);
        setError(error.message || "Failed to load insights");
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
        isLoadingRef.current = false;
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-[#001122] rounded-lg shadow-form">
      <div className="flex items-center justify-between">
        <h2 className="text-18 font-semibold text-white">AI Insights</h2>
        <Link href="/ai-insights">
          <Button
            variant="ghost"
            className="text-14 text-gray-300 hover:text-white"
          >
            View All
          </Button>
        </Link>
      </div>
      {loading ? (
        <div className="flex flex-col gap-2">
          <p className="text-14 text-gray-300">Loading insights...</p>
          <Button
            onClick={loadSuggestions}
            variant="ghost"
            className="text-12 text-blue-400 hover:text-blue-300 self-start"
            disabled={true}
          >
            Loading...
          </Button>
        </div>
      ) : error ? (
        <div className="flex flex-col gap-2">
          <p className="text-14 text-red-400">{error}</p>
          <Button
            onClick={loadSuggestions}
            variant="ghost"
            className="text-12 text-blue-400 hover:text-blue-300 self-start"
            disabled={loading}
          >
            Retry
          </Button>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-14 text-gray-300">Click the button below to get AI-powered financial insights</p>
          <Button
            onClick={loadSuggestions}
            className="form-btn self-start"
            disabled={loading || !userId}
          >
            Get AI Insights
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            {suggestions.map((suggestion, index) => (
              <AISuggestionCard
                key={index}
                suggestion={suggestion}
                index={index}
              />
            ))}
          </div>
          <Button
            onClick={loadSuggestions}
            variant="ghost"
            className="text-12 text-blue-400 hover:text-blue-300 self-start mt-2"
            disabled={loading}
          >
            Refresh Insights
          </Button>
        </div>
      )}
    </div>
  );
}
