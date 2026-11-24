import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '스마트 재고관리 시스템 (Smart Inventory Manager)',
  description: '산업공학(IE) 기반 ROP 및 ABC 재고 분석 시스템 - Supabase & Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
