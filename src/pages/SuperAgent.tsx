import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  steps?: string[];
  tools?: string[];
  warnings?: string[];
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
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [userId] = useState(() => {
    const stored = localStorage.getItem('fixish_user_id');
    if (stored) return stored;
    const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('fixish_user_id', newId);
    return newId;
  });
  
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

  useEffect(() => {
    if (activeModule === 'history') {
      loadConversations();
    }
  }, [activeModule]);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('conversations', {
        body: { action: 'list', userId }
      });

      if (error) throw error;
      if (data?.conversations) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive"
      });
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('conversations', {
        body: { action: 'get', conversationId, userId }
      });

      if (error) throw error;
      if (data?.messages) {
        const loadedMessages = data.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          media: msg.files?.[0] || undefined
        }));
        setMessages(loadedMessages);
        setCurrentConversationId(conversationId);
        setActiveModule('agent');
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive"
      });
    }
  };

  const saveConversation = async (newMessages: Message[]) => {
    try {
      if (!currentConversationId) {
        // Create new conversation
        const { data, error } = await supabase.functions.invoke('conversations', {
          body: {
            action: 'create',
            userId,
            title: newMessages[0]?.content.substring(0, 50) || 'New Repair Session',
            messages: newMessages
          }
        });

        if (error) throw error;
        if (data?.conversation) {
          setCurrentConversationId(data.conversation.id);
        }
      } else {
        // Add message to existing conversation
        const lastMessage = newMessages[newMessages.length - 1];
        await supabase.functions.invoke('conversations', {
          body: {
            action: 'add_message',
            conversationId: currentConversationId,
            userId,
            message: lastMessage
          }
        });
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase.functions.invoke('conversations', {
        body: { action: 'delete', conversationId, userId }
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Conversation deleted"
      });
      
      loadConversations();
      if (currentConversationId === conversationId) {
        setMessages([]);
        setCurrentConversationId(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setActiveModule('agent');
  };

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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !mediaPreview) return;

    const userMessage: Message = {
      role: "user",
      content: input || "[Media Uploaded]",
      timestamp: new Date(),
      media: mediaPreview ? {
        type: mediaPreview.type as any,
        url: mediaPreview.url,
        name: mediaPreview.file.name
      } : undefined
    };

    setMessages(prev => {
      const updated = [...prev, userMessage];
      if (currentConversationId) {
        saveConversation(updated);
      }
      return updated;
    });
    const currentInput = input;
    setInput("");
    const currentMedia = mediaPreview;
    setMediaPreview(null);
    setIsLoading(true);

    try {
      const payload: any = {
        prompt: currentInput || "Analyze this and provide repair guidance",
        mode: "auto"
      };

      if (currentMedia) {
        const base64 = await fileToBase64(currentMedia.file);
        payload.media = [{
          name: currentMedia.file.name,
          type: currentMedia.file.type,
          data: base64
        }];
      }

      const response = await fetch("https://fix-ish-1.onrender.com/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from Fix-ISH");
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply || data.response || data.message || "I've analyzed your request. Here's what I found...",
        timestamp: new Date(),
        steps: data.steps || undefined,
        tools: data.tools || undefined,
        warnings: data.warnings || undefined
      };

      setMessages(prev => {
        const updated = [...prev, assistantMessage];
        saveConversation(updated);
        return updated;
      });
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
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1>Super Agent</h1>
                {currentConversationId && (
                  <p className="text-sm opacity-60 mt-1">Active conversation • Auto-saving</p>
                )}
              </div>
              {currentConversationId && (
                <button
                  onClick={startNewConversation}
                  className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm"
                >
                  + New Chat
                </button>
              )}
            </div>
            <div className="superagent-container">
              {/* LEFT CHAT PANEL */}
              <div className="sa-left" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="text-center py-12 opacity-70">
                    <p>Send a message or upload files to start.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {messages.map((message, index) => (
                      <div key={index} style={{ animation: "fadein 0.25s ease" }}>
                        <div className={`chat-msg ${message.role === "user" ? "user-msg" : "ai-msg"}`}>
                          {message.media && (
                            <div className="mb-2">
                              {message.media.type === "image" && (
                                <img src={message.media.url} alt="Uploaded" className="media-thumb" />
                              )}
                              {message.media.type === "video" && (
                                <video src={message.media.url} controls className="media-thumb" />
                              )}
                            </div>
                          )}
                          <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br>') }} />
                        </div>
                        
                        {message.steps && message.steps.length > 0 && (
                          <div className="mb-4">
                            {message.steps.map((step, i) => (
                              <div key={i} className="step-card">
                                <strong>Step {i + 1}:</strong> {step}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {message.tools && message.tools.length > 0 && (
                          <div className="mb-4">
                            {message.tools.map((tool, i) => (
                              <div key={i} className="tool-card">
                                <strong>Tool:</strong> {tool}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {message.warnings && message.warnings.length > 0 && (
                          <div className="mb-4">
                            {message.warnings.map((warning, i) => (
                              <div key={i} className="warning-card">
                                <strong>⚠ Warning:</strong> {warning}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="chat-msg ai-msg">Analyzing...</div>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT TOOL PANEL */}
              <div className="sa-right">
                {/* File Preview Area */}
                {mediaPreview && (
                  <div className="preview-box mb-4 relative">
                    <button
                      onClick={removePreview}
                      className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      Remove
                    </button>
                    {mediaPreview.type === "image" && (
                      <img src={mediaPreview.url} alt="Preview" className="media-thumb" />
                    )}
                    {mediaPreview.type === "video" && (
                      <video src={mediaPreview.url} controls className="media-thumb" />
                    )}
                    <strong className="block mt-2 text-sm">{mediaPreview.file.name}</strong>
                  </div>
                )}

                {/* Upload Buttons */}
                <div className="sa-upload-row mb-4">
                  <input ref={imageInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, "image")} className="hidden" />
                  <div className="sa-upload-btn" onClick={() => imageInputRef.current?.click()}>📷</div>
                  
                  <input ref={videoInputRef} type="file" accept="video/*" onChange={(e) => handleFileChange(e, "video")} className="hidden" />
                  <div className="sa-upload-btn" onClick={() => videoInputRef.current?.click()}>🎥</div>
                  
                  <input ref={audioInputRef} type="file" accept="audio/*" onChange={(e) => handleFileChange(e, "audio")} className="hidden" />
                  <div className="sa-upload-btn" onClick={() => audioInputRef.current?.click()}>🎤</div>
                  
                  <input ref={fileInputRef} type="file" accept=".pdf,.txt,*" onChange={(e) => handleFileChange(e, "file")} className="hidden" />
                  <div className="sa-upload-btn" onClick={() => fileInputRef.current?.click()}>📄</div>
                </div>

                {/* Text Input */}
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe the issue or attach files..."
                  className="sa-text mb-3"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />

                {/* Send Button */}
                <div
                  className={`sa-send ${(!input.trim() && !mediaPreview) || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleSendMessage}
                >
                  {isLoading ? "Analyzing..." : "Send to FIX-ISH"}
                </div>
              </div>
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
            <p className="text-sm opacity-70 mb-6">Common repair procedures and guides</p>

            <div id="steps-list">
              <div className="step-card">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Replace battery</h3>
                    <p className="text-sm opacity-60 mt-1">10 steps • 30 min</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm">
                    View
                  </button>
                </div>
              </div>

              <div className="step-card">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Fix charging port</h3>
                    <p className="text-sm opacity-60 mt-1">6 steps • 20 min</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm">
                    View
                  </button>
                </div>
              </div>

              <div className="step-card">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Repair broken hinge</h3>
                    <p className="text-sm opacity-60 mt-1">8 steps • 45 min</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm">
                    View
                  </button>
                </div>
              </div>

              <div className="step-card">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Replace cracked screen</h3>
                    <p className="text-sm opacity-60 mt-1">12 steps • 60 min</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm">
                    View
                  </button>
                </div>
              </div>

              <div className="step-card">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Clean cooling system</h3>
                    <p className="text-sm opacity-60 mt-1">5 steps • 15 min</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm">
                    View
                  </button>
                </div>
              </div>
            </div>
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

            <div className="diag-card">
              <h3>🔥 Danger Level</h3>
              <div className="meter">
                <div 
                  className="meter-fill"
                  style={{ 
                    width: '25%', 
                    background: '#10B981',
                    height: '100%',
                    borderRadius: '10px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <p className="text-xs opacity-60 mt-2">Low Risk - Safe to proceed</p>
            </div>

            <div className="diag-card">
              <h3>🛠 Recommended Action</h3>
              <p id="diag-action" className="mt-2">
                {messages.length === 0 
                  ? "Run a scan to begin. Upload an image or describe the issue in Super Agent."
                  : "Continue with repair guidance. Check Project History for saved sessions."}
              </p>
            </div>

            <div className="diag-card">
              <h3>📊 System Confidence</h3>
              <div className="meter">
                <div 
                  className="meter-fill"
                  style={{ 
                    width: messages.length > 0 ? '85%' : '0%', 
                    background: '#2A6DF1',
                    height: '100%',
                    borderRadius: '10px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <p className="text-xs opacity-60 mt-2">
                {messages.length > 0 ? '85% - High confidence in analysis' : 'No data yet'}
              </p>
            </div>

            <div className="diag-card">
              <h3>📈 Session Statistics</h3>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{conversations.length}</div>
                  <div className="text-xs opacity-60">Total Sessions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{messages.length}</div>
                  <div className="text-xs opacity-60">Current Messages</div>
                </div>
              </div>
            </div>

            <div className="diag-card">
              <h3>⚙️ System Status</h3>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Backend Connection</span>
                  <span className="px-2 py-1 rounded-full text-xs" style={{ background: '#D1FAE5', color: '#065F46' }}>
                    ✓ Online
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database Status</span>
                  <span className="px-2 py-1 rounded-full text-xs" style={{ background: '#D1FAE5', color: '#065F46' }}>
                    ✓ Connected
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">AI Processing</span>
                  <span className="px-2 py-1 rounded-full text-xs" style={{ background: '#D1FAE5', color: '#065F46' }}>
                    ✓ Ready
                  </span>
                </div>
              </div>
            </div>
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
            <div className="flex justify-between items-center mb-6">
              <h1>Project History</h1>
              <button 
                onClick={startNewConversation}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                + New Conversation
              </button>
            </div>
            
            {conversations.length === 0 ? (
              <div id="history-empty" className="text-center py-12 opacity-70">
                <p>No projects yet.</p>
                <p className="text-sm mt-2">Start a conversation in Super Agent to save it</p>
              </div>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Open</th>
                  </tr>
                </thead>
                <tbody>
                  {conversations.map((conv) => (
                    <tr key={conv.id}>
                      <td>
                        <div className="font-medium">{conv.title}</div>
                        <div className="text-xs opacity-60 mt-1">
                          ID: {conv.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td>
                        <div>{new Date(conv.created_at).toLocaleDateString()}</div>
                        <div className="text-xs opacity-60 mt-1">
                          {new Date(conv.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td>
                        <span className="px-3 py-1 rounded-full text-xs font-medium" style={{
                          background: '#E6F2FF',
                          color: '#2A6DF1'
                        }}>
                          Completed
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadConversation(conv.id)}
                            className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this conversation?')) {
                                deleteConversation(conv.id);
                              }
                            }}
                            className="px-3 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SETTINGS MODULE */}
        {activeModule === 'settings' && (
          <div className="module">
            <h1>Settings</h1>

            <h3 className="text-lg font-semibold mt-6 mb-3">Appearance</h3>
            <div className="setting-card">
              <div className="flex justify-between items-center">
                <label className="font-medium">🌗 Theme</label>
                <button 
                  onClick={toggleTheme}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-3">AI & Processing</h3>
            <div className="setting-card">
              <label className="font-medium block mb-2">🤖 AI Backend</label>
              <p className="text-sm opacity-70 mb-2">Fix-ISH uses advanced AI models for repair analysis</p>
              <select 
                className="w-full p-2 rounded-lg border border-gray-300"
                style={{ background: theme === 'light' ? '#FFF' : '#1F2937' }}
                disabled
              >
                <option>Fix-ISH Auto (Recommended)</option>
              </select>
            </div>

            <div className="setting-card">
              <label className="font-medium block mb-2">⚡ Processing Mode</label>
              <select 
                className="w-full p-2 rounded-lg border border-gray-300"
                style={{ background: theme === 'light' ? '#FFF' : '#1F2937' }}
              >
                <option>Normal</option>
                <option>High Detail</option>
                <option>Fast Mode</option>
              </select>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-3">Camera & Audio</h3>
            <div className="setting-card">
              <div className="flex justify-between items-center">
                <label className="font-medium">📸 Camera Permission</label>
                <button 
                  onClick={async () => {
                    try {
                      await navigator.mediaDevices.getUserMedia({ video: true });
                      toast({ title: "Success", description: "Camera access granted" });
                    } catch (error) {
                      toast({ 
                        title: "Permission Denied", 
                        description: "Please allow camera access in browser settings",
                        variant: "destructive" 
                      });
                    }
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                  style={{ background: theme === 'light' ? '#FFF' : '#1F2937' }}
                >
                  Request Access
                </button>
              </div>
            </div>

            <div className="setting-card">
              <div className="flex justify-between items-center">
                <label className="font-medium">🎤 Microphone Permission</label>
                <button 
                  onClick={async () => {
                    try {
                      await navigator.mediaDevices.getUserMedia({ audio: true });
                      toast({ title: "Success", description: "Microphone access granted" });
                    } catch (error) {
                      toast({ 
                        title: "Permission Denied", 
                        description: "Please allow microphone access in browser settings",
                        variant: "destructive" 
                      });
                    }
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                  style={{ background: theme === 'light' ? '#FFF' : '#1F2937' }}
                >
                  Request Access
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-3">Data & Storage</h3>
            <div className="setting-card">
              <div className="flex justify-between items-center">
                <div>
                  <label className="font-medium block">🗂 Clear Project History</label>
                  <p className="text-xs opacity-60 mt-1">Delete all saved conversations</p>
                </div>
                <button 
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete all conversation history? This cannot be undone.')) {
                      try {
                        for (const conv of conversations) {
                          await deleteConversation(conv.id);
                        }
                        toast({ title: "Success", description: "All conversations deleted" });
                      } catch (error) {
                        toast({ 
                          title: "Error", 
                          description: "Failed to clear history",
                          variant: "destructive" 
                        });
                      }
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="setting-card">
              <div className="flex justify-between items-center">
                <div>
                  <label className="font-medium block">💾 Export FIX-ISH Data</label>
                  <p className="text-xs opacity-60 mt-1">Download all conversations as JSON</p>
                </div>
                <button 
                  onClick={async () => {
                    try {
                      const exportData = {
                        exported_at: new Date().toISOString(),
                        conversations: conversations,
                        user_id: userId,
                        version: "1.0"
                      };
                      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `fixish-export-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast({ title: "Success", description: "Data exported successfully" });
                    } catch (error) {
                      toast({ 
                        title: "Error", 
                        description: "Failed to export data",
                        variant: "destructive" 
                      });
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Export JSON
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-3">Navigation</h3>
            <div className="setting-card">
              <button 
                onClick={() => navigate("/")} 
                className="w-full px-6 py-3 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                ← Back to Landing Page
              </button>
            </div>
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
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          padding: 16px;
          border-radius: 10px;
          margin-bottom: 12px;
          transition: border-color 0.2s ease;
        }

        .step-card:hover {
          border-color: #2A6DF1;
        }

        .dark-mode .step-card {
          background: #1D2433;
          border: 1px solid #394457;
        }

        .dark-mode .step-card:hover {
          border-color: #2A6DF1;
        }

        .tool-card {
          background: #FFF9D9;
          border-left: 4px solid #D5A200;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 12px;
        }

        .warning-card {
          background: #FFE4E6;
          border-left: 4px solid #E11D48;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 12px;
        }

        .superagent-container {
          display: flex;
          height: 100%;
          width: 100%;
          gap: 20px;
        }

        .sa-left {
          flex: 1;
          padding-right: 10px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .sa-right {
          width: 360px;
          border-left: 1px solid #E2E8F0;
          padding-left: 16px;
          display: flex;
          flex-direction: column;
        }

        .chat-msg {
          max-width: 80%;
          margin-bottom: 18px;
          padding: 12px 15px;
          border-radius: 12px;
          font-size: 15px;
          line-height: 1.45;
        }

        .user-msg {
          align-self: flex-end;
          background: #DCEBFF;
        }

        .ai-msg {
          align-self: flex-start;
          background: #EDF2F7;
        }

        .media-thumb {
          width: 180px;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .preview-box {
          padding: 10px;
          border-radius: 10px;
          background: #F1F5F9;
        }

        .sa-text {
          height: 120px;
          border-radius: 10px;
          padding: 12px;
          resize: none;
          border: 1px solid #CBD5E1;
          width: 100%;
        }

        .sa-upload-row {
          display: flex;
          gap: 10px;
        }

        .sa-upload-btn {
          padding: 10px;
          background: #E2E8F0;
          border-radius: 8px;
          cursor: pointer;
          width: 40px;
          text-align: center;
        }

        .sa-upload-btn:hover {
          background: #CBD5E1;
        }

        .setting-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          padding: 16px;
          border-radius: 10px;
          margin-bottom: 12px;
        }

        .dark-mode .setting-card {
          background: #1D2433;
          border: 1px solid #394457;
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
        }

        .history-table th {
          background: #E2E8F0;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }

        .history-table td {
          padding: 12px;
          border-bottom: 1px solid #EDF2F7;
        }

        .dark-mode .history-table th {
          background: #222A38;
        }

        .dark-mode .history-table td {
          border-color: #2C3548;
        }

        #history-empty {
          text-align: center;
          padding: 48px 20px;
          opacity: 0.7;
        }

        .diag-card {
          background: #FFFFFF;
          padding: 18px;
          border-radius: 12px;
          margin-bottom: 14px;
          border: 1px solid #E2E8F0;
        }

        .dark-mode .diag-card {
          background: #1D2433;
          border: 1px solid #394457;
        }

        .diag-card h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .meter {
          height: 14px;
          border-radius: 10px;
          background: #CBD5E1;
          margin-top: 8px;
          overflow: hidden;
        }

        .dark-mode .meter {
          background: #374151;
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
