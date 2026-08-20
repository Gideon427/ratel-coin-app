import type { Metadata } from "next";
import { Inter } from "next/font/google";
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import ClientLayout from "./ClientLayout";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ratel Coin - The Wallet of Tech Solutions",
  description:
    "Secure, instant, reliable payments across the Tech Solutions ecosystem",
  applicationName: "Ratel Coin",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/logo.png",      // 👈 directly your logo
    apple: "/images/logo.png",     // 👈 directly your logo
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ratel Coin",
  },
  themeColor: "#dc2626",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}