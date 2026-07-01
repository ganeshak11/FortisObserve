import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fortis Observe",
  description: "Real-time SOC/NOC Observability Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning className={`${inter.className} bg-black text-slate-200 flex min-h-screen overflow-hidden`}>
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto relative">
          {children}
        </main>
      </body>
    </html>
  );
}
