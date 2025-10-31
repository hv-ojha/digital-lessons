import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full font-semibold shadow-lg text-sm transition-all duration-200",
  {
    variants: {
      variant: {
        achievement:
          "bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:shadow-xl hover:scale-105",
        streak:
          "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-xl hover:scale-105",
        level:
          "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl hover:scale-105",
        success:
          "bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:shadow-xl hover:scale-105",
        magic:
          "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-xl hover:scale-105",
        rainbow:
          "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white hover:shadow-xl hover:scale-105 animate-gradient bg-gradient-animate",
        default:
          "bg-gray-100 text-gray-700 hover:bg-gray-200",
      },
      size: {
        sm: "px-3 py-1 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface PlayfulBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  pulse?: boolean;
}

const PlayfulBadge = React.forwardRef<HTMLDivElement, PlayfulBadgeProps>(
  ({ className, variant, size, icon, pulse = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({ variant, size }),
          pulse && "animate-pulse-slow",
          className
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
      </div>
    );
  }
);
PlayfulBadge.displayName = "PlayfulBadge";

export { PlayfulBadge, badgeVariants };
