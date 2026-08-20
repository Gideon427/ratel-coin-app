"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, Mail, MessageCircle, Book, Headphones, ChevronRight, Send } from "lucide-react";

export default function SupportPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [faqs] = useState([
    {
      id: 1,
      question: "How do I send funds?",
      answer: "Click on the Send button, enter the recipient's address, amount, and confirm the transaction."
    },
    {
      id: 2,
      question: "What is the minimum withdrawal?",
      answer: "The minimum withdrawal amount is 10 RTC."
    },
    {
      id: 3,
      question: "How do I earn rewards?",
      answer: "You can earn rewards by staking, referring friends, and participating in special events."
    },
    {
      id: 4,
      question: "Is my wallet secure?",
      answer: "Yes, your wallet is protected with industry-standard encryption and security measures."
    },
  ]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setIsLoading(false);
  }, [router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim()) {
      alert("Support ticket submitted! We'll get back to you soon.");
      setMessage("");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading support...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Help & Support</h1>

        {/* Support Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="text-red-600" size={24} />
              <h3 className="font-semibold text-gray-900">Email Support</h3>
            </div>
            <p className="text-sm text-gray-500">Get help via email within 24 hours</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="text-red-600" size={24} />
              <h3 className="font-semibold text-gray-900">Live Chat</h3>
            </div>
            <p className="text-sm text-gray-500">Chat with our support team in real-time</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <Book className="text-red-600" size={24} />
              <h3 className="font-semibold text-gray-900">Knowledge Base</h3>
            </div>
            <p className="text-sm text-gray-500">Browse our documentation and guides</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <Headphones className="text-red-600" size={24} />
              <h3 className="font-semibold text-gray-900">Community Forum</h3>
            </div>
            <p className="text-sm text-gray-500">Join our community discussions</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle size={20} className="text-gray-500" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.id} className="group">
                <summary className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <ChevronRight size={18} className="text-gray-400 group-open:rotate-90 transition" />
                </summary>
                <div className="px-4 py-3 text-sm text-gray-600 bg-gray-50 rounded-b-lg border border-t-0 border-gray-200">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Send size={20} className="text-gray-500" />
            Contact Support
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                required
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              <Send size={18} />
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}