import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GHL Supabase Sync",
  description: "Sync GoHighLevel data to Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
          <Sidebar />
          <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 w-full">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
