import type { Metadata } from "next";
import "./globals.css";
import { Urbanist } from "next/font/google";
import { cn } from "@/lib/utils";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const urbanist = Urbanist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Knowbook",
  description: "Knowbook - AI-powered knowledge creation and collaboration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-screen">
      <body className={cn("min-h-full", urbanist.className)}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
