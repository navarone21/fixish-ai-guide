import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface MainThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const MainThemeContext = createContext<MainThemeContextType | undefined>(undefined);

export const MainThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("mainTheme");
    return (stored as Theme) || "dark"; // Default to dark
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove("light", "dark");
    
    // Add the current theme class
    root.classList.add(theme);
    
    // Store in localStorage
    localStorage.setItem("mainTheme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <MainThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="transition-colors duration-500">
        {children}
      </div>
    </MainThemeContext.Provider>
  );
};

export const useMainTheme = () => {
  const context = useContext(MainThemeContext);
  if (context === undefined) {
    throw new Error("useMainTheme must be used within a MainThemeProvider");
  }
  return context;
};
