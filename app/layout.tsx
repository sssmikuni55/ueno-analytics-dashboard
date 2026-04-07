import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "サイト状況レポート | いちかがご案内します",
  description: "あなたのサイトのアクセス状況を、AIアシスタントのいちかがわかりやすくお伝えします。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen">
        <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 backdrop-blur-md bg-white/5 flex items-center px-8 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white p-1 border border-white/20 overflow-hidden shadow-sm flex items-center justify-center">
              <img src="/ueno-logo.png" alt="こども園うえの" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">サイト状況レポート</h1>
          </div>
          <div className="text-sm text-foreground/60 hidden sm:block">
            今日もサイトの様子を一緒に見ていきましょう
          </div>
        </header>
        <main className="pt-24 pb-12 px-4 sm:px-8 max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
