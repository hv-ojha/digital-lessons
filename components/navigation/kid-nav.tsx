"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Book, Trophy, Sparkles, User, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  gradient: string;
}

const navItems: NavItem[] = [
  {
    icon: Home,
    label: "Home",
    href: "/",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Book,
    label: "Lessons",
    href: "/lessons",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Trophy,
    label: "Achievements",
    href: "/achievements",
    gradient: "from-yellow-500 to-amber-500",
  },
  {
    icon: Sparkles,
    label: "Play",
    href: "/play",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: User,
    label: "Profile",
    href: "/profile",
    gradient: "from-green-500 to-emerald-500",
  },
];

export function KidNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-3xl shadow-playful">
        {navItems.map((item) => (
          <KidNavItem
            key={item.href}
            {...item}
            isActive={pathname === item.href}
          />
        ))}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Hamburger Button */}
        <motion.button
          className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-playful"
          onClick={() => setIsOpen(!isOpen)}
          whileTap={{ scale: 0.9 }}
        >
          <Menu className="w-6 h-6 text-white" />
        </motion.button>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="fixed top-20 right-4 z-50 bg-white dark:bg-gray-800 rounded-3xl shadow-playful-lg p-4 space-y-2"
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
            >
              {navItems.map((item) => (
                <KidNavItem
                  key={item.href}
                  {...item}
                  isActive={pathname === item.href}
                  onClick={() => setIsOpen(false)}
                />
              ))}
            </motion.div>
          </>
        )}
      </div>

      {/* Bottom Navigation for Mobile (Alternative) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 safe-area-bottom">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => (
            <KidNavItemMobile
              key={item.href}
              {...item}
              isActive={pathname === item.href}
            />
          ))}
        </div>
      </nav>
    </>
  );
}

// Desktop/Tablet Nav Item
interface KidNavItemProps extends NavItem {
  isActive: boolean;
  onClick?: () => void;
}

function KidNavItem({ icon: Icon, label, href, gradient, isActive, onClick }: KidNavItemProps) {
  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        className={cn(
          "relative px-6 py-3 rounded-2xl font-semibold text-sm flex items-center gap-3 min-w-[120px] cursor-pointer transition-all",
          isActive
            ? "text-white"
            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        )}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Active Background */}
        {isActive && (
          <motion.div
            layoutId="activeNavBackground"
            className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br", gradient)}
            initial={false}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        )}

        {/* Icon and Label */}
        <div className="relative z-10 flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <span>{label}</span>
        </div>

        {/* Sparkle Effect on Active */}
        {isActive && (
          <>
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                style={{
                  top: "20%",
                  left: `${30 + i * 40}%`,
                }}
                animate={{
                  y: [-10, -20],
                  opacity: [1, 0],
                  scale: [1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </Link>
  );
}

// Mobile Bottom Nav Item
function KidNavItemMobile({ icon: Icon, label, href, gradient, isActive }: KidNavItemProps) {
  return (
    <Link href={href}>
      <motion.div
        className="flex flex-col items-center gap-1 p-2 min-w-[60px]"
        whileTap={{ scale: 0.9 }}
      >
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            isActive
              ? `bg-gradient-to-br ${gradient} shadow-lg`
              : "bg-gray-100 dark:bg-gray-700"
          )}
        >
          <Icon
            className={cn(
              "w-6 h-6",
              isActive ? "text-white" : "text-gray-600 dark:text-gray-300"
            )}
          />
        </div>
        <span
          className={cn(
            "text-xs font-medium",
            isActive
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          )}
        >
          {label}
        </span>

        {/* Active Indicator */}
        {isActive && (
          <motion.div
            className={cn("w-6 h-1 rounded-full bg-gradient-to-r", gradient)}
            layoutId="mobileActiveIndicator"
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        )}
      </motion.div>
    </Link>
  );
}
