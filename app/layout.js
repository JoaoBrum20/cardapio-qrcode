import './globals.css';

export const metadata = {
  title: 'Cardápio QR Code | Brasa Burger',
  description: 'Cardápio digital da Brasa Burger para pedidos por QR Code'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
