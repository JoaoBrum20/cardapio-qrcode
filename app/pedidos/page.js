'use client';

import { useMemo, useState } from 'react';
import TestNav from '../../components/TestNav';

const initialOrders = [
  {
    id: 184,
    table: 12,
    time: '14:35',
    status: 'NOVO',
    items: [
      { name: 'Café com leite', qty: 2 },
      { name: 'Pão na chapa', qty: 1 },
      { name: 'Coxinha de frango', qty: 3 },
    ],
    note: '1 café sem açúcar',
  },
  {
    id: 185,
    table: 7,
    time: '14:41',
    status: 'NOVO',
    items: [
      { name: 'Cappuccino tradicional', qty: 1 },
      { name: 'Pão de queijo grande', qty: 2 },
    ],
    note: 'Aquecer bem',
  },
  {
    id: 186,
    table: 3,
    time: '14:46',
    status: 'PREPARANDO',
    items: [
      { name: 'Misto quente', qty: 2 },
      { name: 'Suco de laranja', qty: 2 },
    ],
    note: '',
  },
  {
    id: 187,
    table: 5,
    time: '14:49',
    status: 'NOVO',
    items: [
      { name: 'Café expresso', qty: 2 },
      { name: 'Pão de queijo grande', qty: 1 },
      { name: 'Bolo de cenoura com chocolate', qty: 1 },
    ],
    note: 'Café sem açúcar',
  },
  {
    id: 188,
    table: 9,
    time: '14:52',
    status: 'PREPARANDO',
    items: [
      { name: 'Pão com ovo e queijo', qty: 2 },
      { name: 'Suco de maracujá', qty: 1 },
    ],
    note: '',
  },
  {
    id: 189,
    table: 2,
    time: '14:56',
    status: 'NOVO',
    items: [
      { name: 'Coxinha com catupiry', qty: 4 },
      { name: 'Refrigerante lata', qty: 2 },
    ],
    note: '2 refrigerantes sem gelo',
  },
  {
    id: 190,
    table: 15,
    time: '15:01',
    status: 'PRONTO',
    items: [
      { name: 'Cappuccino tradicional', qty: 2 },
      { name: 'Croissant de queijo', qty: 2 },
    ],
    note: '',
  },
  {
    id: 191,
    table: 4,
    time: '15:04',
    status: 'NOVO',
    items: [
      { name: 'Tapioca de queijo', qty: 1 },
      { name: 'Café coado', qty: 1 },
      { name: 'Água mineral', qty: 1 },
    ],
    note: 'Tapioca bem passada',
  },
  {
    id: 192,
    table: 11,
    time: '15:08',
    status: 'PREPARANDO',
    items: [
      { name: 'X-Burguer', qty: 2 },
      { name: 'Batata frita', qty: 1 },
      { name: 'Refrigerante 600 ml', qty: 2 },
    ],
    note: 'Sem cebola',
  },
  {
    id: 193,
    table: 8,
    time: '15:12',
    status: 'NOVO',
    items: [
      { name: 'Pudim', qty: 2 },
      { name: 'Café com leite', qty: 2 },
    ],
    note: '',
  },
  {
    id: 194,
    table: 6,
    time: '15:15',
    status: 'PRONTO',
    items: [
      { name: 'Omelete com queijo', qty: 1 },
      { name: 'Suco de laranja', qty: 1 },
    ],
    note: 'Sem sal',
  },
  {
    id: 195,
    table: 10,
    time: '15:18',
    status: 'NOVO',
    items: [
      { name: 'Misto quente', qty: 3 },
      { name: 'Chocolate quente', qty: 2 },
    ],
    note: 'Cortar os mistos ao meio',
  },
]


const PAGE_SIZE = 8;

export default function PedidosPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [page, setPage] = useState(1);

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== 'ENTREGUE'),
    [orders]
  );

  const totalPages = Math.max(1, Math.ceil(activeOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageOrders = activeOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const markReady = (id) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, status: 'PRONTO' } : order
      )
    );
  };

  return (
    <main className="orders-page">
      <TestNav />

      <header className="orders-header">
        <div>
          <span className="orders-kicker">PAINEL DA PADARIA</span>
          <h1>Pedidos</h1>
        </div>

        <div className="orders-summary">
          <strong>{activeOrders.length}</strong>
          <span>pedidos ativos</span>
        </div>
      </header>

      <section className="orders-grid">
        {pageOrders.map((order) => (
          <article className={`order-card ${order.status === 'PRONTO' ? 'is-ready' : ''}`} key={order.id}>
            <div className="order-table-head">
              <h2>Mesa {order.table}</h2>
            </div>

            <div className="order-card-content">
              <div className="order-items">
                {order.items.map((item) => (
                  <div className="order-item" key={item.name}>
                    <strong className="item-qty">{item.qty}x</strong>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>

              {order.note && (
                <div className="order-note">
                  <span>Observação</span>
                  <strong>{order.note}</strong>
                </div>
              )}

              <div className="order-footer">
                <button
                  className="ready-button"
                  disabled={order.status === 'PRONTO'}
                  onClick={() => markReady(order.id)}
                >
                  {order.status === 'PRONTO' ? 'Pronto' : 'Marcar como pronto'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <div className="orders-pagination">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </button>

        <span>Página {currentPage} de {totalPages}</span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Próxima
        </button>
      </div>

      {activeOrders.length === 0 && (
        <div className="orders-empty">
          <h2>Nenhum pedido ativo</h2>
          <p>Os novos pedidos aparecerão aqui.</p>
        </div>
      )}
    </main>
  );
}
