# Roadmap — Cardápio QR Code

## 1. Cardápio digital
- [x] Estrutura visual
- [x] Categorias
- [x] Busca
- [x] Carrinho
- [x] Mesa/QR por query string
- [x] Fotos reais

## 2. Banco e pedidos
- [x] Supabase conectado
- [x] Tabela de pedidos
- [x] Pedido real gravado no banco
- [x] Vínculo com QR/mesa
- [x] Acompanhamento por token

## 3. Tela operacional
- [x] Fila de pedidos
- [x] Estado novo
- [x] Estado preparando
- [x] Finalização e remoção do painel
- [ ] Realtime sem polling

## 4. Administração
- [x] Produtos no Supabase
- [x] Preços vindos do banco
- [x] Disponibilidade via campo `ativo`
- [x] Categorias vindas do banco
- [ ] Mesas e QR Codes

## 5. Inteligência
- [ ] Histórico de pedidos
- [ ] Vendas do dia
- [ ] Produtos mais vendidos
- [ ] Ticket médio


## 6. Catálogo dinâmico
- [x] Criar `CARDAPIO_QRCODE_PRODUTOS`
- [x] Migrar os 42 produtos atuais para o Supabase
- [x] Vincular caminhos das imagens aos produtos
- [x] Ler produtos ativos pela Data API
- [x] Ordenar cardápio pelo campo `ordem`
- [x] Manter fallback local temporário
- [ ] Criar tela administrativa para editar catálogo sem acessar o Supabase
- [ ] Permitir upload/gestão de imagens pela administração


## 7. Clientes e CRM
- [x] Criar `CARDAPIO_QRCODE_CLIENTES`
- [x] Vincular `CARDAPIO_QRCODE_PEDIDOS.cliente_id`
- [x] Criar RPC de cadastro/atualização de cliente por WhatsApp
- [x] Vincular pedido atual pelo `pedido_token`
- [x] Reaproveitar `cliente_id` nos pedidos futuros quando reconhecido
- [x] Criar `VW_CARDAPIO_QRCODE_CLIENTES_INTELIGENCIA`
- [x] Calcular recência, frequência, ticket, gasto e pedidos 30/90 dias
- [ ] Implementar inteligência individual de produtos e categorias preferidas no perfil do cliente
- [x] Criar dashboard `/dashboard/clientes`
- [x] Criar busca, filtros, ordenação e paginação
- [x] Adicionar Clientes à navegação superior
- [ ] Tornar a linha inteira do cliente clicável
- [ ] Criar `/dashboard/clientes/[cliente_id]`
- [ ] Exibir histórico detalhado de pedidos
- [ ] Calcular e exibir produtos e combinações frequentes por cliente
- [ ] Implementar perfil de consumo por dia/horário/frequência
- [ ] Criar sugestões com clientes semelhantes (Jaccard)
- [ ] Separar visualmente favoritos de oportunidades de mix
- [ ] Adicionar indicadores futuros de risco de abandono e produto que parou de pedir

## 8. Segurança do dashboard
- [x] Manter publishable key no frontend
- [x] Manter clientes sem leitura pública direta
- [x] Preparar API server-side para `SUPABASE_SECRET_KEY`
- [ ] Confirmar `SUPABASE_SECRET_KEY` em Production na Vercel e redeploy
- [ ] Adicionar autenticação administrativa completa antes de uso com múltiplos operadores
