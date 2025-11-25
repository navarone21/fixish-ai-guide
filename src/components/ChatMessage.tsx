import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-soft",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-card text-card-foreground rounded-bl-sm border border-border"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        {timestamp && (
          <p
            className={cn(
              "text-xs mt-1",
              isUser ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}
