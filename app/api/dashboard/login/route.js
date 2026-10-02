import {
  DASHBOARD_COOKIE,
  dashboardAuthConfigured,
  dashboardSessionToken,
  verifyDashboardPassword,
} from '@/lib/dashboardAuth';

export async function POST(request) {
  if (!dashboardAuthConfigured()) {
    return Response.json(
      { error: 'Defina DASHBOARD_PASSWORD na Vercel antes de usar o painel.' },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  if (!verifyDashboardPassword(String(body.password || ''))) {
    return Response.json({ error: 'Senha incorreta.' }, { status: 401 });
  }

  const token = dashboardSessionToken();
  const headers = new Headers();
  headers.append(
    'Set-Cookie',
    `${DASHBOARD_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
  );

  return Response.json({ ok: true }, { headers });
}

export async function DELETE() {
  const headers = new Headers();
  headers.append(
    'Set-Cookie',
    `${DASHBOARD_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
  );
  return Response.json({ ok: true }, { headers });
}
