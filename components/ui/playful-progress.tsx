"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export interface PlayfulProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showPercentage?: boolean;
  showStars?: boolean;
  gradient?: "purple" | "green" | "blue" | "rainbow";
  animate?: boolean;
}

const PlayfulProgress = React.forwardRef<HTMLDivElement, PlayfulProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      showPercentage = true,
      showStars = true,
      gradient = "purple",
      animate = true,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const gradientClasses = {
      purple: "from-purple-500 via-pink-500 to-orange-500",
      green: "from-green-400 to-emerald-500",
      blue: "from-blue-500 to-cyan-500",
      rainbow: "from-pink-500 via-purple-500 via-blue-500 to-cyan-500",
    };

    const milestones = [0, 25, 50, 75, 100];

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {/* Header with Percentage */}
        {showPercentage && (
          <div className="flex justify-between items-center">
            <span className="font-display font-semibold text-gray-700">
              Your Progress
            </span>
            <span className="font-display text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {Math.round(percentage)}%
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className={cn(
              "absolute h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r",
              gradientClasses[gradient],
              !animate && "transition-none"
            )}
            style={{ width: `${percentage}%` }}
          />

          {/* Shimmer Effect */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30",
              animate && "animate-shimmer"
            )}
            style={{
              backgroundSize: "200% 100%",
              animation: animate ? "shimmer 1.5s infinite" : "none",
            }}
          />
        </div>

        {/* Milestone Stars */}
        {showStars && (
          <div className="flex justify-between px-1">
            {milestones.map((milestone, index) => {
              const isAchieved = percentage >= milestone;
              return (
                <div
                  key={milestone}
                  className={cn(
                    "transition-all duration-300",
                    isAchieved && animate && "animate-bounce-in"
                  )}
                  style={{
                    animationDelay: isAchieved ? `${index * 0.1}s` : "0s",
                  }}
                >
                  <Star
                    className={cn(
                      "w-6 h-6 transition-all duration-300",
                      isAchieved
                        ? "fill-yellow-400 text-yellow-400 scale-110"
                        : "text-gray-300 scale-100"
                    )}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);
PlayfulProgress.displayName = "PlayfulProgress";

export { PlayfulProgress };
