'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './Cliente.module.css';

function money(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));
}

function dateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function dateOnly(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date);
}

function phoneLabel(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '—';
  const local = digits.startsWith('55') ? digits.slice(2) : digits;
  if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  return value;
}

function dayName(value) {
  const names = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return value == null ? '—' : names[Number(value)] || '—';
}

function hourName(value) {
  return value == null ? '—' : `${String(value).padStart(2, '0')}h–${String((Number(value) + 1) % 24).padStart(2, '0')}h`;
}

function frequency(value) {
  if (value == null) return 'Sem histórico suficiente';
  const number = Number(value);
  if (number < 1) return '< 1 dia';
  return `a cada ${number.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} dias`;
}

function itemTotal(item) {
  return Number(item?.unit_total ?? item?.subtotal ?? 0);
}

function qty(item) {
  return Number(item?.qty ?? item?.quantidade ?? 1);
}

export default function ClientePerfilPage() {
  const params = useParams();
  const router = useRouter();
  const clienteId = params?.clienteId;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  async function load() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/dashboard/clientes/${clienteId}`, {
        cache: 'no-store',
      });

      if (response.status === 401) {
        router.replace('/dashboard/login');
        return;
      }

      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || 'Não foi possível carregar o cliente.');
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar o cliente.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (clienteId) load();
  }, [clienteId]);

  const cliente = data?.cliente || {};
  const produtos = Array.isArray(data?.produtos) ? data.produtos : [];
  const pedidos = Array.isArray(data?.pedidos) ? data.pedidos : [];
  const sugestoes = Array.isArray(data?.sugestoes) ? data.sugestoes : [];
  const combinacoes = Array.isArray(data?.combinacoes) ? data.combinacoes : [];
  const adicionais = Array.isArray(data?.adicionais) ? data.adicionais : [];
  const pontos = Array.isArray(data?.pontos_carne) ? data.pontos_carne : [];
  const semelhantes = Array.isArray(data?.clientes_semelhantes) ? data.clientes_semelhantes : [];

  const avgItems = useMemo(() => {
    if (!pedidos.length) return 0;
    const count = pedidos.reduce(
      (sum, pedido) => sum + (Array.isArray(pedido.itens)
        ? pedido.itens.reduce((acc, item) => acc + qty(item), 0)
        : 0),
      0
    );
    return count / pedidos.length;
  }, [pedidos]);

  if (loading && !data) {
    return (
      <main className={styles.loadingPage}>
        <div className={styles.loadingCard}>Montando perfil do cliente...</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>B</div>
          <div><strong>Brasa Burger</strong><span>Administração</span></div>
        </div>
        <nav>
          <a href="/dashboard">Visão geral</a>
          <a className={styles.active} href="/dashboard/clientes">Clientes</a>
          <a href="/pedidos">Pedidos</a>
        </nav>
        <div className={styles.sidebarFooter}>Cardápio QR Code<br/><span>Painel administrativo</span></div>
      </aside>

      <section className={styles.content}>
        <button className={styles.back} onClick={() => router.push('/dashboard/clientes')}>
          ← Voltar para clientes
        </button>

        {error ? (
          <div className={styles.error}>
            <strong>Não foi possível abrir o perfil.</strong>
            <span>{error}</span>
            <button onClick={load}>Tentar novamente</button>
          </div>
        ) : (
          <>
            <header className={styles.hero}>
              <div className={styles.avatar}>
                {(cliente.nome || 'C').trim().charAt(0).toUpperCase()}
              </div>
              <div className={styles.heroIdentity}>
                <span className={styles.eyebrow}>PERFIL DO CLIENTE</span>
                <h1>{cliente.nome || `Cliente #${cliente.cliente_id}`}</h1>
                <div className={styles.contactLine}>
                  <span>{phoneLabel(cliente.whatsapp)}</span>
                  <span>Cliente desde {dateOnly(cliente.cadastrado_em)}</span>
                  <span>{cliente.aceita_promocoes ? 'Aceita promoções' : 'Sem opt-in promocional'}</span>
                </div>
              </div>
              <div className={styles.heroActions}>
                <button onClick={load}>Atualizar</button>
              </div>
            </header>

            <section className={styles.metrics}>
              <article><span>Pedidos</span><strong>{Number(cliente.total_pedidos || 0)}</strong><small>{Number(cliente.pedidos_30d || 0)} nos últimos 30 dias</small></article>
              <article><span>Ticket médio</span><strong>{money(cliente.ticket_medio)}</strong><small>Média histórica</small></article>
              <article><span>Total gasto</span><strong>{money(cliente.total_gasto)}</strong><small>Histórico vinculado</small></article>
              <article><span>Último pedido</span><strong>{cliente.dias_sem_comprar == null ? '—' : `${cliente.dias_sem_comprar}d`}</strong><small>{dateTime(cliente.ultima_compra_em)}</small></article>
            </section>

            <div className={styles.mainGrid}>
              <div className={styles.mainColumn}>
                <section className={styles.card}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <span className={styles.eyebrow}>COMPORTAMENTO</span>
                      <h2>O que costuma pedir</h2>
                    </div>
                    <span className={styles.muted}>{produtos.length} produtos no histórico</span>
                  </div>

                  {produtos.length ? (
                    <div className={styles.productGrid}>
                      {produtos.slice(0, 8).map((produto, index) => (
                        <article className={styles.productCard} key={produto.produto_id || produto.produto}>
                          <div className={styles.rank}>{String(index + 1).padStart(2, '0')}</div>
                          <div>
                            <strong>{produto.produto}</strong>
                            <span>Presente em {Number(produto.pedidos || 0)} de {Number(cliente.total_pedidos || 0)} pedidos</span>
                          </div>
                          <div className={styles.productStats}>
                            <b>{Number(produto.quantidade || 0)}x</b>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : <div className={styles.empty}>Ainda não há produtos suficientes no histórico.</div>}
                </section>

                <section className={styles.card}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <span className={styles.eyebrow}>OPORTUNIDADES</span>
                      <h2>Sugestões por clientes semelhantes</h2>
                    </div>
                    <span className={styles.muted}>Similaridade Jaccard</span>
                  </div>

                  {sugestoes.length ? (
                    <div className={styles.suggestionGrid}>
                      {sugestoes.map((item) => (
                        <article className={styles.suggestion} key={item.produto_id || item.produto}>
                          {item.imagem ? <img src={item.imagem} alt="" /> : <div className={styles.suggestionImage}>+</div>}
                          <div>
                            <strong>{item.produto}</strong>
                            <span>{item.categoria || 'Produto sugerido'}</span>
                            <small>
                              {item.clientes_semelhantes} cliente{Number(item.clientes_semelhantes) === 1 ? '' : 's'} semelhante{Number(item.clientes_semelhantes) === 1 ? '' : 's'} pediram
                            </small>
                          </div>
                          {item.preco != null && <b>{money(item.preco)}</b>}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.empty}>
                      Ainda não há clientes com produtos em comum suficientes para gerar uma recomendação confiável. As sugestões aparecerão automaticamente conforme a base crescer.
                    </div>
                  )}

                  {semelhantes.length > 0 && (
                    <div className={styles.similarNote}>
                      Base da recomendação: {semelhantes.length} cliente{semelhantes.length === 1 ? '' : 's'} com interseção de produtos.
                    </div>
                  )}
                </section>

                <section className={styles.card}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <span className={styles.eyebrow}>HISTÓRICO</span>
                      <h2>Pedidos</h2>
                    </div>
                    <span className={styles.muted}>Últimos {pedidos.length}</span>
                  </div>

                  <div className={styles.orders}>
                    {pedidos.map((pedido) => {
                      const open = expandedOrder === pedido.id;
                      const count = Array.isArray(pedido.itens)
                        ? pedido.itens.reduce((sum, item) => sum + qty(item), 0)
                        : 0;
                      return (
                        <article className={styles.order} key={pedido.id}>
                          <button className={styles.orderSummary} onClick={() => setExpandedOrder(open ? null : pedido.id)}>
                            <div>
                              <strong>Pedido #{pedido.id}</strong>
                              <span>{dateTime(pedido.criado_em)} · Mesa {pedido.qr_numero ?? '—'}</span>
                            </div>
                            <div className={styles.orderNumbers}>
                              <span>{count} item{count === 1 ? '' : 's'}</span>
                              <strong>{money(pedido.total)}</strong>
                              <b>{open ? '−' : '+'}</b>
                            </div>
                          </button>

                          {open && (
                            <div className={styles.orderDetails}>
                              {(pedido.itens || []).map((item, index) => (
                                <div className={styles.orderItem} key={`${pedido.id}-${index}`}>
                                  <div>
                                    <strong>{qty(item)}× {item.name || item.nome || 'Item'}</strong>
                                    {Array.isArray(item.extras) && item.extras.length > 0 && (
                                      <span>Extras: {item.extras.map((extra) => extra.nome).join(', ')}</span>
                                    )}
                                    {item.meat_point && <span>Ponto: {item.meat_point}</span>}
                                    {item.note && <span>Obs.: {item.note}</span>}
                                  </div>
                                  <b>{money(itemTotal(item))}</b>
                                </div>
                              ))}
                              {pedido.observacao && <div className={styles.orderObservation}>Observação: {pedido.observacao}</div>}
                            </div>
                          )}
                        </article>
                      );
                    })}
                    {!pedidos.length && <div className={styles.empty}>Nenhum pedido vinculado a este cliente.</div>}
                  </div>
                </section>
              </div>

              <aside className={styles.insights}>
                <section className={styles.card}>
                  <span className={styles.eyebrow}>PERFIL DE CONSUMO</span>
                  <h2>Hábitos</h2>
                  <dl className={styles.profileList}>
                    <div><dt>Dia mais comum</dt><dd>{dayName(cliente.dia_semana_mais_comum)}</dd></div>
                    <div><dt>Horário mais comum</dt><dd>{hourName(cliente.hora_mais_comum)}</dd></div>
                    <div><dt>Frequência</dt><dd>{frequency(cliente.frequencia_media_dias)}</dd></div>
                    <div><dt>Itens por pedido</dt><dd>{avgItems.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</dd></div>
                    <div><dt>Mesa/QR mais usado</dt><dd>{cliente.qr_mais_usado ?? '—'}</dd></div>
                    <div><dt>Categoria favorita</dt><dd>{cliente.categorias_preferidas?.[0] || '—'}</dd></div>
                  </dl>
                </section>

                <section className={styles.card}>
                  <span className={styles.eyebrow}>COMBINAÇÕES</span>
                  <h2>Pede junto</h2>
                  <div className={styles.simpleList}>
                    {combinacoes.slice(0, 5).map((combo, index) => (
                      <div key={index}>
                        <strong>{combo.produto_a} + {combo.produto_b}</strong>
                        <span>{combo.pedidos_juntos} pedido{Number(combo.pedidos_juntos) === 1 ? '' : 's'} junto{Number(combo.pedidos_juntos) === 1 ? '' : 's'}</span>
                      </div>
                    ))}
                    {!combinacoes.length && <span className={styles.muted}>Sem repetição suficiente ainda.</span>}
                  </div>
                </section>

                <section className={styles.card}>
                  <span className={styles.eyebrow}>PREFERÊNCIAS</span>
                  <h2>Personalizações</h2>
                  <div className={styles.simpleList}>
                    {adicionais.slice(0, 5).map((extra) => (
                      <div key={extra.extra}>
                        <strong>{extra.extra}</strong>
                        <span>{extra.ocorrencias} vez{Number(extra.ocorrencias) === 1 ? '' : 'es'}</span>
                      </div>
                    ))}
                    {pontos.slice(0, 3).map((ponto) => (
                      <div key={ponto.ponto}>
                        <strong>{ponto.ponto}</strong>
                        <span>{ponto.ocorrencias} pedido{Number(ponto.ocorrencias) === 1 ? '' : 's'}</span>
                      </div>
                    ))}
                    {!adicionais.length && !pontos.length && <span className={styles.muted}>Nenhuma preferência recorrente registrada.</span>}
                  </div>
                </section>

                <section className={styles.card}>
                  <span className={styles.eyebrow}>CADASTRO</span>
                  <h2>Relacionamento</h2>
                  <dl className={styles.profileList}>
                    <div><dt>Origem</dt><dd>{String(cliente.origem_cadastro || '—').replaceAll('_', ' ')}</dd></div>
                    <div><dt>Detalhe</dt><dd>{cliente.origem_detalhe || '—'}</dd></div>
                    <div><dt>Primeiro QR</dt><dd>{cliente.primeiro_qr_numero ?? '—'}</dd></div>
                    <div><dt>Primeira compra</dt><dd>{dateOnly(cliente.primeira_compra_em)}</dd></div>
                    <div><dt>Pedidos 90d</dt><dd>{Number(cliente.pedidos_90d || 0)}</dd></div>
                  </dl>
                </section>
              </aside>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
