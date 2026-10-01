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
];

const orderFlow = ['NOVO', 'PREPARANDO', 'PRONTO', 'ENTREGUE'];

export default function PedidosPage() {
  const [orders, setOrders] = useState(initialOrders);

  const visibleOrders = useMemo(
    () => orders.filter((order) => order.status !== 'ENTREGUE'),
    [orders]
  );

  const advance = (id) => {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== id) return order;
        const currentIndex = orderFlow.indexOf(order.status);
        const nextStatus = orderFlow[Math.min(currentIndex + 1, orderFlow.length - 1)];
        return { ...order, status: nextStatus };
      })
    );
  };

  const buttonLabel = (status) => {
    if (status === 'NOVO') return 'Começar preparo';
    if (status === 'PREPARANDO') return 'Marcar como pronto';
    if (status === 'PRONTO') return 'Entregar pedido';
    return 'Entregue';
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
          <strong>{visibleOrders.length}</strong>
          <span>pedidos ativos</span>
        </div>
      </header>

      <section className="orders-grid">
        {visibleOrders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-top">
              <div>
                <span className="order-number">PEDIDO #{order.id}</span>
                <h2>MESA {order.table}</h2>
              </div>

              <div className="order-time">
                <span>Hora do pedido</span>
                <strong>{order.time}</strong>
              </div>
            </div>

            <div className="order-divider" />

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
              <span className={`status status-${order.status.toLowerCase()}`}>
                {order.status === 'NOVO' && 'Novo'}
                {order.status === 'PREPARANDO' && 'Preparando'}
                {order.status === 'PRONTO' && 'Pronto'}
              </span>

              <button onClick={() => advance(order.id)}>
                {buttonLabel(order.status)}
              </button>
            </div>
          </article>
        ))}
      </section>

      {visibleOrders.length === 0 && (
        <div className="orders-empty">
          <h2>Nenhum pedido ativo</h2>
          <p>Os novos pedidos aparecerão aqui.</p>
        </div>
      )}
    </main>
  );
}
