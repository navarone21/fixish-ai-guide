import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMainTheme } from "@/contexts/MainThemeContext";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useMainTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full transition-all duration-300 hover:scale-110"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
};
