# Padaria QR

Sistema de cardápio digital e pedidos por QR Code para padarias.

## Arquitetura

- **Frontend:** Next.js
- **Hospedagem:** Vercel
- **Código e documentação:** GitHub
- **Gestão do projeto:** Notion
- **Próxima camada:** Supabase/PostgreSQL para produtos, mesas, pedidos e itens de pedido

## Fluxo planejado

QR Code da mesa → Cardápio → Carrinho → Pedido → Banco → Tela da padaria → Status do pedido

## Estado atual

- Cardápio mobile-first
- Busca por produto
- Filtro por categoria
- Carrinho local
- Mesa lida por `?mesa=12`
- Envio real do pedido ainda não conectado ao backend

## Rodar localmente

```bash
npm install
npm run dev
```
