"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDemo } from "@/lib/demo/demoContext";

export default function AIChat() {
  const { isDemoMode } = useDemo();
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "ai"; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    const userMessageObj = { role: "user" as const, content: userMessage };
    setMessages((prev) => [...prev, userMessageObj]);
    setLoading(true);

    // In demo mode, provide demo responses
    if (isDemoMode) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
      const demoResponses = [
        "Based on your demo account, I can see you have 3 bank accounts with a total balance of approximately $45,000. Your spending patterns show you're doing well with budgeting!",
        "I notice you have a savings goal for a new car. You're currently at 34% of your target. Consider setting up automatic transfers to accelerate your progress.",
        "Your transaction history shows consistent spending on groceries and dining. To optimize, consider meal planning to reduce dining expenses by 20-30%.",
        "You have a good mix of checking and savings accounts. I'd recommend keeping 3-6 months of expenses in your emergency fund, which you're well on your way to achieving.",
      ];
      const randomResponse =
        demoResponses[Math.floor(Math.random() * demoResponses.length)];
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: `[Demo Mode] ${randomResponse}` },
      ]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to get AI response";
      toast.error(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-[500px] bg-[#001122] rounded-lg shadow-form p-4 border border-gray-700">
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar scroll-container flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-14 text-gray-300">
              Ask me anything about your finances!
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-bankGradient text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                <p className="text-14">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-14 text-gray-300">Thinking...</p>
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
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask a financial question..."
          className="input-class flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="form-btn"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
