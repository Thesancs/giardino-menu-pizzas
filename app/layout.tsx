import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vino e Cucina - Cardapio",
  description: "Demo do All In Cardapio Digital para restaurantes."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
