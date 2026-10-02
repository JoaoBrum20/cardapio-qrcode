const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gaqbythsligifhuuuest.supabase.co';

function getKey() {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

function headers(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

function asNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function topEntries(map, limit = 5) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function jaccard(a, b) {
  if (!a.size && !b.size) return 0;
  let intersection = 0;
  for (const value of a) if (b.has(value)) intersection += 1;
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
}

export async function GET(_request, { params }) {
  const key = getKey();
  if (!key) {
    return Response.json({ error: 'Dashboard ainda sem SUPABASE_SECRET_KEY na Vercel.' }, { status: 503 });
  }

  const resolved = await params;
  const clienteId = Number(resolved?.id);
  if (!Number.isInteger(clienteId) || clienteId <= 0) {
    return Response.json({ error: 'Cliente inválido.' }, { status: 400 });
  }

  const clientParams = new URLSearchParams({
    select: 'id,nome,whatsapp,aceita_promocoes,origem_cadastro,origem_detalhe,utm_source,utm_medium,utm_campaign,primeiro_qr_numero,criado_em',
    id: `eq.${clienteId}`,
    limit: '1',
  });

  const intelParams = new URLSearchParams({
    select: '*',
    cliente_id: `eq.${clienteId}`,
    limit: '1',
  });

  const ordersParams = new URLSearchParams({
    select: 'id,cliente_id,qr_numero,itens,observacao,total,criado_em,pronto_em,ativo',
    cliente_id: `eq.${clienteId}`,
    ativo: 'eq.true',
    order: 'criado_em.desc',
    limit: '250',
  });

  const allOrdersParams = new URLSearchParams({
    select: 'cliente_id,itens',
    cliente_id: 'not.is.null',
    ativo: 'eq.true',
    limit: '5000',
  });

  const [clientRes, intelRes, ordersRes, allOrdersRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/CARDAPIO_QRCODE_CLIENTES?${clientParams}`, { headers: headers(key), cache: 'no-store' }),
    fetch(`${SUPABASE_URL}/rest/v1/VW_CARDAPIO_QRCODE_CLIENTES_INTELIGENCIA?${intelParams}`, { headers: headers(key), cache: 'no-store' }),
    fetch(`${SUPABASE_URL}/rest/v1/CARDAPIO_QRCODE_PEDIDOS?${ordersParams}`, { headers: headers(key), cache: 'no-store' }),
    fetch(`${SUPABASE_URL}/rest/v1/CARDAPIO_QRCODE_PEDIDOS?${allOrdersParams}`, { headers: headers(key), cache: 'no-store' }),
  ]);

  if (!clientRes.ok || !ordersRes.ok || !intelRes.ok || !allOrdersRes.ok) {
    console.error('dashboard_cliente_detail_failed', {
      client: clientRes.status,
      intel: intelRes.status,
      orders: ordersRes.status,
      allOrders: allOrdersRes.status,
    });
    return Response.json({ error: 'Não foi possível carregar o perfil do cliente.' }, { status: 500 });
  }

  const [clients, intelRows, orders, allOrders] = await Promise.all([
    clientRes.json(),
    intelRes.json(),
    ordersRes.json(),
    allOrdersRes.json(),
  ]);

  const client = clients?.[0];
  if (!client) return Response.json({ error: 'Cliente não encontrado.' }, { status: 404 });

  const intel = intelRows?.[0] || {};
  const productCounts = new Map();
  const categoryCounts = new Map();
  const extraCounts = new Map();
  const combinationCounts = new Map();
  const targetProducts = new Set();

  let itemUnits = 0;

  for (const order of orders) {
    const items = Array.isArray(order.itens) ? order.itens : [];
    const comboNames = [];

    for (const item of items) {
      const qty = Math.max(1, asNumber(item.qty || item.quantidade || 1));
      const productName = String(item.name || item.nome || 'Item');
      const category = String(item.category || item.categoria || 'Sem categoria');
      const productId = String(item.product_id || item.id || productName);

      itemUnits += qty;
      targetProducts.add(productId);
      productCounts.set(productName, (productCounts.get(productName) || 0) + qty);
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + qty);
      comboNames.push(productName);

      const extras = Array.isArray(item.extras) ? item.extras : [];
      for (const extra of extras) {
        const extraName = String(extra.nome || extra.name || 'Extra');
        extraCounts.set(extraName, (extraCounts.get(extraName) || 0) + qty);
      }
    }

    const uniqueCombo = [...new Set(comboNames)].sort();
    if (uniqueCombo.length >= 2) {
      const keyName = uniqueCombo.join(' + ');
      combinationCounts.set(keyName, (combinationCounts.get(keyName) || 0) + 1);
    }
  }

  const setsByClient = new Map();
  const namesByProduct = new Map();

  for (const order of allOrders) {
    const id = Number(order.cliente_id);
    if (!id || id === clienteId) continue;
    if (!setsByClient.has(id)) setsByClient.set(id, new Set());
    const set = setsByClient.get(id);

    for (const item of Array.isArray(order.itens) ? order.itens : []) {
      const name = String(item.name || item.nome || 'Item');
      const productId = String(item.product_id || item.id || name);
      set.add(productId);
      if (!namesByProduct.has(productId)) namesByProduct.set(productId, name);
    }
  }

  const similar = [...setsByClient.entries()]
    .map(([id, set]) => ({ id, set, score: jaccard(targetProducts, set) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  const suggestionStats = new Map();
  for (const neighbor of similar) {
    for (const productId of neighbor.set) {
      if (targetProducts.has(productId)) continue;
      const current = suggestionStats.get(productId) || { weighted: 0, clients: 0 };
      current.weighted += neighbor.score;
      current.clients += 1;
      suggestionStats.set(productId, current);
    }
  }

  const suggestions = [...suggestionStats.entries()]
    .sort((a, b) => b[1].weighted - a[1].weighted || b[1].clients - a[1].clients)
    .slice(0, 6)
    .map(([productId, stats]) => ({
      product_id: productId,
      name: namesByProduct.get(productId) || `Produto ${productId}`,
      similar_clients: stats.clients,
      support_percent: similar.length ? Math.round((stats.clients / similar.length) * 100) : 0,
      affinity_score: Math.round(stats.weighted * 100) / 100,
    }));

  const mappedOrders = orders.map((order) => ({
    id: order.id,
    qr_numero: order.qr_numero,
    total: asNumber(order.total),
    criado_em: order.criado_em,
    pronto_em: order.pronto_em,
    observacao: order.observacao,
    itens: Array.isArray(order.itens) ? order.itens : [],
  }));

  return Response.json({
    cliente: {
      ...client,
      ...intel,
      id: client.id,
      total_pedidos: asNumber(intel.total_pedidos || orders.length),
      total_gasto: asNumber(intel.total_gasto),
      ticket_medio: asNumber(intel.ticket_medio),
      dias_sem_comprar: intel.dias_sem_comprar == null ? null : asNumber(intel.dias_sem_comprar),
      frequencia_media_dias: intel.frequencia_media_dias == null ? null : asNumber(intel.frequencia_media_dias),
      media_itens_pedido: orders.length ? Math.round((itemUnits / orders.length) * 10) / 10 : 0,
    },
    favoritos: {
      produtos: topEntries(productCounts, 6),
      categorias: topEntries(categoryCounts, 4),
      adicionais: topEntries(extraCounts, 5),
      combinacoes: topEntries(combinationCounts, 4),
    },
    sugestoes: suggestions,
    semelhantes_considerados: similar.length,
    pedidos: mappedOrders,
  });
}
