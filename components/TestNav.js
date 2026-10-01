export default function TestNav() {
  return (
    <nav className="test-nav" aria-label="Navegação principal">
      <div className="test-nav-inner">
        <a className="test-brand" href="/">Padaria QR</a>
        <div className="test-links">
          <a href="/">Cardápio</a>
          <a href="/pedidos">Pedidos</a>
        </div>
      </div>
    </nav>
  );
}
