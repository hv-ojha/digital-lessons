"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, TrendingUp, Settings, HelpCircle, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  href: string;
  icon?: React.ElementType;
}

const navLinks: NavLink[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Progress Reports",
    href: "/progress",
    icon: TrendingUp,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Support",
    href: "/support",
    icon: HelpCircle,
  },
];

export function ParentNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        {navLinks.map((link) => (
          <ParentNavLink
            key={link.href}
            {...link}
            isActive={pathname === link.href}
          />
        ))}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Menu Button */}
        <motion.button
          className="fixed top-4 right-4 z-50 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-700 to-cyan-600 flex items-center justify-center shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
          whileTap={{ scale: 0.9 }}
        >
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <Menu className="w-5 h-5 text-white" />
          )}
        </motion.button>

        {/* Mobile Menu */}
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.nav
              className="fixed top-16 right-4 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-2 space-y-1 min-w-[200px]"
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
            >
              {navLinks.map((link) => (
                <ParentNavLink
                  key={link.href}
                  {...link}
                  isActive={pathname === link.href}
                  onClick={() => setIsOpen(false)}
                  mobile
                />
              ))}
            </motion.nav>
          </>
        )}
      </div>
    </>
  );
}

interface ParentNavLinkProps extends NavLink {
  isActive: boolean;
  onClick?: () => void;
  mobile?: boolean;
}

function ParentNavLink({
  label,
  href,
  icon: Icon,
  isActive,
  onClick,
  mobile = false,
}: ParentNavLinkProps) {
  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        className={cn(
          "relative px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer",
          mobile ? "flex items-center gap-3 w-full" : "inline-flex items-center gap-2",
          isActive
            ? "text-white"
            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Active Background */}
        {isActive && (
          <motion.div
            layoutId={mobile ? "mobileParentNavBg" : "parentNavBg"}
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-700 to-cyan-600"
            initial={false}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          <span>{label}</span>
        </div>
      </motion.div>
    </Link>
  );
}
