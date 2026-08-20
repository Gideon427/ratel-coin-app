import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientLayout from "./ClientLayout";
import "./globals.css";
const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ratel Coin - The Wallet of Tech Solutions",
  description:
    "Secure, instant, reliable payments across the Tech Solutions ecosystem",
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