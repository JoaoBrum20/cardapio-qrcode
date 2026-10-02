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


## Atualização — 02/10/2026: clientes e base de métricas

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

### Base consolidada de métricas por cliente

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

A regra permanece normalizada: pedidos continuam em `CARDAPIO_QRCODE_PEDIDOS`; a view consolida métricas e campos de apoio sem duplicar o histórico.

**Importante:** a inteligência individual avançada por cliente ainda não está implementada no dashboard. Perfil 360º, padrões/combinações de compra, análise de adicionais e sugestões por clientes semelhantes continuam como próxima etapa.

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

### Próxima etapa planejada: inteligência individual e perfil 360º do cliente

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


## Implementação — 02/10/2026: inteligência individual por cliente

A inteligência individual deixou de ser apenas planejamento e passou a ter uma implementação própria no banco e no dashboard.

### Função de perfil 360º

Foi criada no Supabase:
- `cardapio_qrcode_cliente_360(cliente_id)`

A função retorna, para um cliente:
- cadastro e métricas consolidadas;
- histórico de até 50 pedidos;
- ranking de produtos comprados;
- quantidade, pedidos em que cada produto apareceu e percentual dos pedidos;
- valor histórico por produto;
- última compra de cada produto;
- combinações de produtos comprados no mesmo pedido;
- adicionais mais usados;
- pontos de carne registrados;
- clientes semelhantes;
- oportunidades de produtos ainda não comprados.

### Similaridade e sugestões

As sugestões usam similaridade **Jaccard** entre os conjuntos de produtos de cada cliente.

Para cada cliente:
1. é criado o conjunto de produtos já comprados;
2. esse conjunto é comparado com os demais clientes;
3. clientes sem nenhuma interseção são ignorados;
4. os clientes mais semelhantes recebem um score Jaccard;
5. produtos presentes nesses clientes e ausentes no cliente analisado viram candidatos;
6. as oportunidades são ordenadas pelo peso acumulado de similaridade, quantidade de clientes semelhantes e frequência.

Quando ainda não existe base com interseção suficiente, o sistema não inventa sugestões: a tela informa que ainda faltam dados. As oportunidades surgem automaticamente conforme o histórico cresce.

### Tela individual do cliente

Nova rota:
- `/dashboard/clientes/[clienteId]`

A linha inteira da lista de clientes agora é clicável.

A tela individual mostra:
- nome e WhatsApp;
- data de cadastro;
- opt-in promocional;
- total de pedidos;
- ticket médio;
- total gasto;
- recência;
- produtos mais pedidos;
- percentual de pedidos contendo cada produto;
- sugestões por clientes semelhantes;
- histórico expansível de pedidos;
- itens, adicionais, ponto da carne e observações;
- dia da semana mais comum;
- horário mais comum;
- frequência média;
- média de itens por pedido;
- QR/mesa mais usado;
- categoria favorita;
- combinações de produtos;
- adicionais e personalizações;
- origem do cadastro.

### Proteção temporária do dashboard

Como o dashboard contém telefone e histórico de consumo, foi adicionada uma proteção administrativa simples antes da autenticação completa.

Nova variável privada esperada na Vercel:
- `DASHBOARD_PASSWORD`

Foi criada:
- `/dashboard/login`
- `/api/dashboard/login`

Após o login, o servidor grava um cookie `HttpOnly`, `Secure` e `SameSite=Strict`.

As APIs de clientes agora exigem essa sessão administrativa e continuam usando a chave privada do Supabase somente no servidor.

Variáveis privadas:
- `SUPABASE_SECRET_KEY` (preferida)
- `SUPABASE_SERVICE_ROLE_KEY` (fallback legado)

Nenhuma dessas chaves deve receber o prefixo `NEXT_PUBLIC_`.

### Limpeza técnica

Foi removida uma implementação dinâmica antiga duplicada em `/clientes/[id]`, que conflitava com a nova rota `/clientes/[clienteId]` e ainda apontava para um CSS inexistente.


## Atualização — 02/10/2026: perfil 360, segurança e persistência do pedido

### Inteligência individual por cliente

Foi implementada a função server-side/Supabase:

- `cardapio_qrcode_cliente_360(cliente_id)`

Ela monta um perfil consolidado do cliente com base nos pedidos reais e retorna:

- cadastro do cliente;
- total de pedidos;
- primeira compra;
- última compra;
- dias sem comprar;
- total gasto;
- ticket médio;
- frequência média;
- pedidos em 30 e 90 dias;
- QR/mesa mais usado;
- dia da semana mais comum;
- horário mais comum;
- ranking de produtos;
- quantidade comprada por produto;
- percentual dos pedidos com cada produto;
- valor acumulado por produto;
- última compra do produto;
- combinações de produtos comprados juntos;
- adicionais mais usados;
- pontos da carne;
- histórico de pedidos;
- clientes semelhantes;
- sugestões de produtos.

### Similaridade Jaccard

As sugestões usam similaridade de Jaccard entre os conjuntos de produtos comprados por cada cliente.

Fluxo:
1. cria o conjunto de produtos do cliente;
2. compara com os conjuntos dos demais clientes;
3. calcula interseção / união;
4. descarta clientes sem interseção;
5. ordena os mais semelhantes;
6. identifica produtos comprados por esses semelhantes que o cliente analisado ainda não comprou;
7. ordena as oportunidades por peso acumulado de similaridade, quantidade de clientes semelhantes e frequência.

Quando a base ainda não possui interseção suficiente entre clientes, nenhuma sugestão é criada artificialmente. A interface informa que ainda faltam dados.

### Nova página individual do cliente

Rota criada:

- `/dashboard/clientes/[clienteId]`

A linha inteira da lista de clientes passou a ser clicável.

A nova tela mostra:
- nome;
- WhatsApp;
- cliente desde;
- opt-in promocional;
- total de pedidos;
- ticket médio;
- total gasto;
- recência;
- histórico de pedidos expansível;
- produtos mais pedidos;
- percentual dos pedidos em que o produto aparece;
- combinações frequentes;
- adicionais;
- ponto da carne;
- observações;
- dia da semana mais comum;
- horário mais comum;
- frequência média;
- média de itens por pedido;
- QR/mesa mais usado;
- categoria favorita;
- origem do cadastro;
- sugestões por clientes semelhantes.

### Proteção administrativa simples

Foi criada uma proteção temporária para o dashboard antes da futura autenticação multiusuário.

Novas rotas:
- `/dashboard/login`
- `/api/dashboard/login`

Nova variável privada esperada na Vercel:
- `DASHBOARD_PASSWORD`

Após o login, o servidor grava uma sessão em cookie:
- `HttpOnly`
- `Secure`
- `SameSite=Strict`

As APIs de clientes exigem essa sessão administrativa.

A leitura administrativa do Supabase continua sendo feita somente no servidor por:
- `SUPABASE_SECRET_KEY`
- fallback legado `SUPABASE_SERVICE_ROLE_KEY`

Essas chaves nunca devem usar prefixo `NEXT_PUBLIC_`.

### Limpeza de rotas duplicadas

Foi removida a implementação dinâmica antiga:
- `/dashboard/clientes/[id]`
- `/api/dashboard/clientes/[id]`

Ela conflitava com a nova estrutura `[clienteId]` e ainda referenciava um CSS antigo inexistente.

### Persistência do pedido em montagem

Foi corrigido um problema importante do fluxo do cliente: o carrinho podia ser perdido ao entrar no checkout/acompanhamento e voltar para o cardápio.

Foi adicionada persistência temporária no navegador usando:
- `sessionStorage`
- chave `cardapio_order_draft_v1`

O rascunho salva:
- itens do carrinho;
- quantidades;
- observações por item;
- adicionais;
- ponto da carne;
- observação geral do pedido.

O rascunho é restaurado quando a página é carregada novamente na mesma sessão.

Também foi corrigida a função de retorno ao cardápio:
- **voltar ao cardápio não limpa mais o carrinho nem as observações**.

O rascunho só é apagado depois que o pedido é enviado com sucesso para a cozinha.

Isso protege o pedido em casos como:
- abrir o checkout e voltar;
- sair da tela de acompanhamento e voltar ao cardápio;
- recarregar a página;
- navegar dentro do mesmo site na mesma aba.

### Estado após esta atualização

Implementado:
- lista administrativa de clientes;
- métricas consolidadas;
- perfil 360º;
- histórico de pedidos;
- favoritos;
- combinações;
- adicionais e preferências;
- similaridade Jaccard;
- sugestões por clientes semelhantes;
- login administrativo simples;
- proteção das APIs administrativas;
- persistência do pedido em montagem.

Pendências principais:
- autenticação multiusuário completa no futuro;
- risco de abandono;
- produtos que o cliente deixou de pedir;
- melhoria das sugestões conforme a base de clientes crescer.
