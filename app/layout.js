import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Prepify",
  description:
    "Join Prepify and get AI-driven interview coaching, feedback, and expert insights to land your dream job!",
  keywords: [
    "AI interview coach",
    "mock interviews",
    "job preparation",
    "Prepify",
  ],
  authors: [{ name: "Prepify Team", url: "https://prepify.studio" }],
  openGraph: {
    title: "Prepify - AI-Powered Interview Coach",
    description:
      "Get AI-driven interview questions and feedback instantly. Prepare like never before!",
    url: "https://prepify.studio",
    siteName: "Prepify",
    images: [
      {
        url: "https://prepify.studio/og-image.png",
        width: 1200,
        height: 630,
        alt: "Prepify - AI Interview Coaching",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prepify - AI Interview Preparation",
    description:
      "Get AI-generated interview questions and instant feedback to ace your job interviews.",
    images: ["https://prepify.studio/twitter-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
