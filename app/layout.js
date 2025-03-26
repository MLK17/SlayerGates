import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from './components/NavBar';
import Footer from "./components/Footer";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'SlayerGates',
  description: 'Plateforme de tournois esport',
  icons: {
    icon: [
      { url: '/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/favicon_io/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon_io/favicon.ico'
      },
      { rel: 'android-chrome-192x192', url: '/favicon_io/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'android-chrome-512x512', url: '/favicon_io/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/favicon_io/site.webmanifest',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased`}
      >
        <NavBar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
