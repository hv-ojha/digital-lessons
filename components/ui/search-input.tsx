'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search lessons...",
  className = ""
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  // Debounce search - wait 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${className}`}
    >
      <div className={`relative flex items-center transition-all duration-200 ${
        isFocused
          ? 'ring-2 ring-purple-500 dark:ring-purple-400'
          : 'ring-1 ring-gray-300 dark:ring-gray-600'
      } rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md`}>
        {/* Search Icon */}
        <div className="absolute left-4 pointer-events-none">
          <motion.div
            animate={{
              scale: isFocused ? 1.1 : 1,
              rotate: isFocused ? [0, -10, 10, 0] : 0
            }}
            transition={{ duration: 0.3 }}
          >
            <Search className={`w-5 h-5 ${
              isFocused
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-gray-400 dark:text-gray-500'
            } transition-colors duration-200`} />
          </motion.div>
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none font-medium rounded-xl"
        />

        {/* Clear Button */}
        <AnimatePresence>
          {localValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="absolute right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Playful Focus Indicator */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-xl opacity-20 blur-sm -z-10"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Compact Search Input for mobile/header
 */
export function CompactSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = ""
}: SearchInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    setIsExpanded(false);
  };

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {!isExpanded ? (
          <motion.button
            key="search-button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsExpanded(true)}
            className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors duration-200"
            aria-label="Open search"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
        ) : (
          <motion.div
            key="search-input"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 200 }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-md ring-2 ring-purple-500 dark:ring-purple-400 px-3 py-2"
          >
            <Search className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <input
              type="text"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onBlur={() => {
                if (!localValue) setIsExpanded(false);
              }}
              placeholder={placeholder}
              autoFocus
              className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
            />
            {localValue && (
              <button
                onClick={handleClear}
                className="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Clear search"
              >
                <X className="w-3 h-3 text-gray-400 dark:text-gray-500" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
