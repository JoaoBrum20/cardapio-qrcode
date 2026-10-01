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
PostgreSQL para persistência e coordenação dos pedidos e do catálogo de produtos.

Tabelas atuais:
- `CARDAPIO_QRCODE_PEDIDOS`
- `CARDAPIO_QRCODE_CONTATOS`
- `CARDAPIO_QRCODE_PRODUTOS`

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


## Catálogo de produtos no Supabase

Em 01/10/2026 o cardápio deixou de depender exclusivamente de produtos definidos no código.

A tabela `CARDAPIO_QRCODE_PRODUTOS` passou a ser a fonte principal do catálogo exibido no site.

Campos principais:
- `id`
- `categoria`
- `nome`
- `preco`
- `descricao`
- `imagem`
- `ativo`
- `ordem`
- `criado_em`
- `atualizado_em`

Fluxo atual:
1. O frontend chama `buscarProdutos()` em `lib/padariaSupabase.js`.
2. A função consulta `CARDAPIO_QRCODE_PRODUTOS` pela Data API do Supabase.
3. Apenas produtos com `ativo = true` são retornados.
4. Os produtos são ordenados pelo campo `ordem`.
5. O frontend normaliza `preco` para número e usa os campos retornados nos cards, detalhes e carrinho.
6. Existe fallback local temporário no `app/page.js` para evitar que o cardápio fique indisponível caso a leitura do banco falhe.

### Segurança do catálogo
- RLS habilitado em `CARDAPIO_QRCODE_PRODUTOS`.
- `anon` e `authenticated` possuem somente `SELECT`.
- A policy pública de leitura retorna somente registros ativos.
- Não há permissão pública de insert, update ou delete.

### Imagens
As imagens permanecem em `public/images/` no projeto e o banco armazena o caminho relativo, por exemplo:
`/images/smash_bacon.png`.

Com isso, preço, descrição, categoria, ordem, disponibilidade e associação de imagem podem ser alterados no banco sem novo deploy, desde que a imagem já exista no projeto.
