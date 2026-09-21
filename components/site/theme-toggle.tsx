"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return <Button variant="ghost" size="icon" disabled className="size-9" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
