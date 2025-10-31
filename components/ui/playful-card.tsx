import * as React from "react";
import { cn } from "@/lib/utils";

export interface PlayfulCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: "purple" | "blue" | "green" | "yellow" | "pink" | "rainbow";
  hover?: boolean;
  animate?: boolean;
}

const PlayfulCard = React.forwardRef<HTMLDivElement, PlayfulCardProps>(
  ({ className, gradient, hover = true, animate = true, children, ...props }, ref) => {
    const gradientClasses = {
      purple: "from-purple-100 to-pink-100",
      blue: "from-blue-100 to-cyan-100",
      green: "from-green-100 to-emerald-100",
      yellow: "from-yellow-100 to-orange-100",
      pink: "from-pink-100 to-rose-100",
      rainbow: "from-purple-100 via-pink-100 to-blue-100",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative bg-white rounded-2xl shadow-xl overflow-hidden group",
          hover && "hover:shadow-2xl transition-all duration-300 hover:-translate-y-2",
          animate && "animate-slide-in-up",
          className
        )}
        {...props}
      >
        {/* Gradient Border Effect on Hover */}
        {hover && (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur",
              gradient && `bg-gradient-to-br ${gradientClasses[gradient]}`,
              !gradient && "from-purple-400 via-pink-400 to-blue-400"
            )}
          />
        )}
        {children}
      </div>
    );
  }
);
PlayfulCard.displayName = "PlayfulCard";

const PlayfulCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { gradient?: "purple" | "blue" | "green" | "yellow" | "pink" | "rainbow" }
>(({ className, gradient, children, ...props }, ref) => {
  const gradientClasses = {
    purple: "from-purple-100 to-pink-100",
    blue: "from-blue-100 to-cyan-100",
    green: "from-green-100 to-emerald-100",
    yellow: "from-yellow-100 to-orange-100",
    pink: "from-pink-100 to-rose-100",
    rainbow: "from-purple-100 via-pink-100 to-blue-100",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-48 flex items-center justify-center",
        gradient && `bg-gradient-to-br ${gradientClasses[gradient]}`,
        !gradient && "bg-gradient-to-br from-purple-100 to-pink-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
PlayfulCardHeader.displayName = "PlayfulCardHeader";

const PlayfulCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 space-y-4", className)} {...props} />
));
PlayfulCardContent.displayName = "PlayfulCardContent";

const PlayfulCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-bold text-gray-900 font-display", className)}
    {...props}
  />
));
PlayfulCardTitle.displayName = "PlayfulCardTitle";

const PlayfulCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-gray-600 leading-relaxed", className)}
    {...props}
  />
));
PlayfulCardDescription.displayName = "PlayfulCardDescription";

const PlayfulCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-4", className)}
    {...props}
  />
));
PlayfulCardFooter.displayName = "PlayfulCardFooter";

export {
  PlayfulCard,
  PlayfulCardHeader,
  PlayfulCardContent,
  PlayfulCardTitle,
  PlayfulCardDescription,
  PlayfulCardFooter,
};
