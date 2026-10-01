'use client';

import { useMemo, useState } from 'react';

const categories = [
  'Todos', 'Cafés', 'Pães e Torradas', 'Lanches', 'Salgados', 'Pães de Queijo',
  'Sanduíches Naturais', 'Tapiocas', 'Omeletes', 'Combos', 'Bolos',
  'Doces e Sobremesas', 'Croissants e Folhados', 'Sucos Naturais',
  'Vitaminas', 'Bebidas', 'Porções'
];

const products = [
  ['Cafés','Café expresso',7.00,'Café intenso, servido na hora.'],
  ['Cafés','Café coado',6.30,'Tradicional e fresquinho.'],
  ['Cafés','Café com leite',9.80,'Café coado com leite quente.'],
  ['Cafés','Cappuccino tradicional',12.60,'Café, leite cremoso e canela.'],
  ['Cafés','Cappuccino com chocolate',14.00,'Cappuccino cremoso com chocolate.'],
  ['Cafés','Mocaccino',15.40,'Café, leite e chocolate.'],
  ['Cafés','Café gelado',14.00,'Café refrescante servido gelado.'],
  ['Cafés','Latte',12.60,'Café suave com bastante leite.'],
  ['Cafés','Chocolate quente',14.00,'Chocolate quente e cremoso.'],
  ['Pães e Torradas','Pão francês',1.68,'Pão francês tradicional.'],
  ['Pães e Torradas','Pão francês com manteiga',6.30,'Pão francês com manteiga.'],
  ['Pães e Torradas','Pão na chapa',7.70,'Dourado na chapa.'],
  ['Pães e Torradas','Pão com requeijão',8.40,'Pão francês com requeijão.'],
  ['Pães e Torradas','Pão com manteiga na chapa',8.40,'Pão crocante com manteiga.'],
  ['Pães e Torradas','Pão integral',3.50,'Opção integral.'],
  ['Pães e Torradas','Torradas com manteiga',9.10,'Torradas crocantes.'],
  ['Pães e Torradas','Cesta de pães',16.80,'Seleção de pães da casa.'],
  ['Lanches','Misto quente',14.00,'Presunto e queijo na chapa.'],
  ['Lanches','Queijo quente',12.60,'Sanduíche quente de queijo.'],
  ['Lanches','Presunto e queijo',14.00,'Clássico da padaria.'],
  ['Lanches','Pão com ovo',11.20,'Pão francês com ovo.'],
  ['Lanches','Pão com ovo e queijo',14.00,'Ovo e queijo derretido.'],
  ['Lanches','Pão com linguiça',16.80,'Linguiça grelhada no pão.'],
  ['Lanches','Pão com carne',19.60,'Carne grelhada no pão.'],
  ['Lanches','X-Burguer',21.00,'Hambúrguer e queijo.'],
  ['Lanches','X-Salada',23.80,'Hambúrguer, queijo e salada.'],
  ['Lanches','X-Bacon',26.60,'Hambúrguer, queijo e bacon.'],
  ['Lanches','Bauru',22.40,'Presunto, queijo, tomate e orégano.'],
  ['Salgados','Coxinha de frango',9.80,'Coxinha tradicional de frango.'],
  ['Salgados','Coxinha com catupiry',11.20,'Frango com recheio cremoso.'],
  ['Salgados','Quibe',9.80,'Quibe frito tradicional.'],
  ['Salgados','Risole de queijo',9.80,'Risole crocante de queijo.'],
  ['Salgados','Risole de presunto e queijo',10.50,'Presunto e queijo.'],
  ['Salgados','Enroladinho de salsicha',9.80,'Enroladinho assado.'],
  ['Salgados','Pastel assado de frango',11.20,'Pastel assado com frango.'],
  ['Salgados','Pastel assado de carne',11.20,'Pastel assado com carne.'],
  ['Salgados','Empada de frango',11.90,'Empada amanteigada de frango.'],
  ['Salgados','Empada de palmito',12.60,'Empada de palmito.'],
  ['Salgados','Esfiha de carne',11.20,'Esfiha assada de carne.'],
  ['Salgados','Esfiha de frango',11.20,'Esfiha assada de frango.'],
  ['Pães de Queijo','Pão de queijo pequeno',4.20,'Pão de queijo tradicional.'],
  ['Pães de Queijo','Pão de queijo grande',8.40,'Porção individual maior.'],
  ['Pães de Queijo','Pão de queijo com requeijão',11.20,'Recheado com requeijão.'],
  ['Pães de Queijo','Pão de queijo com peito de peru',14.00,'Recheado com peito de peru.'],
  ['Sanduíches Naturais','Frango com cenoura',16.80,'Frango desfiado e cenoura.'],
  ['Sanduíches Naturais','Peito de peru com queijo',18.20,'Peito de peru e queijo.'],
  ['Sanduíches Naturais','Atum',19.60,'Sanduíche natural de atum.'],
  ['Sanduíches Naturais','Frango com cream cheese',19.60,'Frango e cream cheese.'],
  ['Sanduíches Naturais','Vegetariano',16.80,'Vegetais frescos e queijo.'],
  ['Tapiocas','Tapioca com manteiga',11.20,'Tapioca simples com manteiga.'],
  ['Tapiocas','Tapioca de queijo',14.00,'Queijo derretido.'],
  ['Tapiocas','Tapioca de presunto e queijo',16.80,'Presunto e queijo.'],
  ['Tapiocas','Tapioca de frango com requeijão',19.60,'Frango e requeijão.'],
  ['Tapiocas','Tapioca de carne seca com queijo',22.40,'Carne seca e queijo.'],
  ['Tapiocas','Tapioca de banana com canela',15.40,'Banana e canela.'],
  ['Omeletes','Omelete simples',14.00,'Omelete tradicional.'],
  ['Omeletes','Omelete com queijo',16.80,'Omelete com queijo.'],
  ['Omeletes','Omelete de presunto e queijo',19.60,'Presunto e queijo.'],
  ['Omeletes','Omelete de frango',21.00,'Frango desfiado.'],
  ['Omeletes','Omelete completo',25.20,'Ovo, queijo, presunto e acompanhamentos.'],
  ['Combos','Café + pão com manteiga',12.60,'Combo clássico.'],
  ['Combos','Café com leite + pão na chapa',15.40,'Café com leite e pão na chapa.'],
  ['Combos','Café + misto quente',19.60,'Café e misto quente.'],
  ['Combos','Cappuccino + pão de queijo',18.20,'Cappuccino e pão de queijo.'],
  ['Combos','Suco + misto quente',22.40,'Suco natural e misto quente.'],
  ['Combos','Café da manhã completo',33.60,'Café, pão, ovos e suco.'],
  ['Bolos','Bolo de cenoura com chocolate',11.20,'Fatia de bolo com cobertura.'],
  ['Bolos','Bolo de chocolate',11.20,'Fatia de bolo de chocolate.'],
  ['Bolos','Bolo de laranja',9.80,'Fatia de bolo de laranja.'],
  ['Bolos','Bolo de fubá',9.80,'Fatia de bolo de fubá.'],
  ['Bolos','Bolo de milho',11.20,'Fatia de bolo de milho.'],
  ['Bolos','Bolo de coco',11.20,'Fatia de bolo de coco.'],
  ['Bolos','Bolo de banana',11.20,'Fatia de bolo de banana.'],
  ['Bolos','Fatia de bolo recheado',16.80,'Consulte o sabor do dia.'],
  ['Doces e Sobremesas','Brigadeiro',5.60,'Brigadeiro tradicional.'],
  ['Doces e Sobremesas','Beijinho',5.60,'Beijinho tradicional.'],
  ['Doces e Sobremesas','Pudim',11.20,'Fatia de pudim.'],
  ['Doces e Sobremesas','Quindim',9.80,'Quindim individual.'],
  ['Doces e Sobremesas','Torta de limão',14.00,'Fatia de torta de limão.'],
  ['Doces e Sobremesas','Torta de chocolate',15.40,'Fatia de torta de chocolate.'],
  ['Doces e Sobremesas','Cheesecake',16.80,'Fatia de cheesecake.'],
  ['Doces e Sobremesas','Brownie',12.60,'Brownie de chocolate.'],
  ['Doces e Sobremesas','Sonho de creme',9.80,'Sonho recheado com creme.'],
  ['Doces e Sobremesas','Sonho de doce de leite',9.80,'Sonho recheado com doce de leite.'],
  ['Croissants e Folhados','Croissant simples',11.20,'Croissant amanteigado.'],
  ['Croissants e Folhados','Croissant de queijo',14.00,'Croissant recheado com queijo.'],
  ['Croissants e Folhados','Croissant de presunto e queijo',16.80,'Presunto e queijo.'],
  ['Croissants e Folhados','Croissant de chocolate',15.40,'Croissant recheado com chocolate.'],
  ['Croissants e Folhados','Folhado de frango',12.60,'Massa folhada com frango.'],
  ['Croissants e Folhados','Folhado de queijo',12.60,'Massa folhada com queijo.'],
  ['Sucos Naturais','Suco de laranja',12.60,'Suco natural.'],
  ['Sucos Naturais','Suco de limão',11.20,'Suco natural.'],
  ['Sucos Naturais','Suco de abacaxi',12.60,'Suco natural.'],
  ['Sucos Naturais','Suco de maracujá',12.60,'Suco natural.'],
  ['Sucos Naturais','Suco de acerola',12.60,'Suco natural.'],
  ['Sucos Naturais','Suco de manga',14.00,'Suco natural.'],
  ['Sucos Naturais','Suco de morango',15.40,'Suco natural.'],
  ['Sucos Naturais','Laranja com acerola',15.40,'Mistura natural.'],
  ['Vitaminas','Vitamina de banana',14.00,'Batida com leite.'],
  ['Vitaminas','Vitamina de mamão',14.00,'Batida com leite.'],
  ['Vitaminas','Vitamina de morango',16.80,'Batida com leite.'],
  ['Vitaminas','Vitamina de abacate',16.80,'Batida cremosa.'],
  ['Vitaminas','Banana com aveia',16.80,'Vitamina de banana com aveia.'],
  ['Bebidas','Água mineral',5.60,'Água sem gás.'],
  ['Bebidas','Água com gás',7.00,'Água gaseificada.'],
  ['Bebidas','Refrigerante lata',8.40,'Consulte sabores.'],
  ['Bebidas','Refrigerante 600 ml',11.20,'Consulte sabores.'],
  ['Bebidas','Chá gelado',9.80,'Chá gelado.'],
  ['Bebidas','Água de coco',11.20,'Água de coco.'],
  ['Bebidas','Energético',16.80,'Lata.'],
  ['Porções','Batata frita',25.20,'Porção de batatas fritas.'],
  ['Porções','Aipim frito',25.20,'Porção de aipim frito.'],
  ['Porções','Calabresa acebolada',30.80,'Calabresa com cebola.'],
  ['Porções','Mini salgados',35.00,'Porção variada.'],
  ['Porções','Porção de pão de queijo',28.00,'Pães de queijo para compartilhar.']
].map((p, i) => ({ id: i + 1, category: p[0], name: p[1], price: p[2], description: p[3] }));

const money = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

export default function Home() {
  const [category, setCategory] = useState('Todos');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);

  const mesa = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('mesa') || '12' : '12';

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((p) => (category === 'Todos' || p.category === category) && (!term || p.name.toLowerCase().includes(term)));
  }, [category, query]);

  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const remove = (id) => setCart((c) => {
    const next = { ...c };
    if ((next[id] || 0) <= 1) delete next[id]; else next[id] -= 1;
    return next;
  });

  const cartItems = products.filter((p) => cart[p.id]).map((p) => ({ ...p, qty: cart[p.id] }));
  const totalQty = cartItems.reduce((s, p) => s + p.qty, 0);
  const total = cartItems.reduce((s, p) => s + p.qty * p.price, 0);

  return (
    <main>
      <header className="hero">
        <div className="hero-inner">
          <div className="eyebrow">CARDÁPIO DIGITAL</div>
          <h1>Padaria da Vila</h1>
          <p>Peça direto da mesa. Seu pedido vai para o balcão sem precisar chamar o atendimento.</p>
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
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Café, coxinha, bolo..." />
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
              <article className="card" key={p.id}>
                <div className="product-mark" aria-hidden="true"><span>{p.name.slice(0,1)}</span></div>
                <div className="card-body">
                  <div className="category-label">{p.category}</div>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <div className="card-footer">
                    <strong>{money(p.price)}</strong>
                    {qty === 0 ? (
                      <button className="add-btn" onClick={() => add(p.id)}>Adicionar</button>
                    ) : (
                      <div className="stepper">
                        <button aria-label={`Remover ${p.name}`} onClick={() => remove(p.id)}>−</button>
                        <span>{qty}</span>
                        <button aria-label={`Adicionar ${p.name}`} onClick={() => add(p.id)}>+</button>
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
        <div>Padaria da Vila</div>
        <span>Cardápio demonstrativo • preços sujeitos a atualização</span>
      </footer>

      {totalQty > 0 && (
        <button className="cart-bar" onClick={() => setCartOpen(true)}>
          <span>{totalQty} {totalQty === 1 ? 'item' : 'itens'}</span>
          <strong>Ver pedido · {money(total)}</strong>
        </button>
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
                  <div><strong>{p.name}</strong><span>{money(p.price)} cada</span></div>
                  <div className="stepper">
                    <button onClick={() => remove(p.id)}>−</button><span>{p.qty}</span><button onClick={() => add(p.id)}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <label className="notes">Observações do pedido<textarea placeholder="Ex.: café sem açúcar, cortar sanduíche ao meio..." /></label>
            <div className="total"><span>Total</span><strong>{money(total)}</strong></div>
            <button className="send" onClick={() => alert('Nesta primeira publicação o cardápio e o carrinho já funcionam. O envio real para a tela da padaria será ligado na próxima etapa com o banco de pedidos.')}>Enviar pedido</button>
            <p className="demo-note">Primeira versão: cardápio e carrinho. Integração com a tela da padaria entra na próxima etapa.</p>
          </aside>
        </div>
      )}
    </main>
  );
}
