"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Smile, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "kid" | "parent";

interface ViewModeToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  className?: string;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  mode,
  onModeChange,
  className,
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1 bg-secondary rounded-2xl shadow-md",
        className
      )}
      role="radiogroup"
      aria-label="View mode selection"
    >
      <ViewModeOption
        value="kid"
        icon={Smile}
        label="Kid View"
        isActive={mode === "kid"}
        onClick={() => onModeChange("kid")}
      />
      <ViewModeOption
        value="parent"
        icon={User}
        label="Parent View"
        isActive={mode === "parent"}
        onClick={() => onModeChange("parent")}
      />
    </div>
  );
};

interface ViewModeOptionProps {
  value: ViewMode;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const ViewModeOption: React.FC<ViewModeOptionProps> = ({
  value,
  icon: Icon,
  label,
  isActive,
  onClick,
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn(
        "relative px-4 py-2 rounded-xl font-medium text-sm transition-colors flex items-center gap-2",
        isActive
          ? "text-white"
          : "text-muted-foreground hover:text-foreground"
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      role="radio"
      aria-checked={isActive}
      aria-label={label}
    >
      {/* Animated Background */}
      {isActive && (
        <motion.div
          layoutId="activeBackground"
          className={cn(
            "absolute inset-0 rounded-xl",
            value === "kid"
              ? "bg-gradient-to-r from-purple-600 to-pink-600"
              : "bg-gradient-to-r from-blue-700 to-slate-700"
          )}
          initial={false}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      )}

      {/* Icon and Label */}
      <Icon className={cn("w-4 h-4 relative z-10")} />
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
};

// Context for managing view mode throughout the app
interface ViewModeContextType {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
}

const ViewModeContext = React.createContext<ViewModeContextType | undefined>(
  undefined
);

export const ViewModeProvider: React.FC<{
  children: React.ReactNode;
  defaultMode?: ViewMode;
}> = ({ children, defaultMode = "kid" }) => {
  const [mode, setMode] = React.useState<ViewMode>(defaultMode);
  const [mounted, setMounted] = React.useState(false);

  // Set mounted on client-side to prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
    // Load from localStorage on mount (only on client)
    const savedMode = localStorage.getItem("viewMode") as ViewMode | null;
    if (savedMode && (savedMode === "kid" || savedMode === "parent")) {
      setMode(savedMode);
    }
  }, []);

  React.useEffect(() => {
    // Save to localStorage when mode changes (skip initial mount)
    if (mounted) {
      localStorage.setItem("viewMode", mode);
    }
  }, [mode, mounted]);

  return (
    <ViewModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = () => {
  const context = React.useContext(ViewModeContext);
  if (!context) {
    throw new Error("useViewMode must be used within ViewModeProvider");
  }
  return context;
};
