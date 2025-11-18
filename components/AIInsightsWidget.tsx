'use client';

import { useState, useEffect } from 'react';
import AISuggestionCard from './AISuggestionCard';
import Link from 'next/link';
import { Button } from './ui/button';

interface AIInsightsWidgetProps {
  userId: string; // Kept for backward compatibility but not used in API call
}

export default function AIInsightsWidget({ userId }: AIInsightsWidgetProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // No dependencies needed - API uses auth

  const loadSuggestions = async () => {
    try {
      // API now uses authentication instead of userId query param
      const response = await fetch('/api/ai/suggestions');
      const data = await response.json();

      if (response.ok) {
        setSuggestions(data.suggestions?.slice(0, 3) || []);
      } else {
        // Handle auth errors gracefully
        if (response.status === 401) {
          console.warn('Unauthorized: User not authenticated');
        }
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-form">
      <div className="flex items-center justify-between">
        <h2 className="text-18 font-semibold text-gray-900">AI Insights</h2>
        <Link href="/ai-insights">
          <Button variant="ghost" className="text-14">
            View All
          </Button>
        </Link>
      </div>
      {loading ? (
        <p className="text-14 text-gray-600">Loading insights...</p>
      ) : suggestions.length === 0 ? (
        <p className="text-14 text-gray-600">No insights available</p>
      ) : (
        <div className="flex flex-col gap-2">
          {suggestions.map((suggestion, index) => (
            <AISuggestionCard key={index} suggestion={suggestion} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

