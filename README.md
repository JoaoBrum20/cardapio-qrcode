# Cardápio QR Code

Sistema de cardápio digital e pedidos por QR Code para estabelecimentos.

## Arquitetura

- **Frontend:** Next.js
- **Hospedagem:** Vercel
- **Código e documentação:** GitHub
- **Gestão do projeto:** Notion
- **Banco:** Supabase/PostgreSQL

## Fluxo

QR Code da mesa → Cardápio → Carrinho → Pedido → Supabase → Tela operacional → Status do pedido → Cliente

## Banco atual

- `CARDAPIO_QRCODE_PEDIDOS`
- `CARDAPIO_QRCODE_CONTATOS`

## Estado atual

- Cardápio mobile-first
- Busca por produto
- Filtro por categoria
- Carrinho
- QR/mesa por query string
- Pedido gravado no Supabase
- Tela operacional de pedidos
- Status: recebido → preparando → pronto
- Acompanhamento do cliente

## Rodar localmente

```bash
npm install
npm run dev
```
