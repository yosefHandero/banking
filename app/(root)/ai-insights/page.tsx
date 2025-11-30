"use client";

import { useState, useRef } from "react";
import { getCurrentUser, getUserInfo } from "@/lib/appwrite/user";
import HeaderBox from "@/components/HeaderBox";
import AISuggestionCard from "@/components/AISuggestionCard";
import AIChat from "@/components/AIChat";
import LoadingBar from "@/components/LoadingBar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AIInsightsPage() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const isLoadingRef = useRef(false);

  const loadSuggestions = async () => {
    // Prevent multiple simultaneous requests
    if (isLoadingRef.current) {
      return;
    }

    // Increment request counter to track the latest request
    const currentRequestId = ++requestIdRef.current;
    
    try {
      isLoadingRef.current = true;
      setError(null);
      setLoading(true);

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        // Only update state if this is still the latest request
        if (currentRequestId !== requestIdRef.current) {
          return;
        }
        router.push("/sign-in");
        return;
      }

      const userInfo = await getUserInfo(currentUser.$id);
      if (!userInfo) {
        // Only update state if this is still the latest request
        if (currentRequestId !== requestIdRef.current) {
          return;
        }
        router.push("/sign-in");
        return;
      }

      const response = await fetch(`/api/ai/suggestions`, {
        // Add cache control to prevent duplicate requests
        cache: 'no-store',
      });
      const data = await response.json();

      // Only update state if this is still the latest request
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      if (!response.ok) {
        // Handle rate limit errors with better messaging
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait 1-2 minutes before trying again.');
        }
        throw new Error(data.error || "Failed to load suggestions");
      }

      setSuggestions(data.suggestions || []);
      setError(null);
    } catch (error: any) {
      // Only update state if this is still the latest request
      if (currentRequestId !== requestIdRef.current) {
        return;
      }
      
      console.error("Error loading suggestions:", error);
      setError(
        error.message || "Failed to load suggestions. Please try again."
      );
    } finally {
      // Only update loading state if this is still the latest request
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
        isLoadingRef.current = false;
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8">
      <HeaderBox
        type="title"
        title="AI Financial Insights"
        subtext="Get personalized financial advice powered by AI"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-20 font-semibold text-white">
              Personalized Suggestions
            </h2>
            {suggestions.length > 0 && (
              <Button
                onClick={loadSuggestions}
                variant="ghost"
                className="text-14 text-blue-400 hover:text-blue-300"
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
            )}
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 bg-[#001122] rounded-lg shadow-form border border-gray-700">
              <LoadingBar />
              <p className="text-14 text-gray-300">Loading AI insights...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 bg-[#001122] rounded-lg shadow-form border border-gray-700">
              <p className="text-14 text-red-400 text-center">{error}</p>
              <Button
                onClick={loadSuggestions}
                className="form-btn"
                disabled={loading}
              >
                {loading ? "Retrying..." : "Retry"}
              </Button>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 bg-[#001122] rounded-lg shadow-form border border-gray-700">
              <p className="text-14 text-gray-300 text-center mb-2">
                Click the button below to get personalized AI-powered financial insights
              </p>
              <Button
                onClick={loadSuggestions}
                className="form-btn"
                disabled={loading}
              >
                Get AI Insights
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {suggestions.map((suggestion, index) => (
                <AISuggestionCard
                  key={index}
                  suggestion={suggestion}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-20 font-semibold text-white">Chat with AI</h2>
          <AIChat />
        </div>
      </div>
    </div>
  );
}
