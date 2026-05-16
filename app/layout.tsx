import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Giardino Trattoria - Cardápio de Pizzas",
  description: "Cardápio de pizzas do Giardino Trattoria."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
