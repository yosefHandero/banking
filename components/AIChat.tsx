'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AIChatProps {
  userId: string;
}

export default function AIChat({ userId }: AIChatProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setMessages((prev) => [...prev, { role: 'ai', content: data.response }]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-[500px] bg-white rounded-lg shadow-form p-4">
      <div className="flex-1 overflow-y-auto flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-14 text-gray-600">
              Ask me anything about your finances!
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-bankGradient text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-14">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-14 text-gray-600">Thinking...</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask a financial question..."
          className="input-class flex-1"
        />
        <Button onClick={handleSend} disabled={loading || !input.trim()} className="form-btn">
          Send
        </Button>
      </div>
    </div>
  );
}

