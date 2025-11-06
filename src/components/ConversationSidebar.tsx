import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, MessageSquare, Share2, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  isDarkMode: boolean;
}

export const ConversationSidebar = ({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  isDarkMode,
}: ConversationSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarBg = isDarkMode
    ? "rgba(26, 28, 30, 0.95)"
    : "rgba(255, 255, 255, 0.95)";
  const borderColor = isDarkMode
    ? "rgba(0, 194, 178, 0.2)"
    : "rgba(0, 194, 178, 0.3)";
  const textColor = isDarkMode ? "#EAEAEA" : "#1A1C1E";
  const mutedColor = "#999999";

  return (
    <>
      {/* Toggle Button - Always Visible */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="fixed top-20 left-4 z-50 hover:bg-primary/10 transition-all duration-300 shadow-lg"
          style={{
            background: isDarkMode ? "rgba(35, 37, 39, 0.95)" : "rgba(255, 255, 255, 0.95)",
            borderColor: borderColor,
            border: "1px solid",
          }}
          title="Open chat history"
        >
          <Menu className="w-5 h-5" style={{ color: "#00C2B2" }} />
        </Button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* Sidebar Content */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-0 left-0 h-full w-80 z-50 backdrop-blur-xl border-r flex flex-col shadow-2xl"
              style={{
                background: sidebarBg,
                borderColor: borderColor,
              }}
            >
              {/* Close Button - Always Visible */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 hover:bg-primary/10 transition-all duration-300"
                title="Close chat history"
              >
                <X className="w-5 h-5" style={{ color: "#00C2B2" }} />
              </Button>

              {/* Header */}
              <div className="p-4 border-b" style={{ borderColor: borderColor }}>
                <h2
                  className="text-lg font-semibold mb-4"
                  style={{ color: textColor }}
                >
                  Fix-ISH AI
                </h2>

                {/* New Chat Button */}
                <Button
                  onClick={onNewChat}
                  className="w-full justify-start gap-2 mb-4"
                  style={{
                    background: "#00C2B2",
                    color: "#FFFFFF",
                  }}
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </Button>

                {/* Search Bar */}
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: mutedColor }}
                  />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    style={{
                      background: isDarkMode
                        ? "rgba(0, 0, 0, 0.2)"
                        : "rgba(255, 255, 255, 0.8)",
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
                        className={`group relative rounded-lg p-3 cursor-pointer transition-all ${
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
                        onClick={() => onSelectConversation(conv.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteConversation(conv.id);
                            }}
                          >
                            <X className="w-3 h-3" style={{ color: "#00C2B2" }} />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
