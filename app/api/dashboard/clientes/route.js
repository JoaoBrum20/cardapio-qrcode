import {
  dashboardAuthConfigured,
  isDashboardAuthorized,
} from '../../../../lib/dashboardAuth';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gaqbythsligifhuuuest.supabase.co';

const ORDER_MAP = {
  'pedidos30-desc': ['pedidos_30d', 'desc'],
  'ultima-desc': ['ultima_compra_em', 'desc'],
  'dias-desc': ['dias_sem_comprar', 'desc'],
  'frequencia-asc': ['frequencia_media_dias', 'asc'],
  'ticket-desc': ['ticket_medio', 'desc'],
  'gasto-desc': ['total_gasto', 'desc'],
  'total-desc': ['total_pedidos', 'desc'],
  'nome-asc': ['nome', 'asc'],
};

function adminHeaders() {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;

  const headers = {
    apikey: key,
    Prefer: 'count=exact',
    'Range-Unit': 'items',
  };

  if (!key.startsWith('sb_secret_')) {
    headers.Authorization = `Bearer ${key}`;
  }

  return headers;
}

export async function POST(request) {
  if (!dashboardAuthConfigured()) {
    return Response.json(
      { error: 'Defina DASHBOARD_PASSWORD na Vercel para proteger o painel.' },
      { status: 503 }
    );
  }

  if (!isDashboardAuthorized(request)) {
    return Response.json({ error: 'Sessão administrativa necessária.' }, { status: 401 });
  }

  const headers = adminHeaders();
  if (!headers) {
    return Response.json(
      { error: 'Dashboard ainda sem SUPABASE_SECRET_KEY na Vercel.' },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const page = Math.max(1, Number(body.page || 1));
  const pageSize = [25, 50, 100].includes(Number(body.pageSize)) ? Number(body.pageSize) : 50;
  const query = String(body.query || '').trim();
  const inactivity = [0, 30, 60, 90].includes(Number(body.inactivity)) ? Number(body.inactivity) : 0;
  const [orderField, orderDirection] = ORDER_MAP[body.order] || ORDER_MAP['pedidos30-desc'];

  const params = new URLSearchParams();
  params.set('select', 'cliente_id,nome,whatsapp,cadastrado_em,ultima_compra_em,dias_sem_comprar,frequencia_media_dias,pedidos_30d,pedidos_90d,ticket_medio,total_gasto,total_pedidos,origem_cadastro');
  params.set('order', `${orderField}.${orderDirection}.nullslast`);

  if (query) {
    const escaped = query.replace(/[,%()]/g, '');
    params.set('or', `(nome.ilike.*${escaped}*,whatsapp.ilike.*${escaped}*)`);
  }

  if (inactivity > 0) {
    params.set('dias_sem_comprar', `gte.${inactivity}`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  headers.Range = `${from}-${to}`;

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/VW_CARDAPIO_QRCODE_CLIENTES_INTELIGENCIA?${params.toString()}`,
    {
      method: 'GET',
      headers,
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    console.error('Erro dashboard clientes:', detail);
    return Response.json({ error: 'Não foi possível consultar os clientes.' }, { status: 500 });
  }

  const data = await response.json();
  const range = response.headers.get('content-range') || '';
  const countPart = range.split('/')[1];
  const filteredCount = countPart && countPart !== '*' ? Number(countPart) : data.length;
  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));

  return Response.json(
    {
      data,
      pagination: {
        page,
        pageSize,
        filteredCount,
        totalPages,
      },
    },
    {
      headers: {
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  );
}
