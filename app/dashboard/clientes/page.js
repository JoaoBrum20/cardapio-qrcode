'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './Clientes.module.css';

const PAGE_SIZE_OPTIONS = [25, 50, 100];

function money(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(Number(value || 0));
}

function dateLabel(value) {
  if (!value) return 'Sem pedido';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date);
}

function daysLabel(value) {
  if (value == null) return 'Sem pedido';
  return `${Math.max(0, Math.round(Number(value)))} dias`;
}

function frequencyLabel(value) {
  if (value == null) return '—';
  const number = Math.round(Number(value) * 10) / 10;
  return `${number.toLocaleString('pt-BR')} dias`;
}

function phoneLabel(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '—';
  const local = digits.startsWith('55') ? digits.slice(2) : digits;
  if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  return value;
}

export default function ClientesDashboardPage() {
  const [query, setQuery] = useState('');
  const [inactivity, setInactivity] = useState(0);
  const [order, setOrder] = useState('pedidos30-desc');
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);

  const [applied, setApplied] = useState({
    query: '',
    inactivity: 0,
    order: 'pedidos30-desc',
    pageSize: 50,
  });

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    filteredCount: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const changed = useMemo(() => (
    query.trim() !== applied.query ||
    inactivity !== applied.inactivity ||
    order !== applied.order ||
    pageSize !== applied.pageSize
  ), [query, inactivity, order, pageSize, applied]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/dashboard/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          page,
          pageSize: applied.pageSize,
          query: applied.query,
          inactivity: applied.inactivity,
          order: applied.order,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Não foi possível carregar os clientes.');
      }

      setItems(Array.isArray(payload.data) ? payload.data : []);
      setPagination(payload.pagination || {
        page: 1,
        pageSize: applied.pageSize,
        filteredCount: 0,
        totalPages: 1,
      });
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes.');
    } finally {
      setLoading(false);
    }
  }, [page, applied]);

  useEffect(() => {
    load();
  }, [load]);

  function applyFilters() {
    setApplied({
      query: query.trim(),
      inactivity,
      order,
      pageSize,
    });
    setPage(1);
  }

  const start = pagination.filteredCount === 0 ? 0 : ((pagination.page - 1) * pagination.pageSize) + 1;
  const end = Math.min(pagination.page * pagination.pageSize, pagination.filteredCount);

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span>BRASA</span>
          <strong>Dashboard</strong>
        </div>

        <nav className={styles.nav}>
          <a href="/dashboard">Visão geral</a>
          <a className={styles.active} href="/dashboard/clientes">Clientes</a>
          <a href="/pedidos">Pedidos</a>
          <span>Produtos</span>
          <span>Relatórios</span>
        </nav>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>GESTÃO DE CLIENTES</span>
            <h1>Clientes</h1>
            <p>Acompanhe frequência, recência, ticket e comportamento de compra.</p>
          </div>
          <button className={styles.secondaryButton} onClick={load} disabled={loading}>
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </header>

        <section className={styles.summary}>
          <div>
            <span>Clientes encontrados</span>
            <strong>{pagination.filteredCount}</strong>
          </div>
          <div>
            <span>Na página</span>
            <strong>{items.length}</strong>
          </div>
          <div>
            <span>Filtro de inatividade</span>
            <strong>{applied.inactivity ? `+${applied.inactivity} dias` : 'Todos'}</strong>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.toolbar}>
            <input
              className={styles.search}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') applyFilters();
              }}
              placeholder="Buscar por nome ou WhatsApp..."
            />

            <select value={inactivity} onChange={(event) => setInactivity(Number(event.target.value))}>
              <option value={0}>Todos os clientes</option>
              <option value={30}>+30 dias sem pedir</option>
              <option value={60}>+60 dias sem pedir</option>
              <option value={90}>+90 dias sem pedir</option>
            </select>

            <select value={order} onChange={(event) => setOrder(event.target.value)}>
              <option value="pedidos30-desc">Mais pedidos — 30 dias</option>
              <option value="ultima-desc">Pedido mais recente</option>
              <option value="dias-desc">Mais dias sem pedir</option>
              <option value="frequencia-asc">Compra com mais frequência</option>
              <option value="ticket-desc">Maior ticket médio</option>
              <option value="gasto-desc">Maior gasto histórico</option>
              <option value="total-desc">Mais pedidos — histórico</option>
              <option value="nome-asc">Nome do cliente</option>
            </select>

            <button className={styles.primaryButton} onClick={applyFilters} disabled={loading || !changed}>
              Aplicar
            </button>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>WhatsApp</th>
                  <th>Cadastrado em</th>
                  <th>Último pedido</th>
                  <th>Dias sem pedir</th>
                  <th>Frequência média</th>
                  <th>Pedidos 30d</th>
                  <th>Pedidos 90d</th>
                  <th>Ticket médio</th>
                  <th>Total gasto</th>
                  <th>Total pedidos</th>
                  <th>Origem</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.cliente_id}>
                    <td>
                      <strong>{item.nome || `Cliente #${item.cliente_id}`}</strong>
                      <span className={styles.helper}>ID {item.cliente_id}</span>
                    </td>
                    <td>{phoneLabel(item.whatsapp)}</td>
                    <td>{dateLabel(item.cadastrado_em)}</td>
                    <td>{dateLabel(item.ultima_compra_em)}</td>
                    <td>{daysLabel(item.dias_sem_comprar)}</td>
                    <td>{frequencyLabel(item.frequencia_media_dias)}</td>
                    <td className={styles.number}>{Number(item.pedidos_30d || 0)}</td>
                    <td className={styles.number}>{Number(item.pedidos_90d || 0)}</td>
                    <td className={styles.number}>{money(item.ticket_medio)}</td>
                    <td className={styles.number}>{money(item.total_gasto)}</td>
                    <td className={styles.number}>{Number(item.total_pedidos || 0)}</td>
                    <td>{item.origem_cadastro || '—'}</td>
                  </tr>
                ))}

                {!loading && !error && items.length === 0 && (
                  <tr>
                    <td colSpan={12} className={styles.empty}>Nenhum cliente encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className={styles.footer}>
            <div className={styles.footerLeft}>
              <span>{loading ? 'Carregando...' : `${start}-${end} de ${pagination.filteredCount} cliente(s)`}</span>
              <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
                {PAGE_SIZE_OPTIONS.map((value) => (
                  <option key={value} value={value}>{value} por página</option>
                ))}
              </select>
            </div>

            <div className={styles.pagination}>
              <button
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={loading || pagination.page <= 1}
              >
                Anterior
              </button>
              <span>Página {pagination.page} de {pagination.totalPages}</span>
              <button
                onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))}
                disabled={loading || pagination.page >= pagination.totalPages}
              >
                Próxima
              </button>
            </div>
          </footer>
        </section>
      </section>
    </main>
  );
}
