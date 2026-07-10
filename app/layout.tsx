import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teachers — 교사 AI 플랫폼",
  description: "행정·소통·보호를 AI가 처리하는 교사 전용 플랫폼. 공문 30초, 민원 AI 중개, 교사 법적 보호.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
