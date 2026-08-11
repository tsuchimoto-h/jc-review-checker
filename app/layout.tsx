import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JC議案チェッカー",
  description: "青年会議所 議案文章の統一ルール校正ツール",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-ink-100 text-ink-900 antialiased">
        {children}
      </body>
    </html>
  );
}
