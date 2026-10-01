import './globals.css';

export const metadata = {
  title: 'Padaria da Vila | Cardápio',
  description: 'Cardápio digital para pedidos por QR Code'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
