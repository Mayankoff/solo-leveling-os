import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SoloOS | Personal Life Management",
  description: "Notion-inspired gamified life management dashboard.",
};

import { Toaster } from "sonner";
import { getUserTimezone } from "@/actions/settings";
import TimezoneSync from "@/components/TimezoneSync";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const timeZone = await getUserTimezone();

  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      >
        <body className="min-h-full flex overflow-hidden">
          <TimezoneSync serverTimezone={timeZone} />
          <Sidebar />
          <main className="flex-1 md:ml-64 h-screen overflow-y-auto">
            {children}
          </main>
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              className: "system-window font-mono text-[#00e5ff] !bg-[rgba(10,15,30,0.9)] !border-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.3)]",
              descriptionClassName: "text-[#e0f7fa] font-sans opacity-80"
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
