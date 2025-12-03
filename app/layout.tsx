import type { Metadata } from "next";
import { Inter, Baloo_2, Fredoka } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Digital Lessons - Fun Learning for Kids",
  description: "AI-powered educational platform that generates engaging, interactive lessons for kids. Make learning fun with games, quizzes, and rewards!",
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontDisplay.variable} ${fontPrimary.variable} ${fontBody.variable} font-body antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="digital-lessons-theme"
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
