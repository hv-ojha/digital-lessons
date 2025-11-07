"use client";

import * as React from "react";
import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const enhancedButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow",
        destructive: "bg-destructive text-destructive-foreground shadow-sm",
        outline: "border border-input bg-background shadow-sm",
        secondary: "bg-secondary text-secondary-foreground shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Enhanced Kid-Friendly Variants
        playful: "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold",
        magic: "bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold",
        sunshine: "bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-semibold",
        success: "bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold",
        rainbow: "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-semibold",
        // Parent-Friendly Professional Variants
        professional: "bg-gradient-to-r from-slate-600 to-slate-700 text-white font-medium",
        trust: "bg-gradient-to-r from-blue-700 to-cyan-600 text-white font-medium",
        achievement: "bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-xl",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10 rounded-xl",
      },
      shadow: {
        none: "",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
        playful: "shadow-playful",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shadow: "md",
    },
  }
);

// Animation variants for different button states
const buttonAnimationVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.05,
    y: -3,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
  tap: {
    scale: 0.95,
    y: 0,
    transition: {
      duration: 0.1,
    },
  },
  success: {
    scale: [1, 1.2, 1],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 0.5,
    },
  },
};

// Professional button animations (subtle)
const professionalAnimationVariants: Variants = {
  rest: {
    scale: 1,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.98,
  },
};

export interface EnhancedButtonProps
  extends Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof enhancedButtonVariants> {
  children?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  showRipple?: boolean;
  animationType?: "playful" | "professional";
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      className,
      variant,
      size,
      shadow,
      children,
      isLoading = false,
      loadingText = "Loading...",
      showRipple = true,
      animationType = "playful",
      disabled,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = React.useState<
      Array<{ x: number; y: number; id: number }>
    >([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (showRipple && !disabled && !isLoading) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples((prev) => [...prev, { x, y, id }]);

        // Remove ripple after animation
        setTimeout(() => {
          setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
        }, 600);
      }

      if (props.onClick && !disabled && !isLoading) {
        props.onClick(e);
      }
    };

    const animations =
      animationType === "professional"
        ? professionalAnimationVariants
        : buttonAnimationVariants;

    return (
      <motion.button
        ref={ref}
        className={cn(enhancedButtonVariants({ variant, size, shadow, className }))}
        variants={animations}
        initial="rest"
        whileHover={!disabled && !isLoading ? "hover" : "rest"}
        whileTap={!disabled && !isLoading ? "tap" : "rest"}
        disabled={disabled || isLoading}
        {...props}
        onClick={handleClick}
      >
        {/* Ripple Effect */}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
            }}
            initial={{ width: 0, height: 0, opacity: 0.5 }}
            animate={{
              width: 300,
              height: 300,
              opacity: 0,
              x: -150,
              y: -150,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}

        {/* Loading Spinner */}
        {isLoading && (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}

        {/* Button Content */}
        <span className="relative z-10">
          {isLoading ? loadingText : children}
        </span>
      </motion.button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton, enhancedButtonVariants };
