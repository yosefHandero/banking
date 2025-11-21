'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, getUserInfo } from '@/lib/appwrite/user';
import HeaderBox from '@/components/HeaderBox';
import AISuggestionCard from '@/components/AISuggestionCard';
import AIChat from '@/components/AIChat';
import { useRouter } from 'next/navigation';

export default function AIInsightsPage() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/sign-in');
        return;
      }

      const userInfo = await getUserInfo(currentUser.$id);
      if (!userInfo) {
        router.push('/sign-in');
        return;
      }

      const response = await fetch(`/api/ai/suggestions`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load suggestions');
      }

      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-16 text-gray-600">Loading AI insights...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <HeaderBox
        type="title"
        title="AI Financial Insights"
        subtext="Get personalized financial advice powered by AI"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-20 font-semibold text-gray-900">Personalized Suggestions</h2>
          {suggestions.length === 0 ? (
            <div className="flex items-center justify-center py-16 bg-white rounded-lg shadow-form">
              <p className="text-14 text-gray-600">No suggestions available</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {suggestions.map((suggestion, index) => (
                <AISuggestionCard key={index} suggestion={suggestion} index={index} />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-20 font-semibold text-gray-900">Chat with AI</h2>
          <AIChat />
        </div>
      </div>
    </div>
  );
}

