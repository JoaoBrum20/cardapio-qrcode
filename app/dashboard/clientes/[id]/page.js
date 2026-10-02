'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './ClienteDetalhe.module.css';

function money(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

function dateLabel(value, withTime = false) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', withTime
    ? { dateStyle: 'short', timeStyle: 'short' }
    : { dateStyle: 'short' }).format(d);
}

function phoneLabel(value) {
  const digits = String(value || '').replace(/\D/g, '');
  const local = digits.startsWith('55') ? digits.slice(2) : digits;
  if (local.length === 11) return `(${local.slice(0,2)}) ${local.slice(2,7)}-${local.slice(7)}`;
  if (local.length === 10) return `(${local.slice(0,2)}) ${local.slice(2,6)}-${local.slice(6)}`;
  return value || '—';
}

function firstName(value) {
  return String(value || 'Cliente').trim().split(/\s+/)[0];
}

export default function ClienteDetalhePage() {
  const params = useParams();
  const id = params?.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError('');

    fetch(`/api/dashboard/clientes/${id}`, { cache: 'no-store' })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error || 'Não foi possível carregar o cliente.');
        return body;
      })
      .then((body) => { if (active) setData(body); })
      .catch((err) => { if (active) setError(err.message || 'Erro ao carregar cliente.'); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [id]);

  const c = data?.cliente;
  const pedidos = data?.pedidos || [];
  const favoriteProduct = data?.favoritos?.produtos?.[0];

  const behavior = useMemo(() => {
    if (!c) return [];
    return [
      ['Dia mais comum', c.dia_semana_mais_comum || 'Ainda sem padrão'],
      ['Horário mais comum', c.hora_mais_comum ? `${c.hora_mais_comum}h` : 'Ainda sem padrão'],
      ['Frequência média', c.frequencia_media_dias == null ? 'Ainda sem padrão' : `${Number(c.frequencia_media_dias).toLocaleString('pt-BR')} dias`],
      ['Itens por pedido', Number(c.media_itens_pedido || 0).toLocaleString('pt-BR')],
      ['Produto principal', favoriteProduct?.name || 'Ainda sem padrão'],
      ['Mesa mais usada', c.qr_mais_usado == null ? '—' : `Mesa ${c.qr_mais_usado}`],
    ];
  }, [c, favoriteProduct]);

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <a className={styles.brand} href="/dashboard/clientes"><span>B</span><div><strong>Brasa Burger</strong><small>Administração</small></div></a>
        <nav>
          <a href="/dashboard">Visão geral</a>
          <a className={styles.active} href="/dashboard/clientes">Clientes</a>
          <a href="/pedidos">Pedidos</a>
        </nav>
        <div className={styles.sidebarFoot}>Cardápio QR Code<br/><small>Painel administrativo</small></div>
      </aside>

      <section className={styles.content}>
        <a href="/dashboard/clientes" className={styles.back}>← Voltar para clientes</a>

        {loading && <div className={styles.state}>Carregando perfil do cliente...</div>}
        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && c && (
          <>
            <header className={styles.hero}>
              <div className={styles.avatar}>{firstName(c.nome).charAt(0).toUpperCase()}</div>
              <div className={styles.identity}>
                <div className={styles.eyebrow}>PERFIL DO CLIENTE</div>
                <h1>{c.nome || `Cliente #${c.id}`}</h1>
                <div className={styles.contactRow}>
                  <span>{phoneLabel(c.whatsapp)}</span>
                  <span>Cliente desde {dateLabel(c.criado_em)}</span>
                  <span className={c.aceita_promocoes ? styles.optin : styles.neutral}>{c.aceita_promocoes ? 'Aceita promoções' : 'Sem opt-in promocional'}</span>
                </div>
              </div>
            </header>

            <section className={styles.metrics}>
              <article><span>Pedidos</span><strong>{Number(c.total_pedidos || 0)}</strong><small>histórico vinculado</small></article>
              <article><span>Ticket médio</span><strong>{money(c.ticket_medio)}</strong><small>por pedido</small></article>
              <article><span>Total gasto</span><strong>{money(c.total_gasto)}</strong><small>valor histórico</small></article>
              <article><span>Último pedido</span><strong>{c.dias_sem_comprar == null ? '—' : c.dias_sem_comprar === 0 ? 'Hoje' : `${Math.round(c.dias_sem_comprar)} dias`}</strong><small>{dateLabel(c.ultima_compra_em)}</small></article>
            </section>

            <section className={styles.grid}>
              <div className={styles.mainCol}>
                <article className={styles.card}>
                  <div className={styles.cardHead}><div><span>HISTÓRICO</span><h2>Pedidos recentes</h2></div><small>{pedidos.length} pedidos carregados</small></div>
                  <div className={styles.orderList}>
                    {pedidos.length === 0 && <div className={styles.empty}>Nenhum pedido vinculado a este cliente.</div>}
                    {pedidos.map((pedido) => (
                      <div className={styles.order} key={pedido.id}>
                        <button onClick={() => setExpanded(expanded === pedido.id ? null : pedido.id)}>
                          <div><strong>Pedido #{pedido.id}</strong><span>{dateLabel(pedido.criado_em, true)} · Mesa {pedido.qr_numero ?? '—'}</span></div>
                          <div className={styles.orderRight}><strong>{money(pedido.total)}</strong><span>{pedido.itens.length} tipos de item</span></div>
                        </button>
                        {expanded === pedido.id && (
                          <div className={styles.orderItems}>
                            {pedido.itens.map((item, index) => (
                              <div key={index}>
                                <span><b>{item.qty || 1}×</b> {item.name || item.nome || 'Item'}</span>
                                <strong>{money(item.subtotal || item.unit_total || 0)}</strong>
                              </div>
                            ))}
                            {pedido.observacao && <p>Obs.: {pedido.observacao}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </article>

                <article className={styles.card}>
                  <div className={styles.cardHead}><div><span>PREFERÊNCIAS</span><h2>O que {firstName(c.nome)} costuma pedir</h2></div></div>
                  <div className={styles.favorites}>
                    {(data.favoritos?.produtos || []).map((item, index) => (
                      <div className={styles.favorite} key={item.name}>
                        <span className={styles.rank}>{String(index + 1).padStart(2, '0')}</span>
                        <div><strong>{item.name}</strong><small>{item.count} unidade{item.count === 1 ? '' : 's'} no histórico</small></div>
                        <b>{item.count}×</b>
                      </div>
                    ))}
                    {(data.favoritos?.produtos || []).length === 0 && <div className={styles.empty}>Ainda não há histórico suficiente.</div>}
                  </div>
                </article>

                <article className={styles.card}>
                  <div className={styles.cardHead}><div><span>COMBINAÇÕES</span><h2>Pedidos que aparecem juntos</h2></div></div>
                  <div className={styles.comboGrid}>
                    {(data.favoritos?.combinacoes || []).map((item) => (
                      <div key={item.name}><strong>{item.name}</strong><span>{item.count} pedido{item.count === 1 ? '' : 's'}</span></div>
                    ))}
                    {(data.favoritos?.combinacoes || []).length === 0 && <div className={styles.empty}>Precisamos de mais pedidos para identificar combinações.</div>}
                  </div>
                </article>
              </div>

              <aside className={styles.sideCol}>
                <article className={styles.card}>
                  <div className={styles.cardHead}><div><span>COMPORTAMENTO</span><h2>Perfil de consumo</h2></div></div>
                  <div className={styles.behavior}>
                    {behavior.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
                  </div>
                </article>

                <article className={styles.card}>
                  <div className={styles.cardHead}><div><span>OPORTUNIDADES</span><h2>Sugestões para oferecer</h2></div></div>
                  <p className={styles.explain}>Produtos que este cliente ainda não pediu, mas aparecem entre clientes com mix semelhante.</p>
                  <div className={styles.suggestions}>
                    {(data.sugestoes || []).map((item) => (
                      <div key={item.product_id}>
                        <div><strong>{item.name}</strong><span>{item.support_percent}% dos clientes semelhantes</span></div>
                        <b>{item.similar_clients}</b>
                      </div>
                    ))}
                    {(data.sugestoes || []).length === 0 && <div className={styles.empty}>Ainda não há base semelhante suficiente para sugerir produtos.</div>}
                  </div>
                  <div className={styles.sample}>Base: {data.semelhantes_considerados || 0} clientes semelhantes considerados</div>
                </article>

                <article className={styles.card}>
                  <div className={styles.cardHead}><div><span>CADASTRO</span><h2>Relacionamento</h2></div></div>
                  <div className={styles.behavior}>
                    <div><span>Origem</span><strong>{c.origem_cadastro || '—'}</strong></div>
                    <div><span>Detalhe</span><strong>{c.origem_detalhe || '—'}</strong></div>
                    <div><span>Primeiro QR</span><strong>{c.primeiro_qr_numero == null ? '—' : `Mesa ${c.primeiro_qr_numero}`}</strong></div>
                    <div><span>Campanha</span><strong>{c.utm_campaign || '—'}</strong></div>
                  </div>
                </article>
              </aside>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
