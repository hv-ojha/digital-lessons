'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { LessonFormV2 } from '@/components/lesson-form-v2';
import { LessonTable } from '@/components/lesson-table';
import { Modal } from '@/components/ui/modal';
import { Lesson } from '@/types/lesson';
import { SparkyMascot, SparkyMessage } from '@/components/sparky-mascot';
import { CompactStreak } from '@/components/gamification/streak-tracker';
import { PlayfulButton, FloatingActionButton } from '@/components/ui/playful-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SearchInput } from '@/components/ui/search-input';
import { EducationalBackground } from '@/components/ui/educational-background';
import Link from 'next/link';
import { Plus, Sparkles, Star, Rocket } from 'lucide-react';

interface HomeClientWrapperProps {
  initialLessons: Lesson[];
}

export function HomeClientWrapper({ initialLessons }: HomeClientWrapperProps) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Refs for smooth scrolling
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const lessonsSectionRef = useRef<HTMLDivElement>(null);

  // Mock user data - Replace with real data from your auth/database
  const [streakCount] = useState(5);

  // Debounce search query for better performance (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter lessons based on debounced search query (memoized for performance)
  const filteredLessons = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return lessons;
    }

    const query = debouncedSearchQuery.toLowerCase().trim();
    return lessons.filter((lesson) => {
      const titleMatch = lesson.title.toLowerCase().includes(query);
      const outlineMatch = lesson.outline.toLowerCase().includes(query);
      const typeMatch = lesson.lesson_type?.toLowerCase().includes(query);

      return titleMatch || outlineMatch || typeMatch;
    });
  }, [lessons, debouncedSearchQuery]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[HomeClientWrapper] Component mounting');
    }
    setMounted(true);

    // Hide welcome message after 5 seconds
    const timer = setTimeout(() => setShowWelcome(false), 5000);

    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[HomeClientWrapper] Component unmounting');
      }
      clearTimeout(timer);
    };
  }, []);

  // Sync lessons state when initialLessons changes (e.g., when navigating back)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[HomeClientWrapper] Syncing with new initialLessons prop:', initialLessons.length, 'lessons');
    }
    setLessons(initialLessons);
  }, [initialLessons]);

  // Scroll detection for Sparky animation
  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 200; // Pixels to scroll before triggering animation
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLessonCreated = useCallback(() => {
    // Real-time subscription will automatically update the lessons list
  }, []);

  // Smooth scroll to search section with offset for sticky header
  const scrollToSearch = useCallback(() => {
    if (searchSectionRef.current) {
      const headerOffset = 150; // Account for sticky header + extra viewport space
      const elementPosition = searchSectionRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  // Smooth scroll to search section when exploring lessons
  const scrollToLessons = useCallback(() => {
    // Scroll to search section instead of lessons section
    // This brings search to the top and lessons are visible below
    scrollToSearch();
  }, [scrollToSearch]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-200 rounded-3xl" />
            <div className="h-64 bg-gray-200 rounded-3xl" />
            <div className="h-96 bg-gray-200 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Fixed Educational Background */}
      <EducationalBackground />

      <main id="main-content" className="min-h-screen relative">
        {/* Navigation Header - Sticky */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-50 py-6 bg-gradient-to-r from-purple-50/95 via-pink-50/95 to-blue-50/95 dark:from-gray-900/95 dark:via-gray-900/95 dark:to-gray-900/95 backdrop-blur-md border-b border-purple-200/50 dark:border-purple-800/50 shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Logo & Brand with Sparky */}
              <Link href="/" className="flex items-center gap-3 group">
                <AnimatePresence mode="wait">
                  {isScrolled ? (
                    <motion.div
                      key="sparky"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="w-14 h-14 flex items-center justify-center"
                    >
                      <SparkyMascot emotion="happy" size="sm" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sparkles"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-playful"
                    >
                      <Sparkles className="w-8 h-8 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div>
                  <h1 className="text-2xl md:text-3xl font-display font-bold bg-gradient-rainbow bg-clip-text text-transparent">
                    Spark
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Ignite Learning ✨
                  </p>
                </div>
              </Link>

              {/* Right Side - Streak, Theme Toggle & CTA */}
              <div className="flex items-center gap-3">
                <CompactStreak streakCount={streakCount} />

                <ThemeToggle />

                <PlayfulButton
                  variant="playful"
                  size="md"
                  icon={<Plus className="w-5 h-5" />}
                  onClick={() => setIsModalOpen(true)}
                  className="hidden md:inline-flex"
                >
                  New Lesson
                </PlayfulButton>

                <PlayfulButton
                  variant="playful"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  className="md:hidden"
                >
                  <Plus className="w-5 h-5" />
                </PlayfulButton>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="py-12 md:py-16">
            <div className="max-w-5xl mx-auto">
              {/* Sparky in Hero - Always visible */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="flex justify-center mb-8"
              >
                <SparkyMascot emotion="excited" size="xl" />
              </motion.div>

              {/* Hero Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center space-y-6"
              >
                <h2 className="heading-kid-hero text-gray-900 dark:text-white">
                  Your{' '}
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                    Amazing
                  </span>
                  {' '}Learning Adventure Starts Here!
                </h2>

                <p className="text-kid-body text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                  Create interactive lessons on any topic you love! Math, science, history, or even dinosaurs!
                  Let's make learning fun together! 🎉
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <PlayfulButton
                    variant="playful"
                    size="lg"
                    icon={<Rocket className="w-6 h-6" />}
                    onClick={() => setIsModalOpen(true)}
                  >
                    Start Learning Now!
                  </PlayfulButton>

                  <PlayfulButton
                    variant="outline"
                    size="lg"
                    icon={<Star className="w-6 h-6" />}
                    onClick={scrollToLessons}
                  >
                    Explore Lessons
                  </PlayfulButton>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Welcome Message with Sparky */}
          <AnimatePresence>
            {showWelcome && lessons.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-3xl mx-auto mb-12"
              >
                <SparkyMessage
                  emotion="happy"
                  message="Hey there, friend! I'm Sparky, your learning buddy! 🌟 Ready to create your first awesome lesson? Just click the button above and tell me what you want to learn about!"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Section - Sticky */}
          {lessons.length > 0 && (
            <motion.section
              ref={searchSectionRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="sticky top-24 z-40 mb-12 py-4"
            >
              <div className="max-w-2xl mx-auto">
                <div onFocus={scrollToSearch}>
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search lessons by title, topic, or type..."
                    className="w-full"
                  />
                </div>

                {/* Search Results Count */}
                {debouncedSearchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-center"
                  >
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredLessons.length === 0 ? (
                      <span className="flex items-center justify-center gap-2">
                        <span>😢</span>
                        <span>No lessons found matching "{debouncedSearchQuery}"</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>✨</span>
                        <span>
                          Found {filteredLessons.length} {filteredLessons.length === 1 ? 'lesson' : 'lessons'} matching "{debouncedSearchQuery}"
                        </span>
                      </span>
                    )}
                  </p>
                </motion.div>
              )}
              </div>
            </motion.section>
          )}

          {/* Main Content - Lessons Section */}
          <section ref={lessonsSectionRef} className="pb-20">
            <LessonTable initialLessons={filteredLessons} />
          </section>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="border-t border-purple-200/50 dark:border-purple-800/50 py-8 mt-12"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Made with ❤️ by AI
              </p>
              <div className="flex items-center gap-6">
                <Link
                  href="/about"
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                >
                  About
                </Link>
                <Link
                  href="/help"
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                >
                  Help
                </Link>
              </div>
            </div>
          </motion.footer>
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="md:hidden">
        <FloatingActionButton
          position="bottom-right"
          icon={<Plus className="w-6 h-6" />}
          onClick={() => setIsModalOpen(true)}
          aria-label="Create new lesson"
        >
          New
        </FloatingActionButton>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <LessonFormV2
          onLessonCreated={handleLessonCreated}
          onSubmit={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
}
