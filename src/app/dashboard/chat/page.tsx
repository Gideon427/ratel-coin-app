"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, MessageCircle, Reply, Palette } from "lucide-react";
import { useAccount } from "@/lib/AccountContext";
import io, { Socket } from "socket.io-client";

interface Message {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
  replyTo?: string; // optional – message ID being replied to
}

export default function ChatPage() {
  const router = useRouter();
  const { activeAccount } = useAccount();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [bubbleColor, setBubbleColor] = useState("#dc2626"); // default red
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Ref to always have the latest account ──────────────
  const accountRef = useRef(activeAccount);
  useEffect(() => {
    accountRef.current = activeAccount;
  }, [activeAccount]);

  // ─── Load messages & color from localStorage ──────────────
  useEffect(() => {
    const saved = localStorage.getItem("chat_messages");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {}
    }
    const savedColor = localStorage.getItem("chat_bubble_color");
    if (savedColor) {
      setBubbleColor(savedColor);
    }
  }, []);

  // ─── Save messages & color ──────────────────────────────
  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("chat_bubble_color", bubbleColor);
  }, [bubbleColor]);

  // ─── Socket.io connection ──────────────────────────────
  useEffect(() => {
    const socket = io("http://localhost:3001", {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Chat connected");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Chat disconnected");
    });

    socket.on("chat-message", (data: Message) => {
      const currentAccount = accountRef.current;
      if (data.userId === currentAccount?.address) {
        return; // skip own messages (already added)
      }
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === data.id);
        if (exists) return prev;
        return [...prev, data];
      });
    });

    socket.on("connect_error", (error) => {
      console.error("Socket error:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ─── Send message ──────────────────────────────────────
  const sendMessage = () => {
    if (!input.trim() || !activeAccount) return;

    const uniqueId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const message: Message = {
      id: uniqueId,
      userId: activeAccount.address || "anonymous",
      username: activeAccount.name || "User",
      text: input.trim(),
      timestamp: new Date().toISOString(),
      replyTo: replyTo?.id, // store reply reference
    };

    setMessages((prev) => [...prev, message]);

    if (socketRef.current && isConnected) {
      socketRef.current.emit("chat-message", message);
    }

    setInput("");
    setReplyTo(null);
    inputRef.current?.focus();
  };

  // ─── Scroll to bottom ──────────────────────────────────
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ─── Reply handler ─────────────────────────────────────
  const handleReply = (msg: Message) => {
    setReplyTo(msg);
    inputRef.current?.focus();
  };

  // ─── Cancel reply ──────────────────────────────────────
  const cancelReply = () => {
    setReplyTo(null);
  };

  // ─── Color picker ──────────────────────────────────────
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBubbleColor(e.target.value);
  };

  // ─── Get username display ─────────────────────────────
  const getDisplayName = (msg: Message) => {
    if (msg.userId === activeAccount?.address) return "You";
    return `@${msg.username}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="text-red-600" size={24} />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Community Chat
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Color Picker */}
              <div className="relative flex items-center gap-1">
                <Palette size={18} className="text-gray-500" />
                <input
                  type="color"
                  value={bubbleColor}
                  onChange={handleColorChange}
                  className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-xs text-gray-500">
                  {isConnected ? "Connected" : "Connecting..."}
                </span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                No messages yet. Be the first to say something!
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.userId === activeAccount?.address;
                const replyMsg = msg.replyTo
                  ? messages.find((m) => m.id === msg.replyTo)
                  : null;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? "text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                      }`}
                      style={isOwn ? { backgroundColor: bubbleColor } : {}}
                    >
                      {/* Reply indicator */}
                      {replyMsg && (
                        <div className="text-xs opacity-70 border-l-2 pl-2 mb-1 border-white/30">
                          ↳ Replying to @{replyMsg.username}: {replyMsg.text.slice(0, 30)}...
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold opacity-75">
                            {getDisplayName(msg)}
                          </p>
                          <p className="text-sm break-words">{msg.text}</p>
                        </div>
                        <button
                          onClick={() => handleReply(msg)}
                          className="opacity-40 hover:opacity-100 transition"
                          title="Reply"
                        >
                          <Reply size={16} />
                        </button>
                      </div>
                      <p className="text-xs opacity-50 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply bar */}
          {replyTo && (
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Replying to @{replyTo.username}: {replyTo.text.slice(0, 40)}...
              </span>
              <button
                onClick={cancelReply}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={replyTo ? "Reply..." : "Type a message..."}
                className="flex-1 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition dark:text-white"
              />
              <button
                type="submit"
                disabled={!input.trim() || !activeAccount}
                className="rounded-full bg-red-600 p-3 text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}