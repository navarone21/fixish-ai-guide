import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type ModuleType = 'home' | 'agent' | 'live' | 'steps' | 'mesh' | 'scene' | 'diagnostics' | 'task' | 'history' | 'settings';

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
  const [activeModule, setActiveModule] = useState<ModuleType>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ type: string; url: string; file: File } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const startLiveMode = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

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
    <div className={`fixish-os ${theme}-mode`}>
      {/* SIDEBAR */}
      <div className="os-sidebar">
        <h2>Fix-ISH OS</h2>
        
        <div className={`os-nav-btn ${activeModule === 'home' ? 'active' : ''}`} onClick={() => setActiveModule('home')}>
          🏠 Home
        </div>
        <div className={`os-nav-btn ${activeModule === 'agent' ? 'active' : ''}`} onClick={() => setActiveModule('agent')}>
          🤖 Super Agent
        </div>
        <div className={`os-nav-btn ${activeModule === 'live' ? 'active' : ''}`} onClick={() => setActiveModule('live')}>
          📹 Live AI Repair
        </div>
        <div className={`os-nav-btn ${activeModule === 'steps' ? 'active' : ''}`} onClick={() => setActiveModule('steps')}>
          📝 Steps Library
        </div>
        <div className={`os-nav-btn ${activeModule === 'mesh' ? 'active' : ''}`} onClick={() => setActiveModule('mesh')}>
          🧩 3D Mesh Viewer
        </div>
        <div className={`os-nav-btn ${activeModule === 'scene' ? 'active' : ''}`} onClick={() => setActiveModule('scene')}>
          🌐 Scene Graph
        </div>
        <div className={`os-nav-btn ${activeModule === 'diagnostics' ? 'active' : ''}`} onClick={() => setActiveModule('diagnostics')}>
          ⚠️ Diagnostics
        </div>
        <div className={`os-nav-btn ${activeModule === 'task' ? 'active' : ''}`} onClick={() => setActiveModule('task')}>
          🔗 Task Graph
        </div>
        <div className={`os-nav-btn ${activeModule === 'history' ? 'active' : ''}`} onClick={() => setActiveModule('history')}>
          📚 Project History
        </div>
        <div className={`os-nav-btn ${activeModule === 'settings' ? 'active' : ''}`} onClick={() => setActiveModule('settings')}>
          ⚙️ Settings
        </div>
      </div>

      {/* MAIN PANEL */}
      <div className="os-main">
        {/* HOME MODULE */}
        {activeModule === 'home' && (
          <div className="module">
            <h1>Welcome to Fix-ISH OS</h1>
            <p>Your full AI-powered repair operating system.</p>
            <br />
            <h3>Quick Start</h3>
            <div className="step-card">Start a new repair with the Super Agent</div>
            <div className="step-card">Upload a photo or video in the Agent tab</div>
            <div className="step-card">Use Live Mode for real-time guidance</div>
            <br />
            <h3>Recent Projects</h3>
            <div id="recent-projects" className="text-sm opacity-70">No recent projects</div>
          </div>
        )}

        {/* SUPER AGENT MODULE */}
        {activeModule === 'agent' && (
          <div className="module">
            <h1>Super Agent</h1>
            <p>Full multimodal chat + analysis.</p>
            <br />
            <div className="agent-chat-container" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="text-center py-12 opacity-70">
                  <p>Send a message or upload a file to start.</p>
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
                    <div className="flex justify-start">
                      <div className="message ai">Thinking...</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <br />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the issue or upload a file..."
              className="w-full h-24 rounded-lg p-3 border border-white/10 resize-none"
              style={{ background: 'rgba(255,255,255,0.05)' }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="flex gap-2 mt-3">
              <input ref={imageInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, "image")} className="hidden" />
              <button onClick={() => imageInputRef.current?.click()} className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5">
                📷 Image
              </button>
              <input ref={videoInputRef} type="file" accept="video/*" onChange={(e) => handleFileChange(e, "video")} className="hidden" />
              <button onClick={() => videoInputRef.current?.click()} className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5">
                🎥 Video
              </button>
              <button
                onClick={handleSendMessage}
                disabled={(!input.trim() && !mediaPreview) || isLoading}
                className="send-button ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send to FIX-ISH
              </button>
            </div>
          </div>
        )}

        {/* LIVE AI REPAIR MODULE */}
        {activeModule === 'live' && (
          <div className="module">
            <h1>Live AI Repair</h1>
            <video ref={videoRef} autoPlay className="live-video" />
            <div id="ar-container" className="ar-container"></div>
            <button onClick={startLiveMode} className="mt-4 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              Start Live Mode
            </button>
          </div>
        )}

        {/* STEPS LIBRARY MODULE */}
        {activeModule === 'steps' && (
          <div className="module">
            <h1>Steps Library</h1>
            <div id="steps-list" className="text-sm opacity-70">No steps available</div>
          </div>
        )}

        {/* MESH VIEWER MODULE */}
        {activeModule === 'mesh' && (
          <div className="module">
            <h1>3D Mesh Viewer</h1>
            <canvas id="mesh-canvas" className="mesh-canvas"></canvas>
          </div>
        )}

        {/* SCENE GRAPH MODULE */}
        {activeModule === 'scene' && (
          <div className="module">
            <h1>Scene Graph</h1>
            <div id="scene-tree" className="text-sm opacity-70">No scene data available</div>
          </div>
        )}

        {/* DIAGNOSTICS MODULE */}
        {activeModule === 'diagnostics' && (
          <div className="module">
            <h1>Diagnostics</h1>
            <div id="diagnostics-panel" className="text-sm opacity-70">System status: Normal</div>
          </div>
        )}

        {/* TASK GRAPH MODULE */}
        {activeModule === 'task' && (
          <div className="module">
            <h1>Task Graph</h1>
            <div id="task-graph-container" className="text-sm opacity-70">No active tasks</div>
          </div>
        )}

        {/* HISTORY MODULE */}
        {activeModule === 'history' && (
          <div className="module">
            <h1>Project History</h1>
            <div id="history-list" className="text-sm opacity-70">No history available</div>
          </div>
        )}

        {/* SETTINGS MODULE */}
        {activeModule === 'settings' && (
          <div className="module">
            <h1>Settings</h1>
            <button onClick={toggleTheme} className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              Toggle Light/Dark Mode
            </button>
            <br /><br />
            <button onClick={() => navigate("/")} className="px-6 py-3 rounded-lg border border-white/10 hover:bg-white/5">
              ← Back to Landing Page
            </button>
          </div>
        )}
      </div>

      <style>{`
        .fixish-os {
          display: flex;
          height: 100vh;
          width: 100%;
          overflow: hidden;
        }

        .light-mode {
          background: #FFFFFF;
          color: #0B0F19;
        }

        .dark-mode {
          background: #0B0F19;
          color: #F5F8FF;
        }

        .os-sidebar {
          width: 260px;
          padding: 18px;
          border-right: 1px solid rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
        }

        .light-mode .os-sidebar {
          background: #F5F7FA;
        }

        .dark-mode .os-sidebar {
          background: #111623;
          border-right: 1px solid rgba(255,255,255,0.1);
        }

        .os-sidebar h2 {
          font-size: 20px;
          margin-bottom: 24px;
          font-weight: 700;
        }

        .os-nav-btn {
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          font-size: 15px;
        }

        .os-nav-btn:hover {
          background: rgba(0,0,0,0.05);
        }

        .dark-mode .os-nav-btn:hover {
          background: rgba(255,255,255,0.08);
        }

        .os-nav-btn.active {
          background: #2A6DF1;
          color: white;
        }

        .os-main {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
        }

        .light-mode .os-main {
          background: #FFFFFF;
        }

        .dark-mode .os-main {
          background: #161B26;
        }

        .module {
          display: block;
        }

        .step-card {
          background: rgba(0, 110, 255, 0.08);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 10px;
        }

        .message {
          max-width: 80%;
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 14px;
          line-height: 1.4;
        }

        .light-mode .message.user {
          background: #E8F0FF;
          color: #0B0F19;
        }

        .dark-mode .message.user {
          background: #1F2A3C;
          color: #F5F8FF;
        }

        .light-mode .message.ai {
          background: #DDEBFF;
          color: #0B0F19;
        }

        .dark-mode .message.ai {
          background: #2A3547;
          color: #F5F8FF;
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
        }

        .live-video {
          width: 100%;
          border-radius: 10px;
          background: #000;
          max-height: 400px;
        }

        .ar-container {
          width: 100%;
          height: 400px;
          background: #000000;
          border-radius: 10px;
          margin-top: 16px;
        }

        .mesh-canvas {
          width: 100%;
          height: 400px;
          border-radius: 10px;
          background: #0D0D14;
        }

        .agent-chat-container {
          max-height: 500px;
          overflow-y: auto;
        }

        @keyframes fadein {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .fixish-os {
            flex-direction: column;
          }
          .os-sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid rgba(0,0,0,0.1);
          }
        }
      `}</style>
    </div>
  );
}
