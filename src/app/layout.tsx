import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bloco Bicharada — Gestão Carnaval 2027',
  description: 'Aplicativo oficial de gestão de integrantes, tarefas, calendário, repertório e desfile do Bloco Bicharada / Bixarada.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bicharada 2027',
  },
};

export const viewport: Viewport = {
  themeColor: '#E6007E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#FFFDF9] text-[#1E1B2E] antialiased selection:bg-[#E6007E] selection:text-white">
        {children}
      </body>
    </html>
  );
}

