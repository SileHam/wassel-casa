import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wassel Casa — Les bonnes adresses, à votre porte",
  description: "Votre quartier, vos envies. Une nouvelle expérience de livraison à Casablanca. Démonstration interactive.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
