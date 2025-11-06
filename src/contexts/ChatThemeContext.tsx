import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ChatThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ChatThemeContext = createContext<ChatThemeContextType | undefined>(undefined);

export const ChatThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("chatTheme");
    return (stored as Theme) || "dark"; // Default to dark
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove("light", "dark");
    
    // Add the current theme class
    root.classList.add(theme);
    
    // Store in localStorage
    localStorage.setItem("chatTheme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ChatThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="transition-colors duration-500">
        {children}
      </div>
    </ChatThemeContext.Provider>
  );
};

export const useChatTheme = () => {
  const context = useContext(ChatThemeContext);
  if (context === undefined) {
    throw new Error("useChatTheme must be used within a ChatThemeProvider");
  }
  return context;
};
