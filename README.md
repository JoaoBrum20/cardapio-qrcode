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
- `CARDAPIO_QRCODE_PRODUTOS`

## Estado atual

- Cardápio mobile-first
- Catálogo de produtos carregado do Supabase
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


## Produtos

O catálogo principal é carregado da tabela `CARDAPIO_QRCODE_PRODUTOS`.

O frontend consulta apenas produtos ativos e respeita o campo `ordem`. Nome, preço, descrição, categoria e caminho da imagem vêm do banco. Existe um fallback local temporário para manter o cardápio disponível em caso de falha de leitura do Supabase.
