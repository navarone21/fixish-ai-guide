import { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, Video, Paperclip, Loader2, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { sendChat, analyzeImage, analyzeVideo, detectImage } from "@/lib/api";
import { useDetection } from "@/hooks/useDetection";
import OverlayCanvas from "@/components/OverlayCanvas";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
  videoUrl?: string;
  detections?: any[];
}

export default function Chat() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Welcome to Fix-ISH AI Assistant! I'm here to help you diagnose and repair issues. Upload a photo or video, or just describe what you need help with.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { loading: detectionLoading, detections, imageSrc, runDetection } = useDetection();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Run detection
      runDetection(file);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const clearVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
  };

  const handleSend = async () => {
    if ((!input.trim() && !imageFile && !videoFile) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim() || "Analyzing uploaded media...",
      timestamp: new Date(),
      imageUrl: imagePreview || undefined,
      videoUrl: videoPreview || undefined,
      detections: detections || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Show typing indicator
    const typingId = Date.now().toString() + "-typing";
    setMessages((prev) => [
      ...prev,
      {
        id: typingId,
        role: "assistant",
        content: "...",
        timestamp: new Date(),
      },
    ]);

    try {
      let response = "";

      if (imageFile) {
        response = await analyzeImage(imageFile);
        clearImage();
      } else if (videoFile) {
        response = await analyzeVideo(videoFile);
        clearVideo();
      } else {
        response = await sendChat(input.trim());
      }

      // Remove typing indicator and add real response
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== typingId);
        return [
          ...filtered,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: response,
            timestamp: new Date(),
          },
        ];
      });
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => prev.filter((m) => m.id !== typingId));
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              aria-label="Back to home"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Fix-ISH AI Assistant</h1>
              <p className="text-sm text-muted-foreground">Your intelligent repair companion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="container mx-auto max-w-4xl space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border shadow-soft"
                }`}
              >
                {message.imageUrl && (
                  <div className="mb-4">
                    {message.detections ? (
                      <OverlayCanvas imageSrc={message.imageUrl} detections={message.detections} />
                    ) : (
                      <img
                        src={message.imageUrl}
                        alt="Uploaded"
                        className="rounded-lg max-w-full h-auto border border-border"
                      />
                    )}
                  </div>
                )}
                {message.videoUrl && (
                  <div className="mb-4">
                    <video
                      src={message.videoUrl}
                      controls
                      className="rounded-lg max-w-full h-auto border border-border"
                    />
                  </div>
                )}
                <p className={`whitespace-pre-wrap ${message.role === "assistant" ? "text-foreground" : ""}`}>
                  {message.content === "..." ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Thinking...
                    </span>
                  ) : (
                    message.content
                  )}
                </p>
                <p className={`text-xs mt-2 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card shadow-soft">
        <div className="container mx-auto max-w-4xl px-6 py-4">
          {/* File Previews */}
          {(imagePreview || videoPreview) && (
            <div className="mb-4 flex gap-4">
              {imagePreview && (
                <div className="relative">
                  {detectionLoading ? (
                    <div className="w-32 h-32 rounded-lg border border-border bg-muted flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : detections ? (
                    <div className="w-32 h-32 rounded-lg border border-primary overflow-hidden">
                      <OverlayCanvas imageSrc={imageSrc} detections={detections} />
                    </div>
                  ) : (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-border"
                    />
                  )}
                  <button
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              {videoPreview && (
                <div className="relative">
                  <video
                    src={videoPreview}
                    className="w-32 h-32 object-cover rounded-lg border border-border"
                  />
                  <button
                    onClick={clearVideo}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    aria-label="Remove video"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Input Controls */}
          <div className="flex items-end gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoSelect}
              accept="video/*"
              className="hidden"
            />

            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || !!videoFile}
              aria-label="Upload image"
            >
              <ImageIcon size={20} />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => videoInputRef.current?.click()}
              disabled={isLoading || !!imageFile}
              aria-label="Upload video"
            >
              <Video size={20} />
            </Button>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the issue or ask a question..."
              className="flex-1 min-h-[60px] max-h-[200px] resize-none"
              disabled={isLoading}
            />

            <Button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !imageFile && !videoFile)}
              size="lg"
              className="h-[60px]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
