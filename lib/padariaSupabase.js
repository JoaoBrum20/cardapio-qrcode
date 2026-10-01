const SUPABASE_URL = 'https://gaqbythsligifhuuuest.supabase.co';
const SUPABASE_KEY = 'sb_publishable_RWYeymEA-UP_kdz4Oapidg_mS0b9lDd';

async function rpc(functionName, params = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Supabase RPC failed: ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function criarPedido({ qrNumero, itens, observacao, total }) {
  const data = await rpc('cardapio_qrcode_criar_pedido', {
    p_qr_numero: qrNumero,
    p_itens: itens,
    p_observacao: observacao || null,
    p_total: total,
  });
  return Array.isArray(data) ? data[0] : data;
}

export async function buscarStatusPedido(token) {
  const data = await rpc('cardapio_qrcode_status', { p_pedido_token: token });
  return Array.isArray(data) ? data[0] || null : data;
}

export async function listarPedidosAtivos() {
  const data = await rpc('cardapio_qrcode_listar_ativos');
  return Array.isArray(data) ? data : [];
}

export async function prepararPedido(id) {
  return rpc('cardapio_qrcode_preparar', { p_id: id });
}

export async function finalizarPedido(id) {
  return rpc('cardapio_qrcode_finalizar', { p_id: id });
}


export async function buscarProdutos() {
  const query = new URLSearchParams({
    select: 'id,categoria,nome,preco,descricao,imagem,ordem,disponivel,adicionais,pontos_carne',
    ativo: 'eq.true',
    order: 'ordem.asc',
  });

  const response = await fetch(`${SUPABASE_URL}/rest/v1/CARDAPIO_QRCODE_PRODUTOS?${query.toString()}`, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Supabase products failed: ${response.status}`);
  }

  const data = await response.json();

  return (Array.isArray(data) ? data : []).map((item) => ({
    id: Number(item.id),
    category: item.categoria,
    name: item.nome,
    price: Number(item.preco),
    description: item.descricao || '',
    image: item.imagem || '/images/smash-bacon.jpg',
    available: item.disponivel !== false,
    extras: Array.isArray(item.adicionais) ? item.adicionais : [],
    meatPoints: Array.isArray(item.pontos_carne) ? item.pontos_carne : [],
  }));
}
