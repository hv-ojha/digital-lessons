'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Theme Toggle Button
 * Allows users to switch between light, dark, and system themes
 */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  const themes = [
    { name: 'light', icon: Sun, label: 'Light Mode', color: 'from-yellow-400 to-orange-400' },
    { name: 'dark', icon: Moon, label: 'Dark Mode', color: 'from-indigo-500 to-purple-600' },
    { name: 'system', icon: Monitor, label: 'System', color: 'from-blue-500 to-teal-500' },
  ];

  const currentTheme = themes.find((t) => t.name === theme) || themes[0];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          const currentIndex = themes.findIndex((t) => t.name === theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          setTheme(themes[nextIndex].name);
        }}
        className={cn(
          'relative w-10 h-10 rounded-xl flex items-center justify-center',
          'bg-gradient-to-br shadow-lg hover:shadow-xl transition-all duration-200',
          'border-2 border-white/20 dark:border-gray-700',
          currentTheme.color
        )}
        aria-label={`Switch to ${themes[(themes.findIndex((t) => t.name === theme) + 1) % themes.length].label}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <currentTheme.icon className="w-5 h-5 text-white" />
          </motion.div>
        </AnimatePresence>

        {/* Sparkle effect on click */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-white"
          initial={{ scale: 0, opacity: 0.5 }}
          whileTap={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      </motion.button>
    </div>
  );
}

/**
 * Theme Selector with Pills
 * More detailed theme selection UI
 */
export function ThemeSelector() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-20 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
        ))}
      </div>
    );
  }

  const themes = [
    { name: 'light', icon: Sun, label: 'Light', color: 'from-yellow-400 to-orange-400' },
    { name: 'dark', icon: Moon, label: 'Dark', color: 'from-indigo-500 to-purple-600' },
    { name: 'system', icon: Monitor, label: 'Auto', color: 'from-blue-500 to-teal-500' },
  ];

  return (
    <div className="inline-flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
      {themes.map((themeOption) => {
        const Icon = themeOption.icon;
        const isActive = theme === themeOption.name;

        return (
          <motion.button
            key={themeOption.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(themeOption.name)}
            className={cn(
              'relative px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200',
              'flex items-center gap-2',
              isActive
                ? 'text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="theme-pill"
                className={cn('absolute inset-0 rounded-xl bg-gradient-to-br', themeOption.color)}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}

            <Icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{themeOption.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
