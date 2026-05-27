import './globals.css';
import AppShell from '@/components/AppShell';
import { AppProvider } from '@/lib/context';
import { ThemeProvider } from '@/lib/theme';
import { ChatProvider } from '@/lib/chatContext';

export const metadata = {
  title: 'Chedder',
  description: 'Transform reading into a social experience',
  icons: {
    icon: '/chedder_logo.svg',
    shortcut: '/chedder_logo.svg',
    apple: '/chedder_logo.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#f0f2f5] dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
        <ThemeProvider>
          <AppProvider>
            <ChatProvider>
              <AppShell>{children}</AppShell>
            </ChatProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
