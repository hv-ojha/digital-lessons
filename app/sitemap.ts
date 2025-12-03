import { MetadataRoute } from 'next';
import { getAllLessons } from '@/lib/db/lessons-server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  // Fetch all lessons for dynamic sitemap generation
  const lessons = await getAllLessons();

  // Generate lesson URLs
  const lessonUrls = lessons
    .filter(lesson => lesson.status === 'completed') // Only include completed lessons
    .map(lesson => ({
      url: `${baseUrl}/lessons/${lesson.id}`,
      lastModified: lesson.updated_at ? new Date(lesson.updated_at) : new Date(lesson.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/lessons`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  return [...staticPages, ...lessonUrls];
}
