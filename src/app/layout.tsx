import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { UserStateProvider } from "@/contexts/UserStateContext";
import { ReactQueryProvider } from '@/lib/react-query';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Hopium Prayer App',
  description: 'Track your prayers, build consistency, and deepen your spiritual connection.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ReactQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <UserStateProvider>
              {children}
              <Toaster />
            </UserStateProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
