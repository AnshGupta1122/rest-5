import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoginPopup from '@/components/LoginPopup';
import MobileBottomNav from '@/components/MobileBottomNav';
import { CartProvider } from '@/context/CartContext';
import { prisma } from '@/lib/prisma';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display' });

export async function generateMetadata(): Promise<Metadata> {
  let siteName = 'Spice Garden';
  let tagline = 'Authentic Indian Cuisine';
  try {
    const nameSetting = await prisma.settings.findUnique({ where: { key: 'restaurant_name' } });
    const taglineSetting = await prisma.settings.findUnique({ where: { key: 'restaurant_tagline' } });
    if (nameSetting?.value) siteName = nameSetting.value;
    if (taglineSetting?.value) tagline = taglineSetting.value;
  } catch(e) {}

  return {
    title: `${siteName} | ${tagline}`,
    description: 'Order delicious authentic Indian food directly from our kitchen to your table. Dine-in or delivery.',
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let siteName = 'Spice Garden';
  let siteIcon = '🌶️';
  try {
    const nameSetting = await prisma.settings.findUnique({ where: { key: 'restaurant_name' } });
    const iconSetting = await prisma.settings.findUnique({ where: { key: 'restaurant_icon' } });
    if (nameSetting?.value) siteName = nameSetting.value;
    if (iconSetting?.value) siteIcon = iconSetting.value;
  } catch(e) {}
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <CartProvider>
          <LoginPopup />
          <Navbar siteName={siteName} siteIcon={siteIcon} />
          <main>{children}</main>
          <Footer />
          <MobileBottomNav />
        </CartProvider>
      </body>
    </html>
  );
}
