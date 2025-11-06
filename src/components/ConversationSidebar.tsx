import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, MessageSquare, Share2, X, Menu, Archive, Trash2, ChevronLeft, ChevronRight, Flag, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  archived?: boolean;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onArchiveConversation?: (id: string) => void;
  onShareConversation?: (id: string) => void;
  isDarkMode: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ConversationSidebar = ({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onArchiveConversation,
  onShareConversation,
  isDarkMode,
  isCollapsed = false,
  onToggleCollapse,
}: ConversationSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const { toast } = useToast();

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArchiveFilter = showArchived ? conv.archived : !conv.archived;
    return matchesSearch && matchesArchiveFilter;
  });

  const handleShare = (conv: Conversation) => {
    const shareText = `Check out this conversation: ${conv.title}`;
    const shareUrl = `${window.location.origin}/chat?id=${conv.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: conv.title,
        text: shareText,
        url: shareUrl,
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Conversation link copied to clipboard",
        });
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Conversation link copied to clipboard",
      });
    }
    onShareConversation?.(conv.id);
  };

  const handleArchive = (conv: Conversation) => {
    onArchiveConversation?.(conv.id);
    toast({
      title: conv.archived ? "Unarchived" : "Archived",
      description: `Conversation ${conv.archived ? "restored" : "archived"}`,
    });
  };

  const handleReport = (conv: Conversation) => {
    toast({
      title: "Report submitted",
      description: "Thank you for your feedback",
    });
  };

  const sidebarBg = isDarkMode
    ? "rgba(26, 28, 30, 0.95)"
    : "rgba(255, 255, 255, 0.95)";
  const borderColor = isDarkMode
    ? "rgba(0, 194, 178, 0.2)"
    : "rgba(0, 194, 178, 0.3)";
  const textColor = isDarkMode ? "#EAEAEA" : "#1A1C1E";
  const mutedColor = "#999999";

  if (isCollapsed) {
    return (
      <motion.div
        initial={false}
        animate={{ width: 60 }}
        className="h-full backdrop-blur-xl border-r flex flex-col items-center py-4 gap-4"
        style={{
          background: sidebarBg,
          borderColor: borderColor,
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          title="Expand sidebar"
        >
          <ChevronRight className="w-5 h-5" style={{ color: "#00C2B2" }} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          title="New chat"
        >
          <Plus className="w-5 h-5" style={{ color: "#00C2B2" }} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowArchived(!showArchived)}
          title="Toggle archived"
        >
          <Archive className="w-5 h-5" style={{ color: "#00C2B2" }} />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: 280 }}
      className="h-full backdrop-blur-xl border-r flex flex-col"
      style={{
        background: sidebarBg,
        borderColor: borderColor,
      }}
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: borderColor }}>
        <h2 className="text-lg font-semibold" style={{ color: textColor }}>
          Fix-ISH AI
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          title="Collapse sidebar"
        >
          <ChevronLeft className="w-5 h-5" style={{ color: "#00C2B2" }} />
        </Button>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">
        {/* New Chat Button */}
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2"
          style={{
            background: "#00C2B2",
            color: "#FFFFFF",
          }}
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>

        {/* Archive Toggle */}
        <Button
          variant="ghost"
          onClick={() => setShowArchived(!showArchived)}
          className="w-full justify-start gap-2"
          style={{ color: textColor }}
        >
          <Archive className="w-4 h-4" />
          {showArchived ? "Active Chats" : "Archived"}
        </Button>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: mutedColor }}
          />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            style={{
              background: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.8)",
              color: textColor,
              borderColor: borderColor,
            }}
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 p-2">
                <div className="space-y-1">
                  {filteredConversations.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <MessageSquare
                        className="w-12 h-12 mx-auto mb-2"
                        style={{ color: mutedColor }}
                      />
                      <p className="text-sm" style={{ color: mutedColor }}>
                        {searchQuery
                          ? "No conversations found"
                          : "No conversations yet"}
                      </p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <motion.div
                        key={conv.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`group relative rounded-lg p-3 transition-all ${
                          conv.id === currentConversationId
                            ? "shadow-md"
                            : "hover:bg-primary/5"
                        }`}
                        style={{
                          background:
                            conv.id === currentConversationId
                              ? isDarkMode
                                ? "rgba(0, 194, 178, 0.15)"
                                : "rgba(0, 194, 178, 0.1)"
                              : "transparent",
                        }}
                      >
                        <div
                          className="flex items-start justify-between gap-2 cursor-pointer"
                          onClick={() => onSelectConversation(conv.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <h3
                              className="text-sm font-medium truncate mb-1"
                              style={{ color: textColor }}
                            >
                              {conv.title}
                            </h3>
                            <p
                              className="text-xs truncate"
                              style={{ color: mutedColor }}
                            >
                              {conv.lastMessage}
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{ color: mutedColor }}
                            >
                              {new Date(conv.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-4 h-4" style={{ color: "#00C2B2" }} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              style={{
                                background: isDarkMode ? "#232527" : "#FFFFFF",
                                borderColor: borderColor,
                              }}
                            >
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShare(conv);
                                }}
                                style={{ color: textColor }}
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchive(conv);
                                }}
                                style={{ color: textColor }}
                              >
                                <Archive className="w-4 h-4 mr-2" />
                                {conv.archived ? "Unarchive" : "Archive"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReport(conv);
                                }}
                                style={{ color: textColor }}
                              >
                                <Flag className="w-4 h-4 mr-2" />
                                Report
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteConversation(conv.id);
                                }}
                                style={{ color: "#FF6B6B" }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    ))
                  )}
        </div>
      </ScrollArea>
    </motion.div>
  );
};
