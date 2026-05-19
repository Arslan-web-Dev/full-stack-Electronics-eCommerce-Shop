import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'svgmap/dist/svgMap.min.css';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Electronics eCommerce Shop",
  description: "Modern electronics eCommerce shop with admin dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body className={inter.className}>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
