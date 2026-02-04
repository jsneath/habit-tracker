import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ServiceWorkerProvider } from "@/components/providers/service-worker-provider";
import { Toaster } from "@/components/ui/sonner";
import { Navigation } from "@/components/shared/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Habit Tracker - Build Better Habits",
  description:
    "A beautiful habit tracking app to help you build lasting habits. Track your progress, celebrate streaks, and become your best self.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Habit Tracker",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Habit Tracker",
    title: "Habit Tracker - Build Better Habits",
    description: "Track your habits, celebrate your streaks, become your best self.",
  },
  twitter: {
    card: "summary",
    title: "Habit Tracker - Build Better Habits",
    description: "Track your habits, celebrate your streaks, become your best self.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ServiceWorkerProvider>
            <div className="relative min-h-screen bg-background">
              <main className="pb-20 md:pb-0 md:pl-64">
                <div className="container max-w-4xl mx-auto px-4 py-6">
                  {children}
                </div>
              </main>
              <Navigation />
            </div>
            <Toaster position="top-center" richColors closeButton />
          </ServiceWorkerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
