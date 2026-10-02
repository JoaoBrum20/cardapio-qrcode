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
- [x] Implementar inteligência individual de produtos e categorias preferidas no perfil do cliente
- [x] Criar dashboard `/dashboard/clientes`
- [x] Criar busca, filtros, ordenação e paginação
- [x] Adicionar Clientes à navegação superior
- [x] Tornar a linha inteira do cliente clicável
- [x] Criar `/dashboard/clientes/[cliente_id]`
- [x] Exibir histórico detalhado de pedidos
- [x] Calcular e exibir produtos e combinações frequentes por cliente
- [x] Implementar perfil de consumo por dia/horário/frequência
- [x] Criar sugestões com clientes semelhantes (Jaccard)
- [x] Separar visualmente favoritos de oportunidades de mix
- [ ] Adicionar indicadores futuros de risco de abandono e produto que parou de pedir

## 8. Segurança do dashboard
- [x] Manter publishable key no frontend
- [x] Manter clientes sem leitura pública direta
- [x] Preparar API server-side para `SUPABASE_SECRET_KEY`
- [ ] Confirmar `SUPABASE_SECRET_KEY` em Production na Vercel e redeploy
- [ ] Adicionar autenticação administrativa completa antes de uso com múltiplos operadores


## 9. Perfil 360º e proteção administrativa
- [x] Criar função `cardapio_qrcode_cliente_360`
- [x] Ranking de produtos por cliente
- [x] Combinações compradas juntas
- [x] Adicionais e pontos de carne
- [x] Histórico expansível de pedidos
- [x] Similaridade Jaccard
- [x] Oportunidades de produtos ainda não comprados
- [x] Criar login simples do dashboard
- [x] Proteger APIs de clientes com sessão HttpOnly
- [ ] Configurar `DASHBOARD_PASSWORD` em Production na Vercel
- [ ] Evoluir o login simples para autenticação multiusuário quando necessário
