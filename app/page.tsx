import { getAllLessons } from '@/lib/db/lessons-server';
import { HomeClientWrapper } from '@/components/home-client-wrapper';

/**
 * Home Page - Server Component with Enhanced UI
 *
 * Now features:
 * - Dual-audience design (Kid & Parent views)
 * - ViewModeToggle for switching perspectives
 * - Enhanced Sparky mascot with emotions
 * - Kid-friendly and Parent professional navigation
 * - Quick stats for parents
 * - Gamification elements
 */
export default async function Home() {
  // Fetch lessons on the server
  const lessons = await getAllLessons();

  return <HomeClientWrapper initialLessons={lessons} />;
}
