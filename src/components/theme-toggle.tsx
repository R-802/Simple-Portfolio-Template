"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isSwitching, setIsSwitching] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = () => {
    setIsSwitching(true);
    setTimeout(() => {
      setTheme(theme === "light" ? "dark" : "light");
      setIsSwitching(false);
    }, 300); // Delay to match the CSS transition duration
  };

  if (!mounted) {
    return null;
  }

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleThemeChange}
      className={`relative transition-colors ${
        isSwitching ? "opacity-50" : ""
      }`}
    >
      <span className="sr-only">Toggle theme</span>
      <div className="relative w-6 h-6 flex items-center justify-center">
        <SunIcon
          className={`absolute h-5 w-5 transition-opacity ${
            currentTheme === "light" ? "opacity-100" : "opacity-0"
          }`}
        />
        <MoonIcon
          className={`absolute h-4 w-4 transition-opacity ${
            currentTheme === "dark" ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    </Button>
  );
}
