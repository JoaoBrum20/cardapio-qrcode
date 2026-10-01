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
