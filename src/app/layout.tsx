import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Multi-LLM Arena & Chat | OpenRouter & Supabase",
  description:
    "Run and compare multiple LLMs in parallel via OpenRouter with live token metrics, cost tracking, latency benchmarks, and Supabase logging.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-brand-500/20 selection:text-brand-900">
        {children}
      </body>
    </html>
  );
}
