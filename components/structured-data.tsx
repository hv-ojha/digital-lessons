/**
 * Structured Data Components
 *
 * These components generate JSON-LD structured data for better SEO
 * and rich search results in Google, Bing, and other search engines.
 */

interface OrganizationSchemaProps {
  url: string;
}

export function OrganizationSchema({ url }: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Spark',
    alternateName: 'Spark Education',
    url,
    logo: `${url}/logo.png`,
    description: 'AI-powered educational platform designed for Indian students and teachers',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
    },
    sameAs: [
      'https://twitter.com/sparkedu',
      'https://facebook.com/sparkedu',
      'https://linkedin.com/company/sparkedu',
    ],
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface WebsiteSchemaProps {
  url: string;
}

export function WebsiteSchema({ url }: WebsiteSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Spark',
    url,
    description: 'AI-powered educational platform for Indian students and teachers',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface LessonSchemaProps {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
}

export function LessonSchema({
  title,
  description,
  url,
  datePublished,
  dateModified,
}: LessonSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: title,
    description,
    url,
    datePublished,
    dateModified,
    author: {
      '@type': 'Organization',
      name: 'Spark Education',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Spark Education',
    },
    educationalLevel: 'Beginner to Advanced',
    inLanguage: 'en-IN',
    learningResourceType: 'Interactive Lesson',
    isAccessibleForFree: true,
    interactivityType: 'active',
    educationalUse: ['self-assessment', 'practice', 'learning'],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface CourseSchemaProps {
  name: string;
  description: string;
  provider: string;
}

export function CourseSchema({ name, description, provider }: CourseSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider,
    },
    educationalLevel: 'All Levels',
    inLanguage: 'en-IN',
    isAccessibleForFree: true,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT30M', // 30 minutes
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQSchemaProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
