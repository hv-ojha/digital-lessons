"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SparkyMascotProps extends React.SVGAttributes<SVGElement> {
  mood?: "happy" | "thinking" | "celebrating" | "encouraging";
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
}

const SparklyMascot = React.forwardRef<SVGSVGElement, SparkyMascotProps>(
  ({ className, mood = "happy", size = "md", animate = true, ...props }, ref) => {
    const sizes = {
      sm: "w-16 h-16",
      md: "w-24 h-24",
      lg: "w-32 h-32",
      xl: "w-48 h-48",
    };

    return (
      <svg
        ref={ref}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(sizes[size], animate && "animate-float", className)}
        {...props}
      >
        {/* Star Body - Gradient Fill */}
        <defs>
          <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
          <linearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>
        </defs>

        {/* Main Star Body */}
        <g className={animate ? "animate-pulse-slow" : ""}>
          <path
            d="M100 20 L115 70 L165 75 L125 110 L135 160 L100 135 L65 160 L75 110 L35 75 L85 70 Z"
            fill="url(#starGradient)"
            stroke="#7C3AED"
            strokeWidth="3"
          />
        </g>

        {/* Face - Changes based on mood */}
        <g>
          {/* Eyes */}
          <circle cx="85" cy="85" r="8" fill="white" />
          <circle cx="115" cy="85" r="8" fill="white" />

          {mood !== "thinking" ? (
            <>
              <circle cx="87" cy="87" r="4" fill="#1F2937" />
              <circle cx="117" cy="87" r="4" fill="#1F2937" />
            </>
          ) : (
            <>
              <circle cx="85" cy="83" r="4" fill="#1F2937" />
              <circle cx="115" cy="87" r="4" fill="#1F2937" />
            </>
          )}

          {/* Mouth - Changes based on mood */}
          {mood === "happy" && (
            <path
              d="M 80 105 Q 100 120 120 105"
              stroke="#1F2937"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          )}
          {mood === "thinking" && (
            <ellipse cx="100" cy="110" rx="8" ry="5" fill="#1F2937" />
          )}
          {mood === "celebrating" && (
            <>
              <path
                d="M 75 105 Q 100 125 125 105"
                stroke="#1F2937"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path d="M 85 108 L 90 115" stroke="#1F2937" strokeWidth="2" />
              <path d="M 115 108 L 110 115" stroke="#1F2937" strokeWidth="2" />
            </>
          )}
          {mood === "encouraging" && (
            <path
              d="M 80 110 Q 100 115 120 110"
              stroke="#1F2937"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </g>

        {/* Arms */}
        {mood === "celebrating" ? (
          <>
            <path
              d="M 70 100 L 45 85"
              stroke="#8B5CF6"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 130 100 L 155 85"
              stroke="#8B5CF6"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <path
              d="M 70 100 L 50 115"
              stroke="#8B5CF6"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 130 100 L 150 115"
              stroke="#8B5CF6"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Sparkles around Sparky */}
        <g className={animate ? "animate-pulse" : ""}>
          {/* Top Sparkle */}
          <g>
            <path
              d="M 100 10 L 102 18 L 110 20 L 102 22 L 100 30 L 98 22 L 90 20 L 98 18 Z"
              fill="url(#sparkleGradient)"
            />
          </g>

          {/* Right Sparkle */}
          <g>
            <path
              d="M 165 100 L 167 108 L 175 110 L 167 112 L 165 120 L 163 112 L 155 110 L 163 108 Z"
              fill="url(#sparkleGradient)"
            />
          </g>

          {/* Left Sparkle */}
          <g>
            <path
              d="M 35 100 L 37 108 L 45 110 L 37 112 L 35 120 L 33 112 L 25 110 L 33 108 Z"
              fill="url(#sparkleGradient)"
            />
          </g>
        </g>

        {/* Thought Bubble (only when thinking) */}
        {mood === "thinking" && (
          <g className={animate ? "animate-bounce-in" : ""}>
            <circle cx="135" cy="50" r="3" fill="#A78BFA" opacity="0.8" />
            <circle cx="145" cy="40" r="5" fill="#A78BFA" opacity="0.9" />
            <circle cx="160" cy="30" r="15" fill="#A78BFA" />
            <text
              x="160"
              y="35"
              textAnchor="middle"
              fontSize="20"
              fill="white"
              fontWeight="bold"
            >
              ?
            </text>
          </g>
        )}

        {/* Confetti (only when celebrating) */}
        {mood === "celebrating" && (
          <g className={animate ? "animate-confetti" : ""}>
            <rect x="60" y="40" width="4" height="8" fill="#FF6B6B" transform="rotate(15 62 44)" />
            <rect x="140" y="35" width="4" height="8" fill="#4D96FF" transform="rotate(-20 142 39)" />
            <circle cx="50" cy="50" r="3" fill="#FBBF24" />
            <circle cx="150" cy="55" r="3" fill="#EC4899" />
            <rect x="70" y="30" width="4" height="8" fill="#34D399" transform="rotate(45 72 34)" />
            <rect x="130" y="25" width="4" height="8" fill="#A78BFA" transform="rotate(-30 132 29)" />
          </g>
        )}
      </svg>
    );
  }
);
SparklyMascot.displayName = "SparklyMascot";

export { SparklyMascot };
