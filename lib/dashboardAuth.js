import { createHmac, timingSafeEqual } from 'node:crypto';

export const DASHBOARD_COOKIE = 'cardapio_dashboard_session';

function dashboardPassword() {
  return process.env.DASHBOARD_PASSWORD || '';
}

function tokenFor(password) {
  return createHmac('sha256', password)
    .update('cardapio-qrcode-dashboard-session-v1')
    .digest('hex');
}

export function dashboardAuthConfigured() {
  return Boolean(dashboardPassword());
}

export function verifyDashboardPassword(value) {
  const expectedPassword = dashboardPassword();
  if (!expectedPassword || typeof value !== 'string') return false;

  const left = Buffer.from(value);
  const right = Buffer.from(expectedPassword);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function dashboardSessionToken() {
  const password = dashboardPassword();
  return password ? tokenFor(password) : '';
}

export function isDashboardAuthorized(request) {
  const expected = dashboardSessionToken();
  if (!expected) return false;

  const rawCookie = request.headers.get('cookie') || '';
  const cookie = rawCookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${DASHBOARD_COOKIE}=`));

  if (!cookie) return false;
  const received = decodeURIComponent(cookie.slice(DASHBOARD_COOKIE.length + 1));

  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
