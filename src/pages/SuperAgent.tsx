import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Image as ImageIcon, Video, Mic, Paperclip, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  media?: {
    type: "image" | "video" | "audio" | "file";
    url: string;
    name?: string;
  };
}

export default function SuperAgent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ type: string; url: string; file: File } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() && !mediaPreview) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
      media: mediaPreview ? {
        type: mediaPreview.type as any,
        url: mediaPreview.url,
        name: mediaPreview.file.name
      } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setMediaPreview(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      
      if (mediaPreview) {
        formData.append("file", mediaPreview.file);
        formData.append("prompt", input || "Analyze this and provide repair guidance");
      } else {
        formData.append("prompt", input);
      }
      formData.append("mode", "auto");

      const response = await fetch("https://fix-ish-1.onrender.com/ask", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to get response from Fix-ISH");
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || data.message || "I've analyzed your request. Here's what I found...",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Connection Error",
        description: "Could not reach Fix-ISH backend. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setMediaPreview({ type, url, file });
    e.target.value = "";
  };

  const removePreview = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview.url);
      setMediaPreview(null);
    }
  };

  return (
    <div className="superagent-container">
      {/* Header */}
      <header className="sa-header">
        <button
          onClick={() => navigate("/")}
          className="sa-back-button"
        >
          ← Back
        </button>
        <span>Fix-ISH Super Agent</span>
        <div className="text-sm opacity-80">AI Status: Ready</div>
      </header>

      {/* Main Layout */}
      <div className="sa-main">
        {/* Left - Conversation Panel */}
        <div className="sa-chat-panel" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center mb-4">
                <Mic className="w-8 h-8 text-[hsl(var(--primary))]" />
              </div>
              <h2 className="text-xl font-medium mb-2">Ready to Help</h2>
              <p className="opacity-70 max-w-md">
                Send a message, upload an image, or record audio to get started with your repair assistance.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  style={{ animation: "fadein 0.25s ease" }}
                >
                  <div className={`message ${message.role}`}>
                    {message.media && (
                      <div className="mb-2">
                        {message.media.type === "image" && (
                          <img src={message.media.url} alt="Uploaded" className="rounded-lg max-w-full h-auto" />
                        )}
                        {message.media.type === "video" && (
                          <video src={message.media.url} controls className="rounded-lg max-w-full" />
                        )}
                        {message.media.type === "audio" && (
                          <audio src={message.media.url} controls className="w-full" />
                        )}
                        {message.media.type === "file" && (
                          <div className="flex items-center gap-2 p-2 bg-black/5 rounded">
                            <Paperclip className="w-4 h-4" />
                            <span className="text-sm">{message.media.name}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start" style={{ animation: "fadein 0.25s ease" }}>
                  <div className="message ai">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#2A6DF1" }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right - Input Panel */}
        <div className="sa-input-panel">
          <div className="flex-1 flex flex-col justify-end">
            {/* Media Preview */}
            {mediaPreview && (
              <div className="upload-preview mb-4 relative">
                <button
                  onClick={removePreview}
                  className="absolute top-2 right-2 z-10 px-3 py-1 bg-black/50 hover:bg-black/70 rounded text-white text-sm"
                >
                  Remove
                </button>
                {mediaPreview.type === "image" && (
                  <img src={mediaPreview.url} alt="Preview" className="rounded-lg max-h-60 mx-auto" />
                )}
                {mediaPreview.type === "video" && (
                  <video src={mediaPreview.url} controls className="rounded-lg max-h-60 mx-auto" />
                )}
                {mediaPreview.type === "audio" && (
                  <audio src={mediaPreview.url} controls className="w-full" />
                )}
                {mediaPreview.type === "file" && (
                  <div className="flex items-center gap-3 p-4">
                    <Paperclip className="w-6 h-6" style={{ color: "#2A6DF1" }} />
                    <span className="text-sm font-medium">{mediaPreview.file.name}</span>
                  </div>
                )}
              </div>
            )}

            {/* Input Area */}
            <div className="space-y-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe the issue or upload a file..."
                className="w-full h-[120px] rounded-lg p-3 bg-white/5 border border-white/10 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "image")}
                    className="hidden"
                  />
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isLoading}
                    className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50"
                    title="Upload Image"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, "video")}
                    className="hidden"
                  />
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    disabled={isLoading}
                    className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50"
                    title="Upload Video"
                  >
                    <Video className="w-5 h-5" />
                  </button>

                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileChange(e, "audio")}
                    className="hidden"
                  />
                  <button
                    onClick={() => audioInputRef.current?.click()}
                    disabled={isLoading}
                    className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50"
                    title="Upload Audio"
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,*"
                    onChange={(e) => handleFileChange(e, "file")}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50"
                    title="Upload File"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={(!input.trim() && !mediaPreview) || isLoading}
                  className="send-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin inline" />
                  ) : (
                    <>
                      <Send className="w-5 h-5 inline mr-2" />
                      Send to FIX-ISH
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs opacity-60 text-center">
                Press Enter to send • Shift + Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .superagent-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100%;
          background: hsl(var(--background));
          color: hsl(var(--foreground));
        }

        .sa-header {
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 20px;
          font-weight: 700;
          border-bottom: 1px solid hsl(var(--border));
        }

        .sa-back-button {
          cursor: pointer;
          font-size: 15px;
          opacity: 0.8;
          background: none;
          border: none;
          color: inherit;
        }

        .sa-main {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .sa-chat-panel {
          flex: 0 0 70%;
          padding: 20px;
          overflow-y: auto;
        }

        .message {
          max-width: 80%;
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 14px;
          line-height: 1.4;
        }

        .message.user {
          background: hsl(var(--primary) / 0.15);
          margin-left: auto;
        }

        .message.ai {
          background: hsl(var(--muted));
          margin-right: auto;
        }

        .sa-input-panel {
          flex: 0 0 30%;
          border-left: 1px solid hsl(var(--border));
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .upload-preview {
          background: hsl(var(--muted) / 0.5);
          padding: 10px;
          border-radius: 10px;
        }

        .send-button {
          padding: 14px 20px;
          border-radius: 10px;
          background: #2A6DF1;
          text-align: center;
          color: white;
          cursor: pointer;
          font-weight: 600;
          border: none;
          width: auto;
          min-width: 180px;
        }

        @keyframes fadein {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .sa-main {
            flex-direction: column;
          }
          .sa-chat-panel {
            flex: 1;
          }
          .sa-input-panel {
            flex: 0 0 auto;
            border-left: none;
            border-top: 1px solid hsl(var(--border));
          }
        }
      `}</style>
    </div>
  );
}
