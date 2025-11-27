import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Wrench, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface RepairProject {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  last_message_at: string;
}

export default function ChatHistoryPanel() {
  const [projects, setProjects] = useState<RepairProject[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      // Fetch repair projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("repair_projects")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(10);

      if (projectsError) throw projectsError;
      if (projectsData) setProjects(projectsData);

      // Fetch conversations
      const { data: conversationsData, error: conversationsError } = await supabase
        .from("conversations")
        .select("*")
        .order("last_message_at", { ascending: false })
        .limit(10);

      if (conversationsError) throw conversationsError;
      if (conversationsData) setConversations(conversationsData);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="w-full max-w-md space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Repair Projects */}
      {projects.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            Recent Repairs
          </h3>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="p-4 hover:bg-accent/50 cursor-pointer transition-colors group"
                  onClick={() => navigate(`/repair/${project.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {project.title}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            project.status === "completed"
                              ? "bg-green-500/10 text-green-500"
                              : project.status === "in_progress"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {project.status}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(project.updated_at)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Conversations */}
      {conversations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Chats
          </h3>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className="p-4 hover:bg-accent/50 cursor-pointer transition-colors group"
                  onClick={() => navigate(`/chat/${conversation.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {conversation.title}
                      </h4>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                        <Clock className="w-3 h-3" />
                        {formatDate(conversation.last_message_at)}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {projects.length === 0 && conversations.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No chat history yet</p>
          <p className="text-sm mt-2">Start a repair session to see history here</p>
        </div>
      )}
    </div>
  );
}
