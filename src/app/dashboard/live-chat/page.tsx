"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";

export default function LiveChatPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<Array<{ from: string; message: string }>>([
    { from: "Support", message: "Hi there! How can we help you today?" },
  ]);

  useEffect(() => {
    if (!localStorage.getItem("isLoggedIn")) {
      router.push("/login");
    }
  }, [router]);

  const handleSend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;

    setChatLog((prev) => [...prev, { from: "You", message: message.trim() }]);
    setMessage("");

    setTimeout(() => {
      setChatLog((prev) => [...prev, { from: "Support", message: "Thanks! A support agent will join shortly." }]);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Live Chat</h1>
              <p className="mt-1 text-sm text-gray-500">Chat with support and get help right away.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 mb-6 max-h-[460px] overflow-y-auto space-y-3">
            {chatLog.map((entry, index) => (
              <div key={index} className={`rounded-2xl p-4 ${entry.from === "You" ? "bg-red-600 text-white ml-auto max-w-[80%]" : "bg-white text-gray-900 max-w-[80%]"}`}>
                <p className="text-xs uppercase tracking-[0.12em] text-gray-400 mb-1">{entry.from}</p>
                <p>{entry.message}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex flex-col sm:flex-row gap-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-3xl border border-gray-300 bg-white px-4 py-3 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
            />
            <button
              type="submit"
              className="rounded-3xl bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700 transition"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
