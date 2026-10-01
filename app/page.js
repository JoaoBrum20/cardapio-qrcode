'use client';

import { useEffect, useMemo, useState } from 'react';
import TestNav from '../components/TestNav';
import { buscarStatusPedido, criarPedido } from '../lib/padariaSupabase';

const categories = [
  'Todos', 'Mais pedidos', 'Smash Burgers', 'Burgers Artesanais', 'Combos',
  'Batatas e Porções', 'Molhos e Extras', 'Bebidas', 'Sobremesas'
];

const products = [
  ['Mais pedidos','Smash Bacon',27.90,'Pão brioche, blend bovino 100g, cheddar, bacon crocante, cebola caramelizada e molho da casa.'],
  ['Mais pedidos','Duplo Cheddar',32.90,'Pão brioche, 2 blends bovinos de 100g, cheddar em dobro, picles e molho especial.'],
  ['Mais pedidos','Burger da Casa',34.90,'Pão brioche, blend 160g, queijo, bacon, cebola caramelizada, alface, tomate e molho da casa.'],
  ['Mais pedidos','Combo Smash',39.90,'Smash cheddar + batata frita individual + refrigerante lata.'],
  ['Mais pedidos','Batata Cheddar e Bacon',24.90,'Batata frita crocante com creme de cheddar e bacon em cubos.'],

  ['Smash Burgers','Smash Simples',21.90,'Pão brioche, blend bovino 100g, queijo cheddar, cebola e molho da casa.'],
  ['Smash Burgers','Smash Salada',23.90,'Pão brioche, blend bovino 100g, cheddar, alface, tomate, cebola roxa e molho da casa.'],
  ['Smash Burgers','Smash Bacon',27.90,'Pão brioche, blend bovino 100g, cheddar, bacon crocante, cebola caramelizada e molho da casa.'],
  ['Smash Burgers','Smash Duplo',29.90,'Pão brioche, 2 blends bovinos de 100g, cheddar, picles e molho da casa.'],
  ['Smash Burgers','Smash Triplo',37.90,'Pão brioche, 3 blends bovinos de 100g, cheddar em camadas, cebola e molho especial.'],

  ['Burgers Artesanais','Burger Clássico',28.90,'Pão brioche, blend artesanal 160g, queijo prato, alface, tomate, cebola e maionese da casa.'],
  ['Burgers Artesanais','Burger Bacon',33.90,'Pão brioche, blend artesanal 160g, cheddar, bacon, cebola caramelizada e barbecue.'],
  ['Burgers Artesanais','Burger Gorgonzola',35.90,'Pão brioche, blend 160g, creme de gorgonzola, cebola crispy e rúcula.'],
  ['Burgers Artesanais','Burger Costela',38.90,'Pão brioche, blend 160g, costela desfiada, cheddar, sour cream e cebola roxa.'],
  ['Burgers Artesanais','Burger Picante',34.90,'Pão brioche, blend 160g, cheddar, bacon, jalapeño, cebola e molho picante.'],
  ['Burgers Artesanais','Burger Frango Crocante',29.90,'Pão brioche, filé de frango empanado, queijo, alface, tomate e maionese temperada.'],
  ['Burgers Artesanais','Burger Vegetariano',29.90,'Pão brioche, burger vegetal, queijo, alface, tomate, cebola roxa e molho especial.'],

  ['Combos','Combo Smash',39.90,'Smash cheddar + batata frita individual + refrigerante lata.'],
  ['Combos','Combo Bacon',45.90,'Smash bacon + batata frita individual + refrigerante lata.'],
  ['Combos','Combo Artesanal',49.90,'Burger da Casa + batata frita individual + refrigerante lata.'],
  ['Combos','Combo Duplo',79.90,'2 Smash Bacon + 2 batatas fritas individuais + refrigerante 1L.'],
  ['Combos','Combo Família',109.90,'4 Smash Simples + batata grande + nuggets + refrigerante 1,5L.'],

  ['Batatas e Porções','Batata Frita Individual',14.90,'Batata frita crocante e sequinha.'],
  ['Batatas e Porções','Batata Frita Grande',24.90,'Porção grande de batata frita para compartilhar.'],
  ['Batatas e Porções','Batata Cheddar e Bacon',24.90,'Batata frita com creme de cheddar e bacon em cubos.'],
  ['Batatas e Porções','Batata com Costela',29.90,'Batata frita com costela desfiada, cheddar e sour cream.'],
  ['Batatas e Porções','Onion Rings',19.90,'Porção com anéis de cebola empanados e crocantes.'],
  ['Batatas e Porções','Nuggets',18.90,'Porção de nuggets crocantes com molho da casa.'],

  ['Molhos e Extras','Molho da Casa',3.50,'Porção individual do molho especial da hamburgueria.'],
  ['Molhos e Extras','Barbecue',3.50,'Porção individual de molho barbecue.'],
  ['Molhos e Extras','Cheddar Cremoso',5.90,'Porção extra de cheddar cremoso.'],
  ['Molhos e Extras','Bacon Extra',6.90,'Porção extra de bacon crocante.'],

  ['Bebidas','Coca-Cola lata',7.90,'Lata 350 ml.'],
  ['Bebidas','Coca-Cola Zero lata',7.90,'Lata 350 ml.'],
  ['Bebidas','Guaraná lata',7.90,'Lata 350 ml.'],
  ['Bebidas','Refrigerante 1L',12.90,'Consulte os sabores disponíveis.'],
  ['Bebidas','Água mineral',5.00,'Água sem gás.'],
  ['Bebidas','Água com gás',6.00,'Água mineral com gás.'],

  ['Sobremesas','Brownie',12.90,'Brownie de chocolate com casquinha crocante e interior macio.'],
  ['Sobremesas','Pudim',11.90,'Pudim cremoso de leite condensado.'],
  ['Sobremesas','Milk-shake Chocolate',18.90,'Milk-shake cremoso de chocolate, 400 ml.'],
  ['Sobremesas','Milk-shake Morango',18.90,'Milk-shake cremoso de morango, 400 ml.']
].map((p, i) => ({ id: i + 1, category: p[0], name: p[1], price: p[2], description: p[3], image: '/images/smash-bacon.jpg' }));

const money = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

export default function Home() {
  const [category, setCategory] = useState('Todos');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [sentMessage, setSentMessage] = useState('');
  const [activeOrder, setActiveOrder] = useState(null);
  const [whatsapp, setWhatsapp] = useState('');
  const [marketingSaved, setMarketingSaved] = useState(false);
  const [showTracking, setShowTracking] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailQty, setDetailQty] = useState(1);
  const [detailNote, setDetailNote] = useState('');
  const [itemNotes, setItemNotes] = useState({});

  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const qrFromUrl = params?.get('qr') || params?.get('mesa') || '';
  const mesa = activeOrder?.table ?? (qrFromUrl || '—');

  useEffect(() => {
    let cancelled = false;

    const syncActiveOrder = async () => {
      const token = sessionStorage.getItem('padaria_active_order_token');
      if (!token) return;

      try {
        const current = await buscarStatusPedido(token);
        if (!current || cancelled) return;

        setActiveOrder({
          id: current.id,
          token: current.pedido_token,
          table: current.qr_numero,
          status: current.pronto ? 'PRONTO' : current.preparando ? 'PREPARANDO' : 'NOVO',
          items: Array.isArray(current.itens) ? current.itens : [],
          note: current.observacao || '',
          total: Number(current.total || 0),
          createdAt: current.criado_em,
        });
      } catch (error) {
        console.error('Erro ao acompanhar pedido:', error);
      }
    };

    syncActiveOrder();
    const interval = window.setInterval(syncActiveOrder, 1200);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((p) => (category === 'Todos' || p.category === category) && (!term || p.name.toLowerCase().includes(term)));
  }, [category, query]);

  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));

  const openProduct = (product) => {
    setSelectedProduct(product);
    setDetailQty(Math.max(1, cart[product.id] || 1));
    setDetailNote(itemNotes[product.id] || '');
  };

  const addFromDetail = () => {
    if (!selectedProduct) return;
    setCart((current) => ({ ...current, [selectedProduct.id]: detailQty }));
    setItemNotes((current) => ({ ...current, [selectedProduct.id]: detailNote.trim() }));
    setSelectedProduct(null);
  };
  const remove = (id) => setCart((c) => {
    const next = { ...c };
    if ((next[id] || 0) <= 1) delete next[id]; else next[id] -= 1;
    return next;
  });

  const cartItems = products
    .filter((p) => cart[p.id])
    .map((p) => ({ ...p, qty: cart[p.id], itemNote: itemNotes[p.id] || '' }));
  const totalQty = cartItems.reduce((s, p) => s + p.qty, 0);
  const total = cartItems.reduce((s, p) => s + p.qty * p.price, 0);

  const sendOrder = async () => {
    if (!cartItems.length) return;

    const table = qrFromUrl !== '' && Number.isFinite(Number(qrFromUrl))
      ? Math.max(0, Math.min(35, Number(qrFromUrl)))
      : Math.floor(Math.random() * 36);

    try {
      const created = await criarPedido({
        qrNumero: table,
        itens: cartItems.map((p) => ({ name: p.name, qty: p.qty, note: p.itemNote || '' })),
        observacao: orderNote.trim(),
        total,
      });

      const order = {
        id: created.id,
        token: created.pedido_token,
        table: created.qr_numero,
        status: created.pronto ? 'PRONTO' : created.preparando ? 'PREPARANDO' : 'NOVO',
        items: cartItems.map((p) => ({ name: p.name, qty: p.qty, note: p.itemNote || '' })),
        note: orderNote.trim(),
        total,
        createdAt: created.criado_em,
      };

      sessionStorage.setItem('padaria_active_order_token', String(created.pedido_token));
      sessionStorage.setItem('padaria_active_qr', String(table));

      setActiveOrder(order);
      setShowTracking(true);
      setCart({});
      setOrderNote('');
      setCartOpen(false);
      setSentMessage(`Pedido enviado para a Mesa ${table}`);
      setTimeout(() => setSentMessage(''), 3500);
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      setSentMessage('Não foi possível enviar o pedido. Tente novamente.');
      setTimeout(() => setSentMessage(''), 4000);
    }
  };

  const saveMarketingLead = () => {
    const cleaned = whatsapp.replace(/\D/g, '');
    if (cleaned.length < 10) return;

    let leads = [];
    try {
      leads = JSON.parse(localStorage.getItem('padaria_qr_marketing_leads_v1') || '[]');
      if (!Array.isArray(leads)) leads = [];
    } catch {
      leads = [];
    }

    const lead = {
      whatsapp: cleaned,
      qr: activeOrder?.table ?? mesa,
      createdAt: new Date().toISOString(),
      source: 'pos-pedido',
    };

    localStorage.setItem('padaria_qr_marketing_leads_v1', JSON.stringify([lead, ...leads]));
    setMarketingSaved(true);
  };

  const returnToMenu = () => {
    setShowTracking(false);
    setCart({});
    setOrderNote('');
  };

  const viewTracking = () => {
    setShowTracking(true);
  };

  if (activeOrder && showTracking) {
    const statusIndex = activeOrder.status === 'NOVO' ? 0 : activeOrder.status === 'PREPARANDO' ? 1 : 2;

    return (
      <main>
        <TestNav />
        <section className="customer-status-page">
          <div className="customer-status-card">
            <div className="status-kicker">QR / MESA {activeOrder.table}</div>
            <h1>
              {activeOrder.status === 'NOVO' && 'Pedido enviado à cozinha'}
              {activeOrder.status === 'PREPARANDO' && 'Seu pedido está em preparo'}
              {activeOrder.status === 'PRONTO' && 'Seu pedido está pronto'}
            </h1>
            <p className="status-subtitle">
              {activeOrder.status === 'NOVO' && 'Recebemos seu pedido. A equipe já consegue vê-lo no painel da hamburgueria.'}
              {activeOrder.status === 'PREPARANDO' && 'A equipe começou a preparar seus itens.'}
              {activeOrder.status === 'PRONTO' && 'Tudo certo. Seu pedido foi finalizado pela equipe.'}
            </p>

            <div className="status-steps">
              {['Enviado à cozinha', 'Em preparo', 'Pronto'].map((label, index) => (
                <div className={`status-step ${index <= statusIndex ? 'done' : ''}`} key={label}>
                  <div className="status-dot">{index < statusIndex ? '✓' : index + 1}</div>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className="status-order-summary">
              {activeOrder.items.map((item) => (
                <div key={item.name}><strong>{item.qty}×</strong><span>{item.name}</span></div>
              ))}
              {activeOrder.note && <p><strong>Obs.:</strong> {activeOrder.note}</p>}
            </div>

            <div className="tracking-actions">
              <button className="new-order-button" onClick={returnToMenu}>Voltar ao cardápio</button>
            </div>
          </div>

          <aside className="whatsapp-optin">
            <span className="optin-kicker">WHATSAPP</span>
            <h2>Quer receber novidades da hamburgueria?</h2>
            <p>Novos burgers, combos especiais, cupons e promoções direto pelo WhatsApp.</p>

            {!marketingSaved ? (
              <div className="optin-form">
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(22) 99999-9999"
                  inputMode="tel"
                  aria-label="Seu WhatsApp"
                />
                <button onClick={saveMarketingLead}>Quero receber novidades</button>
                <small>Opcional. Você escolhe se quer receber mensagens.</small>
              </div>
            ) : (
              <div className="optin-success">Pronto. Seu WhatsApp foi cadastrado nesta versão de teste.</div>
            )}
          </aside>
        </section>
      </main>
    );
  }

  return (
    <main>
      <TestNav />

      {activeOrder && (
        <div className="active-order-banner">
          <div>
            <strong>
              {activeOrder.status === 'NOVO' && 'Pedido enviado à cozinha'}
              {activeOrder.status === 'PREPARANDO' && 'Pedido em preparo'}
              {activeOrder.status === 'PRONTO' && 'Pedido pronto'}
            </strong>
            <span>QR / Mesa {activeOrder.table}</span>
          </div>
          <button onClick={viewTracking}>Acompanhar pedido</button>
        </div>
      )}

      <header className="hero">
        <div className="hero-inner">
          <div className="eyebrow">CARDÁPIO DIGITAL</div>
          <h1>Brasa Burger</h1>
          <p>Escolha seu burger, personalize o pedido e envie direto para a cozinha.</p>
          <div className="meta-row">
            <span>Mesa <strong>{mesa}</strong></span>
            <span>Aberto agora</span>
            <span>Preparo médio 10–20 min</span>
          </div>
        </div>
      </header>

      <section className="toolbar-wrap">
        <div className="toolbar">
          <label className="search">
            <span>Buscar</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Smash, bacon, batata, combo..." />
          </label>
          <div className="categories" aria-label="Categorias">
            {categories.map((c) => <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>)}
          </div>
        </div>
      </section>

      <section className="menu-shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{category === 'Todos' ? 'TODAS AS OPÇÕES' : category.toUpperCase()}</span>
            <h2>{category === 'Todos' ? 'Escolha o que vai pedir' : category}</h2>
          </div>
          <span className="count">{visible.length} itens</span>
        </div>

        <div className="grid">
          {visible.map((p) => {
            const qty = cart[p.id] || 0;
            return (
              <article className="card product-card-clickable" key={p.id} onClick={() => openProduct(p)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openProduct(p); }}>
                <div className="product-mark"><img src={p.image} alt={p.name} loading="lazy" /></div>
                <div className="card-body">
                  <div className="category-label">{p.category}</div>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <div className="card-footer">
                    <strong>{money(p.price)}</strong>
                    {qty === 0 ? (
                      <button className="add-btn" onClick={(e) => { e.stopPropagation(); openProduct(p); }}>Ver detalhes</button>
                    ) : (
                      <div className="stepper">
                        <button aria-label={`Remover ${p.name}`} onClick={(e) => { e.stopPropagation(); remove(p.id); }}>−</button>
                        <span>{qty}</span>
                        <button aria-label={`Adicionar ${p.name}`} onClick={(e) => { e.stopPropagation(); add(p.id); }}>+</button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {visible.length === 0 && <div className="empty">Nenhum item encontrado.</div>}
      </section>

      <footer>
        <div>Brasa Burger</div>
        <span>Cardápio demonstrativo • preços sujeitos a atualização</span>
      </footer>

      {totalQty > 0 && (
        <button className="cart-bar" onClick={() => setCartOpen(true)}>
          <span>{totalQty} {totalQty === 1 ? 'item' : 'itens'}</span>
          <strong>Ver pedido · {money(total)}</strong>
        </button>
      )}

      {sentMessage && <div className="order-success">{sentMessage}</div>}

      {selectedProduct && (
        <div className="product-detail-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedProduct(null); }}>
          <section className="product-detail-modal" role="dialog" aria-modal="true" aria-label={selectedProduct.name}>
            <button className="product-detail-close" onClick={() => setSelectedProduct(null)} aria-label="Fechar">×</button>

            <div className="product-detail-image">
              <img src={selectedProduct.image} alt={selectedProduct.name} />
            </div>

            <div className="product-detail-content">
              <span className="product-detail-category">{selectedProduct.category}</span>
              <h2>{selectedProduct.name}</h2>
              <p>{selectedProduct.description}</p>
              <strong className="product-detail-price">{money(selectedProduct.price)}</strong>

              <label className="product-detail-note">
                Observação deste item
                <textarea
                  value={detailNote}
                  onChange={(e) => setDetailNote(e.target.value)}
                  placeholder="Ex.: sem cebola, sem picles, molho à parte..."
                />
              </label>

              <div className="product-detail-bottom">
                <div className="product-detail-stepper">
                  <button onClick={() => setDetailQty((q) => Math.max(1, q - 1))}>−</button>
                  <strong>{detailQty}</strong>
                  <button onClick={() => setDetailQty((q) => q + 1)}>+</button>
                </div>
                <button className="product-detail-add" onClick={addFromDetail}>
                  {cart[selectedProduct.id] ? 'Atualizar item' : 'Adicionar'} · {money(selectedProduct.price * detailQty)}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {cartOpen && (
        <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setCartOpen(false); }}>
          <aside className="cart-panel" role="dialog" aria-modal="true" aria-label="Seu pedido">
            <div className="cart-head">
              <div><span className="eyebrow">MESA {mesa}</span><h2>Seu pedido</h2></div>
              <button className="close" onClick={() => setCartOpen(false)}>Fechar</button>
            </div>
            <div className="cart-list">
              {cartItems.map((p) => (
                <div className="cart-item" key={p.id}>
                  <div><strong>{p.name}</strong><span>{money(p.price)} cada</span>{p.itemNote && <small className="cart-item-note">Obs.: {p.itemNote}</small>}</div>
                  <div className="stepper">
                    <button onClick={() => remove(p.id)}>−</button><span>{p.qty}</span><button onClick={() => add(p.id)}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <label className="notes">Observações do pedido<textarea value={orderNote} onChange={(e) => setOrderNote(e.target.value)} placeholder="Ex.: molhos separados, ponto da carne, observações gerais..." /></label>
            <div className="total"><span>Total</span><strong>{money(total)}</strong></div>
            <button className="send" onClick={sendOrder}>Enviar pedido</button>
            <p className="demo-note">Versão de teste: a mesa é gerada aleatoriamente entre 0 e 35.</p>
          </aside>
        </div>
      )}
    </main>
  );
}
