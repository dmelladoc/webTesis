import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Biblioteca de Referencias - Diego Mellado",
  description: "Gestión de fuentes bibliográficas para investigación, presentaciones y artículos desarrollados sobre cáncer de mama",
  keywords: [
    "referencias bibliográficas",
    "cáncer de mama",
    "investigación",
    "BibTeX",
    "gestión de referencias",
    "artículos científicos",
    "mamografía",
    "deep learning",
  ],
  authors: [
    {
      name: "DeerLabs",
      url: "https://github.com/dmelladoc",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
