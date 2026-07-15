import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";
import MaybeTopbar from "@/components/layout/MaybeTopbar";
import MaybeDashboardHeader from "@/components/layout/MaybeDashboardHeader";

export const viewport = {
  themeColor: "#0f172a",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UNIZIK Postgraduate LMS Report Portal",
  description: "A role-based academic reporting and tracking portal for UNIZIK postgraduate operations.",
  icons: {
    icon: "/unizik.png",
    shortcut: "/unizik.png",
    apple: "/unizik.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthSessionProvider>
          <MaybeTopbar />
          <MaybeDashboardHeader />
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
