import './globals.css';
import type { Metadata } from 'next';
import Sidebar from '../components/Sidebar';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Gerador de Provas',
  description: 'Gerador de Provas e Cartões-Resposta',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Toaster
          position="top-center"
          toastOptions={{
            // Adiciona nossa classe 'no-print' a todas as notificações
            className: 'no-print',
          }}
        />
        <div id="main-content-wrapper" className="flex h-screen bg-gray-100">
          <div className="no-print">
            <Sidebar />
          </div>
          <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
