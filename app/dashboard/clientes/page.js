'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Clientes.module.css';

const PAGE_SIZE_OPTIONS = [25, 50, 100];

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></>,
    refresh: <><path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5"/></>,
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></>,
    orders: <><path d="M6 2h12l2 5H4l2-5Z"/><path d="M4 7v15h16V7"/><path d="M9 11h6"/></>,
    box: <><path d="m21 8-9 5-9-5"/><path d="m3 8 9-5 9 5v8l-9 5-9-5Z"/><path d="M12 13v8"/></>,
    chart: <><path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/></>,
    wallet: <><path d="M4 7V5a2 2 0 0 1 2-2h12v4"/><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M16 13h5"/></>,
    repeat: <><path d="m17 1 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 23-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></>,
    chevronLeft: <path d="m15 18-6-6 6-6"/>,
    chevronRight: <path d="m9 18 6-6-6-6"/>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function money(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
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
  if (number === 0) return '< 1 dia';
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

function inactivityTone(days) {
  if (days == null) return 'neutral';
  if (days >= 90) return 'danger';
  if (days >= 60) return 'warning';
  if (days >= 30) return 'attention';
  return 'healthy';
}

function sourceLabel(value) {
  if (!value) return '—';
  if (value === 'cardapio_qrcode') return 'Cardápio QR';
  return String(value).replaceAll('_', ' ');
}

export default function ClientesDashboardPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [inactivity, setInactivity] = useState(0);
  const [order, setOrder] = useState('pedidos30-desc');
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);
  const [applied, setApplied] = useState({ query: '', inactivity: 0, order: 'pedidos30-desc', pageSize: 50 });
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 50, filteredCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const changed = useMemo(() => (
    query.trim() !== applied.query ||
    inactivity !== applied.inactivity ||
    order !== applied.order ||
    pageSize !== applied.pageSize
  ), [query, inactivity, order, pageSize, applied]);

  const pageStats = useMemo(() => {
    const repeatCustomers = items.filter((item) => Number(item.total_pedidos || 0) >= 2).length;
    const totalRevenue = items.reduce((sum, item) => sum + Number(item.total_gasto || 0), 0);
    const withOrders = items.filter((item) => Number(item.total_pedidos || 0) > 0);
    const avgTicket = withOrders.length
      ? withOrders.reduce((sum, item) => sum + Number(item.ticket_medio || 0), 0) / withOrders.length
      : 0;

    return { repeatCustomers, totalRevenue, avgTicket };
  }, [items]);

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

      if (response.status === 401) {
        router.replace('/dashboard/login');
        return;
      }

      if (!response.ok) {
        throw new Error(payload?.error || 'Não foi possível carregar os clientes.');
      }

      setItems(Array.isArray(payload.data) ? payload.data : []);
      setPagination(payload.pagination || { page: 1, pageSize: applied.pageSize, filteredCount: 0, totalPages: 1 });
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes.');
    } finally {
      setLoading(false);
    }
  }, [page, applied, router]);

  useEffect(() => {
    load();
  }, [load]);

  function applyFilters() {
    setApplied({ query: query.trim(), inactivity, order, pageSize });
    setPage(1);
  }

  function clearFilters() {
    setQuery('');
    setInactivity(0);
    setOrder('pedidos30-desc');
    setPageSize(50);
    setApplied({ query: '', inactivity: 0, order: 'pedidos30-desc', pageSize: 50 });
    setPage(1);
  }

  const start = pagination.filteredCount === 0 ? 0 : ((pagination.page - 1) * pagination.pageSize) + 1;
  const end = Math.min(pagination.page * pagination.pageSize, pagination.filteredCount);

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>B</div>
          <div>
            <strong>Brasa Burger</strong>
            <span>Administração</span>
          </div>
        </div>

        <div className={styles.navSectionLabel}>GERAL</div>
        <nav className={styles.nav}>
          <a href="/dashboard"><Icon name="home" /> Visão geral</a>
          <a className={styles.active} href="/dashboard/clientes"><Icon name="users" /> Clientes</a>
          <a href="/pedidos"><Icon name="orders" /> Pedidos</a>
        </nav>

        <div className={styles.navSectionLabel}>GESTÃO</div>
        <nav className={styles.nav}>
          <span><Icon name="box" /> Produtos <small>em breve</small></span>
          <span><Icon name="chart" /> Relatórios <small>em breve</small></span>
        </nav>

        <div className={styles.sidebarFooter}>
          <span>Cardápio QR Code</span>
          <small>Painel administrativo</small>
        </div>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <div className={styles.breadcrumb}>Dashboard / Clientes</div>
            <h1>Clientes</h1>
            <p>Entenda quem compra, com que frequência e quanto cada cliente representa.</p>
          </div>
          <button className={styles.refreshButton} onClick={load} disabled={loading}>
            <Icon name="refresh" />
            {loading ? 'Atualizando' : 'Atualizar dados'}
          </button>
        </header>

        <section className={styles.summary}>
          <article className={styles.metricCard}>
            <div className={styles.metricIcon}><Icon name="users" /></div>
            <div>
              <span>Clientes encontrados</span>
              <strong>{pagination.filteredCount}</strong>
              <small>de acordo com os filtros</small>
            </div>
          </article>

          <article className={styles.metricCard}>
            <div className={styles.metricIcon}><Icon name="repeat" /></div>
            <div>
              <span>Com recompra</span>
              <strong>{pageStats.repeatCustomers}</strong>
              <small>nesta página</small>
            </div>
          </article>

          <article className={styles.metricCard}>
            <div className={styles.metricIcon}><Icon name="wallet" /></div>
            <div>
              <span>Ticket médio</span>
              <strong>{money(pageStats.avgTicket)}</strong>
              <small>média nesta página</small>
            </div>
          </article>

          <article className={styles.metricCard}>
            <div className={styles.metricIcon}><Icon name="chart" /></div>
            <div>
              <span>Valor histórico</span>
              <strong>{money(pageStats.totalRevenue)}</strong>
              <small>clientes desta página</small>
            </div>
          </article>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Base de clientes</h2>
              <p>Lista consolidada com recência, frequência e valor de compra.</p>
            </div>
            {applied.inactivity > 0 && (
              <span className={styles.filterBadge}>+{applied.inactivity} dias sem pedir</span>
            )}
          </div>

          <div className={styles.toolbar}>
            <label className={styles.searchBox}>
              <Icon name="search" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') applyFilters();
                }}
                placeholder="Buscar cliente ou WhatsApp"
              />
            </label>

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

            <button className={styles.applyButton} onClick={applyFilters} disabled={loading || !changed}>Aplicar</button>
            <button className={styles.clearButton} onClick={clearFilters} disabled={loading}>Limpar</button>
          </div>

          {error && (
            <div className={styles.error}>
              <strong>Não foi possível carregar a lista.</strong>
              <span>{error}</span>
            </div>
          )}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>WhatsApp</th>
                  <th>Cadastrado</th>
                  <th>Último pedido</th>
                  <th>Recência</th>
                  <th>Frequência</th>
                  <th>30 dias</th>
                  <th>90 dias</th>
                  <th>Ticket médio</th>
                  <th>Total gasto</th>
                  <th>Pedidos</th>
                  <th>Origem</th>
                </tr>
              </thead>
              <tbody>
                {loading && items.length === 0 && Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className={styles.skeletonRow}>
                    <td colSpan={12}><div /></td>
                  </tr>
                ))}

                {items.map((item) => {
                  const tone = inactivityTone(item.dias_sem_comprar);
                  return (
                    <tr
                      key={item.cliente_id}
                      className={styles.clickableRow}
                      role="link"
                      tabIndex={0}
                      onClick={() => router.push(`/dashboard/clientes/${item.cliente_id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          router.push(`/dashboard/clientes/${item.cliente_id}`);
                        }
                      }}
                    >
                      <td className={styles.customerCell}>
                        <div className={styles.avatar}>{(item.nome || 'C').trim().charAt(0).toUpperCase()}</div>
                        <div>
                          <strong>{item.nome || `Cliente #${item.cliente_id}`}</strong>
                          <span>ID {item.cliente_id}</span>
                        </div>
                      </td>
                      <td className={styles.phone}>{phoneLabel(item.whatsapp)}</td>
                      <td>{dateLabel(item.cadastrado_em)}</td>
                      <td>{dateLabel(item.ultima_compra_em)}</td>
                      <td><span className={`${styles.recency} ${styles[tone]}`}>{daysLabel(item.dias_sem_comprar)}</span></td>
                      <td>{frequencyLabel(item.frequencia_media_dias)}</td>
                      <td className={styles.number}>{Number(item.pedidos_30d || 0)}</td>
                      <td className={styles.number}>{Number(item.pedidos_90d || 0)}</td>
                      <td className={styles.money}>{money(item.ticket_medio)}</td>
                      <td className={styles.money}>{money(item.total_gasto)}</td>
                      <td className={styles.number}><strong>{Number(item.total_pedidos || 0)}</strong></td>
                      <td><span className={styles.source}>{sourceLabel(item.origem_cadastro)}</span></td>
                    </tr>
                  );
                })}

                {!loading && !error && items.length === 0 && (
                  <tr>
                    <td colSpan={12} className={styles.empty}>
                      <strong>Nenhum cliente encontrado</strong>
                      <span>Tente alterar os filtros ou a busca.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className={styles.footer}>
            <div className={styles.footerLeft}>
              <span>{loading ? 'Carregando clientes...' : `${start}–${end} de ${pagination.filteredCount}`}</span>
              <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
                {PAGE_SIZE_OPTIONS.map((value) => (
                  <option key={value} value={value}>{value} por página</option>
                ))}
              </select>
            </div>

            <div className={styles.pagination}>
              <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={loading || pagination.page <= 1}>
                <Icon name="chevronLeft" size={16} /> Anterior
              </button>
              <span><strong>{pagination.page}</strong> de {pagination.totalPages}</span>
              <button onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))} disabled={loading || pagination.page >= pagination.totalPages}>
                Próxima <Icon name="chevronRight" size={16} />
              </button>
            </div>
          </footer>
        </section>
      </section>
    </main>
  );
}
