# Arquitetura — Padaria QR

## Objetivo
Permitir que clientes façam pedidos pelo QR Code da mesa e que esses pedidos apareçam em uma tela operacional da padaria.

## Fluxo

1. QR Code identifica a mesa.
2. Cliente abre o cardápio.
3. Cliente adiciona produtos e observações.
4. Pedido é gravado no banco.
5. Tela operacional recebe atualização em tempo real.
6. Equipe altera status: recebido → preparando → pronto → entregue.
7. Cliente acompanha o status no celular.

## Camadas

### GitHub
Fonte do código, documentação técnica e histórico de alterações.

### Vercel
Hospedagem do Next.js. Produção ligada à branch `main`; branches de trabalho podem gerar previews.

### Notion
Gestão funcional: módulos, decisões, escopo, pendências e roadmap.

### Supabase — próxima etapa
PostgreSQL + Realtime. Tabelas iniciais previstas:
- `mesas`
- `categorias`
- `produtos`
- `pedidos`
- `itens_pedido`

## Segurança futura
- RLS no Supabase.
- Cardápio público somente leitura.
- Escrita de pedidos via endpoint validado.
- Área operacional autenticada.
- Nunca expor chave de serviço no navegador.
