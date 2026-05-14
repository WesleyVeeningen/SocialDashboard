import { Geist } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata = {
  title: 'Social Dashboard',
  description: 'Manage your Facebook Pages',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} dark`}>
      <body className="font-sans antialiased bg-background text-foreground h-full">
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
