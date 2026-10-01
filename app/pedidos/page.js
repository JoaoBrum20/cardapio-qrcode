'use client';

import { useEffect, useMemo, useState } from 'react';
import TestNav from '../../components/TestNav';
import styles from './Pedidos.module.css';



const STORAGE_KEY = 'padaria_qr_orders_v1';

const readStoredOrders = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function PedidosPage() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const syncOrders = () => {
      const stored = readStoredOrders();
      setOrders(stored);
    };

    syncOrders();
    window.addEventListener('storage', syncOrders);
    window.addEventListener('padaria-orders-updated', syncOrders);
    const interval = window.setInterval(syncOrders, 1500);

    return () => {
      window.removeEventListener('storage', syncOrders);
      window.removeEventListener('padaria-orders-updated', syncOrders);
      window.clearInterval(interval);
    };
  }, []);

  const persistStoredOrders = (nextOrders) => {
    const storedOnly = nextOrders.filter((order) => order.persisted);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedOnly));
  };

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== 'PRONTO').sort((a,b) => b.id - a.id),
    [orders]
  );

  const prepare = (id) => {
    setOrders((current) => {
      const next = current.map((o) => o.id === id ? {...o, status:'PREPARANDO'} : o);
      persistStoredOrders(next);
      return next;
    });
    setSelected((current) => current?.id === id ? {...current, status:'PREPARANDO'} : current);
  };

  const finish = (id) => {
    setOrders((current) => {
      const next = current.map((o) => o.id === id ? {...o, status:'PRONTO'} : o);
      persistStoredOrders(next);
      return next;
    });
    setSelected(null);
  };

  const action = (order, event) => {
    event.stopPropagation();
    if (order.status === 'NOVO') prepare(order.id);
    else finish(order.id);
  };

  return (
    <main className={styles.page}>
      <TestNav />
      <header className={styles.topbar}>
        <h1>Pedidos</h1>
        <div className={styles.counter}><strong>{activeOrders.length}</strong> ativos</div>
      </header>

      <section className={styles.board}>
        {activeOrders.map((order) => (
          <article
            key={order.id}
            className={`${styles.ticket} ${order.status === 'PREPARANDO' ? styles.preparing : styles.newOrder}`}
            onClick={() => setSelected(order)}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected(order); }}
          >
            <header className={styles.ticketHead}>
              <div>
                <strong>Mesa {order.table}</strong>
                <span>{order.status === 'PREPARANDO' ? 'Preparando' : 'Novo pedido'}</span>
              </div>
            </header>

            <div className={styles.ticketBody}>
              <div className={styles.items}>
                {order.items.map((item) => (
                  <div className={styles.item} key={item.name}>
                    <strong>{item.qty}×</strong>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>

              {order.note && (
                <div className={styles.note}>
                  <small>OBSERVAÇÃO</small>
                  <strong>{order.note}</strong>
                </div>
              )}
            </div>

            <button className={styles.action} onClick={(e) => action(order,e)}>
              {order.status === 'NOVO' ? 'PREPARAR' : 'PRONTO'}
            </button>
          </article>
        ))}
      </section>

      {selected && selected.status !== 'PRONTO' && (
        <div className={styles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <article className={`${styles.expanded} ${selected.status === 'PREPARANDO' ? styles.preparing : styles.newOrder}`}>
            <header className={styles.expandedHead}>
              <div>
                <span>{selected.status === 'PREPARANDO' ? 'PREPARANDO' : 'NOVO PEDIDO'}</span>
                <h2>Mesa {selected.table}</h2>
              </div>
              <button onClick={() => setSelected(null)}>×</button>
            </header>

            <div className={styles.expandedItems}>
              {selected.items.map((item) => (
                <div key={item.name}>
                  <strong>{item.qty}×</strong>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>

            {selected.note && (
              <div className={styles.expandedNote}>
                <small>OBSERVAÇÃO</small>
                <strong>{selected.note}</strong>
              </div>
            )}

            <button className={styles.expandedAction} onClick={(e) => action(selected,e)}>
              {selected.status === 'NOVO' ? 'PREPARAR PEDIDO' : 'MARCAR COMO PRONTO'}
            </button>
          </article>
        </div>
      )}
    </main>
  );
}
