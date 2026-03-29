import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import HeaderNav from "../components/HeaderNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MMA Club",
  description: "Club de MMA et sports de combat",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header className="fixed top-0 left-0 w-full text-white shadow-md z-50 rounded-b-xl">
          <div className="container mx-auto flex justify-between items-center p-2 px-6">
            {/* Espace gauche pour équilibrer */}
            <div className="w-24" />

            {/* Logo centré */}
            <Link href="/" className="flex items-center">
              <img src="images/logo.jpg" alt="Logo Club MMA" className="h-15 w-auto cursor-pointer rounded-full" />
            </Link>

            {/* Navigation utilisateur */}
            <div className="flex justify-end">
              <HeaderNav />
            </div>
          </div>
        </header>

        <div className="h-20"></div> {/* espace pour la barre fixe */}

        {children}
      </body>
    </html>
  );
}