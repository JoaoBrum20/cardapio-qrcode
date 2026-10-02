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


## Atualização — 02/10/2026: clientes e inteligência

Foi adicionada a base de clientes do Cardápio QR Code, separando cadastro do cliente do histórico de pedidos.

### Tabela de clientes

Nova tabela:
- `CARDAPIO_QRCODE_CLIENTES`

Campos principais:
- `id`
- `nome`
- `whatsapp` (único)
- `aceita_promocoes`
- `origem_cadastro`
- `origem_detalhe`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `primeiro_qr_numero`
- `criado_em`
- `atualizado_em`

A tabela `CARDAPIO_QRCODE_PEDIDOS` recebeu `cliente_id`, permitindo vincular cada pedido ao cliente sem duplicar o histórico dentro da tabela de clientes.

### Cadastro e reconhecimento do cliente

Foi criada a RPC `cardapio_qrcode_cadastrar_cliente`.

Fluxo:
1. O telefone/WhatsApp é normalizado e usado como chave de reconhecimento.
2. O cadastro é criado ou atualizado por WhatsApp.
3. Nome, origem, UTM e primeiro QR podem ser registrados.
4. Quando há `pedido_token`, o pedido atual é vinculado ao `cliente_id`.
5. O frontend salva o `cliente_id` localmente para tentar vincular pedidos futuros do mesmo aparelho.

A função `cardapio_qrcode_criar_pedido` também passou a aceitar `p_cliente_id`.

### Inteligência de clientes

Foi criada a view:
- `VW_CARDAPIO_QRCODE_CLIENTES_INTELIGENCIA`

Ela consolida, por cliente:
- total de pedidos;
- primeira e última compra;
- dias sem comprar;
- total gasto;
- ticket médio;
- frequência média em dias;
- pedidos nos últimos 30 e 90 dias;
- QR/mesa mais usado;
- dia da semana mais comum;
- horário mais comum;
- produtos preferidos;
- categorias preferidas;
- costumes de compra em JSON.

A regra permanece normalizada: pedidos continuam em `CARDAPIO_QRCODE_PEDIDOS`; a view deriva a inteligência sem duplicar o histórico.

## Dashboard administrativo de clientes

Foi criada a rota:
- `/dashboard/clientes`

Também foi criada a API server-side:
- `/api/dashboard/clientes`

A tela atual possui:
- busca por nome ou WhatsApp;
- filtros de inatividade em 30, 60 e 90 dias;
- ordenação por pedidos, recência, frequência, ticket, gasto e nome;
- paginação;
- métricas resumidas;
- tabela com nome, WhatsApp, cadastro, último pedido, recência, frequência, pedidos 30/90 dias, ticket, gasto, pedidos totais e origem;
- cabeçalho de tabela fixo;
- navegação lateral administrativa.

A navegação superior do sistema também recebeu a opção `Clientes`, apontando para `/dashboard/clientes`.

### Segurança atual do dashboard

O frontend continua usando:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Para a consulta administrativa de clientes, a API server-side aceita uma chave privada da Vercel:
- `SUPABASE_SECRET_KEY`
- fallback temporário: `SUPABASE_SERVICE_ROLE_KEY`

Essa chave privada nunca deve receber prefixo `NEXT_PUBLIC_` e nunca deve ser enviada ao navegador.

A tabela de clientes e a view de inteligência não possuem leitura pública direta para `anon`.

### Próxima tela planejada: perfil 360º do cliente

Ao clicar em um cliente da lista, será criada a rota:
- `/dashboard/clientes/[cliente_id]`

Planejamento da tela:
- nome e WhatsApp;
- cliente desde;
- último pedido;
- total de pedidos;
- total gasto;
- ticket médio;
- dias sem pedir;
- histórico de pedidos;
- produtos mais pedidos;
- combinações frequentes;
- horários e dias mais comuns;
- frequência de compra;
- adicionais e preferências;
- origem do cadastro;
- sugestões de produtos que o cliente ainda não pediu, mas clientes semelhantes costumam comprar.

Para as sugestões, está planejado reaproveitar o conceito de similaridade de conjuntos por Jaccard, comparando os produtos comprados por cada cliente.
