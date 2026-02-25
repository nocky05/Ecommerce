import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MusicMarket | Votre Spécialiste Musique en Côte d'Ivoire",
  description: "Découvrez le meilleur des instruments de musique, sonorisation et studio. Importation express en 10 jours depuis l'Europe. Livraison sécurisée partout en Côte d'Ivoire.",
  keywords: "instrument de musique, guitare, piano, batterie, sonorisation, studio, abidjan, côte d'ivoire, musicmarket, yamaha, fender, gibson",
  openGraph: {
    title: "MusicMarket | Votre Spécialiste Musique en Côte d'Ivoire",
    description: "Le meilleur du son européen livré chez vous en 10 jours. Qualité garantie.",
    url: "https://musicmarket.ci",
    siteName: "MusicMarket",
    locale: "fr_CI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MusicMarket | Votre Spécialiste Musique",
    description: "Instruments de musique et sonorisation en Côte d'Ivoire.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.className} antialiased min-h-screen`}>
        <Providers>
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
