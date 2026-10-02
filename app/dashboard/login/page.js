'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Login.module.css';

export default function DashboardLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/dashboard/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || 'Não foi possível entrar.');

      router.replace('/dashboard/clientes');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.brandMark}>B</div>
        <span className={styles.eyebrow}>PAINEL ADMINISTRATIVO</span>
        <h1>Brasa Burger</h1>
        <p>Entre para acessar clientes, pedidos e inteligência de consumo.</p>

        <form onSubmit={submit}>
          <label>
            Senha do painel
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
              autoComplete="current-password"
              placeholder="Digite sua senha"
            />
          </label>
          {error && <div className={styles.error}>{error}</div>}
          <button disabled={loading || !password}>
            {loading ? 'Entrando...' : 'Entrar no painel'}
          </button>
        </form>
      </section>
    </main>
  );
}
