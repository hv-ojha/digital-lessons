import type { Metadata } from "next";
import { Inter, Baloo_2, Fredoka } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { OrganizationSchema, WebsiteSchema } from "@/components/structured-data";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Spark - Ignite Learning for Indian Students",
    template: "%s | Spark"
  },
  description: "AI-powered educational platform designed for Indian students and teachers. Create engaging, interactive lessons with games, quizzes, and rewards. Learn faster with Spark!",
  keywords: [
    "online learning India",
    "AI education platform",
    "interactive lessons",
    "Indian students",
    "CBSE learning",
    "ICSE education",
    "educational technology",
    "e-learning India",
    "digital classroom",
    "personalized learning",
    "student engagement",
    "teacher resources",
    "gamified learning",
    "quiz platform",
    "homework help India"
  ],
  authors: [{ name: "Spark Education" }],
  creator: "Spark Education",
  publisher: "Spark Education",
  applicationName: "Spark",
  category: "Education",
  classification: "Education Technology",

  // Open Graph metadata
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["hi_IN", "en_US"],
    url: defaultUrl,
    siteName: "Spark",
    title: "Spark - Ignite Learning for Indian Students",
    description: "AI-powered educational platform designed for Indian students and teachers. Create engaging, interactive lessons with games, quizzes, and rewards.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Spark - Ignite Learning",
        type: "image/png",
      }
    ],
  },

  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "Spark - Ignite Learning for Indian Students",
    description: "AI-powered educational platform designed for Indian students and teachers. Create engaging, interactive lessons.",
    images: ["/twitter-image.png"],
    creator: "@sparkedu",
    site: "@sparkedu",
  },

  // App links for mobile
  appleWebApp: {
    capable: true,
    title: "Spark",
    statusBarStyle: "black-translucent",
  },

  // Verification for search engines
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    other: {
      "msvalidate.01": "your-bing-verification-code",
    },
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // Manifest
  manifest: "/manifest.json",
};

// Kid-Friendly Display Font - For headlines and fun elements
const fontDisplay = Baloo_2({
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  subsets: ["latin"],
});

// Primary Font - Playful and readable
const fontPrimary = Fredoka({
  variable: "--font-primary",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  subsets: ["latin"],
});

// Body Font - Clean and professional
const fontBody = Inter({
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Structured Data for SEO */}
        <OrganizationSchema url={defaultUrl} />
        <WebsiteSchema url={defaultUrl} />
      </head>
      <body
        className={`${fontDisplay.variable} ${fontPrimary.variable} ${fontBody.variable} font-body antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          storageKey="spark-theme"
        >
          {/* Skip to main content for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:shadow-lg"
          >
            Skip to main content
          </a>

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
