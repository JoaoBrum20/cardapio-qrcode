# Arquitetura — Cardápio QR Code

## Objetivo
Permitir que clientes façam pedidos pelo QR Code da mesa e acompanhem o status, enquanto a equipe opera os pedidos em uma tela própria.

## Fluxo

1. QR Code identifica a mesa.
2. Cliente abre o cardápio.
3. Cliente adiciona produtos e observações.
4. Pedido é gravado no Supabase.
5. Tela operacional recebe os pedidos ativos.
6. Equipe altera o status: recebido → preparando → pronto.
7. Cliente acompanha o status no celular.
8. Ao finalizar, o pedido sai do painel operacional e permanece no histórico.

## Camadas

### GitHub
Código, documentação técnica e histórico de alterações.

### Vercel
Hospedagem do Next.js ligada à branch `main`.

### Notion
Gestão funcional, decisões, escopo, pendências e roadmap.

### Supabase
PostgreSQL para persistência e coordenação dos pedidos.

Tabelas atuais:
- `CARDAPIO_QRCODE_PEDIDOS`
- `CARDAPIO_QRCODE_CONTATOS`

Funções:
- `cardapio_qrcode_criar_pedido`
- `cardapio_qrcode_status`
- `cardapio_qrcode_listar_ativos`
- `cardapio_qrcode_preparar`
- `cardapio_qrcode_finalizar`

## Segurança
- RLS ativado nas tabelas expostas.
- Publishable key no frontend.
- Nenhuma service role no navegador.
- Pedido acompanhado por token UUID.
