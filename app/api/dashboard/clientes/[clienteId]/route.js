import {
  dashboardAuthConfigured,
  isDashboardAuthorized,
} from '../../../../../lib/dashboardAuth';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gaqbythsligifhuuuest.supabase.co';

function adminHeaders() {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;

  const headers = {
    apikey: key,
    'Content-Type': 'application/json',
  };

  if (!key.startsWith('sb_secret_')) {
    headers.Authorization = `Bearer ${key}`;
  }

  return headers;
}

export async function GET(request, context) {
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

  const { clienteId } = await context.params;
  const id = Number(clienteId);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: 'Cliente inválido.' }, { status: 400 });
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/cardapio_qrcode_cliente_360`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ p_cliente_id: id }),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    console.error('Erro perfil cliente:', detail);
    return Response.json({ error: 'Não foi possível montar o perfil do cliente.' }, { status: 500 });
  }

  const data = await response.json();
  if (!data) {
    return Response.json({ error: 'Cliente não encontrado.' }, { status: 404 });
  }

  return Response.json(data, {
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
