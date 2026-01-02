import './globals.css';
import type { Metadata } from 'next';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Promises',
  description: 'Keep your word, grow your trust',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Header />
        <main className="max-w-screen-md mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-amber-200 mt-16 py-8 text-center text-sm text-gray-500">
          <p>Keep your promises. Build trust. ✨</p>
        </footer>
      </body>
    </html>
  );
}
