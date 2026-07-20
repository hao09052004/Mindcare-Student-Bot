import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mindcare - Chatbot Tư Vấn Tâm Lý Học Đường",
  description: "Chatbot AI hỗ trợ tâm lý học đường cho học sinh Việt Nam",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased">{children}</body>
    </html>
  );
}
