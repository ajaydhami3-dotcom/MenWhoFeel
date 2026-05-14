import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Men Who Feel",
  description: "A community and rebuild system for men.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} relative min-h-screen bg-[#060810]`}>
        {/* Subtle noise grain overlay for depth */}
        <div className="fixed inset-0 z-[-1] bg-[#060810]">
          {/* Faint radial glow in top-left for atmosphere */}
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-900/8 rounded-full blur-[100px] pointer-events-none" />
        </div>

        <Providers>
          <div className="min-h-screen flex flex-col bg-transparent">
            <Navbar />

            <div className="flex flex-1">
              <Sidebar />

              <main className="flex-1 min-w-0">
                {children}
              </main>
            </div>

            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}