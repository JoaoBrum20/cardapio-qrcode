'use client';

import { useEffect, useMemo, useState } from 'react';
import TestNav from '../../components/TestNav';
import styles from './Pedidos.module.css';
import { finalizarPedido, listarPedidosAtivos, prepararPedido } from '../../lib/padariaSupabase';



export default function PedidosPage() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const syncOrders = async () => {
      try {
        const rows = await listarPedidosAtivos();
        if (cancelled) return;

        setOrders(rows.map((row) => ({
          id: row.id,
          table: row.qr_numero,
          status: row.preparando ? 'PREPARANDO' : 'NOVO',
          items: Array.isArray(row.itens) ? row.itens : [],
          note: row.observacao || '',
          total: Number(row.total || 0),
          createdAt: row.criado_em,
        })));
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
      }
    };

    syncOrders();
    const interval = window.setInterval(syncOrders, 1200);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== 'PRONTO').sort((a,b) => b.id - a.id),
    [orders]
  );

  const prepare = async (id) => {
    try {
      await prepararPedido(id);
      setOrders((current) => current.map((o) => o.id === id ? {...o, status:'PREPARANDO'} : o));
      setSelected((current) => current?.id === id ? {...current, status:'PREPARANDO'} : current);
    } catch (error) {
      console.error('Erro ao preparar pedido:', error);
    }
  };

  const finish = async (id) => {
    try {
      await finalizarPedido(id);
      setOrders((current) => current.filter((o) => o.id !== id));
      setSelected(null);
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
    }
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
