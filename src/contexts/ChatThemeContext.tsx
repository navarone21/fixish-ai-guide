import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ChatThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ChatThemeContext = createContext<ChatThemeContextType | undefined>(undefined);

export const ChatThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme");
    return (stored as Theme) || "dark"; // Default to dark
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove("light", "dark");
    
    // Add the current theme class with smooth transition
    root.style.transition = "background-color 0.5s ease, color 0.5s ease";
    root.classList.add(theme);
    
    // Store in localStorage
    localStorage.setItem("theme", theme);

    // Listen for theme changes from other contexts (like main site)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue) {
        setTheme(e.newValue as Theme);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also listen for custom event for same-window updates
    const handleThemeChange = (e: CustomEvent) => {
      setTheme(e.detail.theme);
    };
    
    window.addEventListener("themeChange" as any, handleThemeChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("themeChange" as any, handleThemeChange);
    };
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    // Dispatch custom event for same-window sync
    window.dispatchEvent(new CustomEvent("themeChange", { detail: { theme: newTheme } }));
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
