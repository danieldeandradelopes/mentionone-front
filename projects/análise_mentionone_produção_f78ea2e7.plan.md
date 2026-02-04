---
name: Análise MentionOne Produção
overview: Análise dos projetos mentionone-api, mentionone-front e mentionone-lp com foco em segurança, usabilidade, funcionalidades e UX/UI para lançamento em produção, além de sugestões de funcionalidades futuras para tornar o produto mais vendável.
todos: []
isProject: false
---

# Análise MentionOne para Produção

## Visão geral da arquitetura

```mermaid
flowchart LR
  subgraph lp [mentionone-lp]
    LP[Landing Page]
    Checkout[Checkout]
    Contact[Form Contato]
    Subscribe[Newsletter]
  end
  subgraph front [mentionone-front]
    Admin[Admin Painel]
    Login[Login]
    QR[Página QR Feedback]
  end
  subgraph api [mentionone-api]
    Auth[JWT Auth]
    Public[/public/*]
    Protected[Rotas Protegidas]
  end
  LP --> api
  Checkout --> api
  Contact --> LP
  Subscribe --> LP
  Admin --> api
  Login --> api
  QR --> api
```

---

## 1. Segurança

### 1.1 API (mentionone-api)

**Crítico**

- **JWT em produção**: Em [JsonWebTokenAdapter.ts](mentionone-api/src/infra/JwtAssign/JsonWebTokenAdapter.ts), se `JWT_SECRET` ou `JWT_REFRESH_SECRET` não estiverem definidos em produção, o código usa string vazia `""`, o que invalida a segurança dos tokens. **Ação**: Validar na inicialização da API que em `NODE_ENV=production` essas variáveis existem e têm tamanho mínimo (ex.: 32 caracteres); falhar o startup se não houver.
- **Rotas públicas sem rate limit específico**: `/public/signup-free`, `/public/checkout` e `/public/signup-notification` passam apenas pelo limiter global (50 req/min). São alvos óbvios para abuso (criação em massa de contas, envio de e-mails). **Ação**: Aplicar rate limit mais restritivo nessas rotas (ex.: 5 signups/hora por IP, 3 notificações/minuto).
- **Mensagens de erro em produção**: Em [error.ts](mentionone-api/src/middleware/error.ts), `error.message` é devolvido ao cliente em todas as respostas. Em produção isso pode expor detalhes internos (SQL, paths). **Ação**: Em produção, retornar mensagem genérica ("Algo deu errado") e logar o erro completo (já existe Sentry).

**Importante**

- **Validação de entrada**: Em [public.routes.ts](mentionone-api/src/routes/public.routes.ts), signup e checkout validam só "Missing required fields" e usam `sanitizeSubdomain`. Não há validação de tipo/tamanho (e-mail, senha forte, CPF/CNPJ, tamanho de nome). **Ação**: Introduzir validação com Zod (ou similar) para todos os payloads públicos: formato de e-mail, senha (mínimo 8 caracteres, regras básicas), CPF/CNPJ válido, limite de caracteres.
- **Upload de arquivos**: Em [upload.routes.ts](mentionone-api/src/routes/upload.routes.ts) e [multer.ts](mentionone-api/src/utils/multer.ts) há limite de 10MB mas não há whitelist de MIME types. **Ação**: Restringir a tipos permitidos (ex.: `image/jpeg`, `image/png`, `image/webp`) para evitar upload de executáveis ou HTML malicioso.
- **trust proxy**: Em [app.ts](mentionone-api/src/app.ts) está `app.set("trust proxy", "loopback")`, ou seja, confia apenas em localhost. Em produção atrás de Nginx/Vercel o IP real vem em `X-Forwarded-For`. **Ação**: Em produção usar `trust proxy: 1` (ou o número de proxies) para o rate limit e logs usarem o IP correto.
- **Inconsistência no limiter**: Em [limit.ts](mentionone-api/src/utils/limit.ts) a mensagem diz "30 requisições" mas `max` é 50. Corrigir o texto.

### 1.2 Landing Page (mentionone-lp)

**Crítico**

- **API Contact**: [app/api/contact/route.ts](mentionone-lp/app/api/contact/route.ts) monta HTML do e-mail interpolando `name`, `email`, `phone`, `message` diretamente. Se alguém enviar HTML/script na mensagem, pode gerar XSS no e-mail ou em sistemas que renderizem o corpo. **Ação**: Sanitizar/escapar os valores antes de inserir no HTML (ex.: substituir `<`, `>`, `"`, `'`) ou usar lib de escape HTML.
- **API Subscribe**: [app/api/subscribe/route.ts](mentionone-lp/app/api/subscribe/route.ts) não tem rate limit. Permite spam e abuso. **Ação**: Rate limit por IP (ex.: 5 req/15 min) na rota.
- **Subscribe persiste em `/tmp**`: Em ambiente serverless (Vercel), `/tmp` é efêmero; e-mails inscritos são perdidos entre execuções. **Ação**: Persistir em banco (via API) ou serviço externo (ex.: planilha, CRM, e-mail para lista); não depender de arquivo local.

**Importante**

- **Contact sem rate limit**: O formulário de contato pode ser abusado para envio em massa de e-mails. **Ação**: Rate limit na rota `/api/contact` (ex.: 5 req/15 min por IP).

### 1.3 Front (mentionone-front)

**Importante**

- **Token no localStorage**: Em [use-auth.tsx](mentionone-front/hooks/utils/use-auth.tsx) o token JWT fica em `localStorage`. Isso é vulnerável a XSS: se houver falha em qualquer script de terceiro ou componente, o token pode ser roubado. **Ação (curto prazo)**: Manter como está, mas garantir que não há `dangerouslySetInnerHTML` com input do usuário e que dependências são auditadas. **Ação (médio prazo)**: Migrar para apenas cookies httpOnly para o access token (já existe refresh em cookie) e usar o cookie para chamadas à API (proxy no Next ou enviar cookie).
- **Proteção de rotas só no cliente**: Não existe [middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware) no front; o redirect para `/login` é feito em `useEffect` em cada página (ex.: [dashboard](mentionone-front/app/admin/dashboard/page.tsx)). Páginas admin são carregadas antes do redirect, então um atacante pode ver o HTML antes de ser redirecionado. **Ação**: Criar `middleware.ts` na raiz do app que verifique cookie/sessão e redirecione para `/login` antes de servir qualquer página em `/admin/*` (e opcionalmente `/qr` se for área restrita).

---

## 2. Usabilidade

### 2.1 API

- **Mensagens de erro em português**: Em vários pontos as mensagens estão em inglês ("Unset token!", "Unauthorized!"). Padronizar para português para consistência com o front.
- **Documentação pública**: Swagger em `/api-docs` pode expor rotas e contratos. Em produção, considerar proteger por senha ou desativar, ou publicar documentação apenas em ambiente de staging.

### 2.2 Front

- **Feedback de erro no login**: O [LoginForm](mentionone-front/app/login/LoginForm.tsx) exibe `error?.message` vindo da API. Garantir que a API devolva mensagens amigáveis (ex.: "E-mail ou senha incorretos" em vez de "Unauthorized!").
- **Estado de carregamento global**: Não há indicador global de loading em transições (ex.: barra no topo). Considerar um componente de loading para navegação entre páginas admin.
- **Onboarding**: Existe [OnboardingGate](mentionone-front/components/onboarding/OnboardingGate.tsx); verificar se o fluxo está claro e se há como pular ou retomar depois.
- **Sessão expirada**: Se o JWT expirar no meio do uso, as chamadas falham. Não há tratamento central (ex.: redirect para login com mensagem "Sessão expirada"). **Ação**: No cliente (interceptor da API ou hook), ao receber 401, limpar auth e redirecionar para `/login?expired=1` e exibir mensagem.

### 2.3 LP

- **Checkout**: O [checkout](mentionone-lp/app/checkout/page.tsx) é longo e com muitos campos. Considerar indicador de progresso (steps), resumo lateral no desktop e validação em tempo real com mensagens ao lado dos campos.
- **Contato**: O componente [Contact](mentionone-lp/app/components/contact/index.tsx) já tem validação e estados de sucesso/erro; verificar se a mensagem de sucesso e o modal são claros.
- **Subscribe**: Deixar claro o que acontece ao se inscrever (ex.: "Você receberá novidades e ofertas") e exibir confirmação após sucesso.

---

## 3. Funcionalidades (melhorias e lacunas)

### 3.1 Melhorias para lançamento

- **Recuperação de senha**: Não foi encontrado fluxo de "esqueci minha senha" (e-mail com link ou token). Essencial para produção. Implementar na API (geração de token, rota de reset) e no front (página "Esqueci minha senha" e página de nova senha).
- **Política de senha**: Não há exigência de complexidade no signup/checkout. Implementar no backend (e no front) regras mínimas (ex.: 8 caracteres, 1 número, 1 letra maiúscula) e retornar erro claro.
- **Confirmação de e-mail (opcional para v1)**: Após signup, enviar e-mail de confirmação antes de considerar a conta ativa. Reduz contas falsas e melhora qualidade do cadastro.
- **Logs de auditoria (opcional para v1)**: Registrar ações sensíveis (login, alteração de dados da empresa, alteração de plano) para suporte e conformidade.

### 3.2 Consistência

- **Domínio no CORS**: Em [app.ts](mentionone-api/src/app.ts) o CORS permite `app.mentionone.com` e `mentionone.com`. Se o front ou a LP forem hospedados em outros domínios (ex.: Vercel), é preciso incluí-los na lista ou usar variável de ambiente para origens permitidas.
- **URL da API no front**: Em [api.ts](mentionone-front/app/lib/api.ts) a produção usa `https://mentionone-api.vercel.app/`. Garantir que essa URL e o domínio da API em produção estejam alinhados com o CORS e com a LP (checkout chama a API).

---

## 4. UX/UI

### 4.1 Front (admin)

- **Identidade visual**: [globals.css](mentionone-front/app/globals.css) usa Arial e variáveis básicas. A [Sidebar](mentionone-front/components/Sidebar.tsx) já usa cores escuras e Lucide. Vale padronizar: paleta (primária, secundária, erros, sucesso), tipografia (ex.: uma fonte sans para todo o admin) e espaçamentos.
- **Responsividade**: Sidebar vira menu mobile; dashboard e listas (boxes, feedbacks) devem ser testados em mobile para tabelas/cards e botões.
- **Acessibilidade**: Garantir contraste (ex.: texto em cinza sobre fundo claro), labels em todos os inputs, e que botões/links são utilizáveis por teclado. O login já tem `aria-label` no botão de mostrar senha.
- **Empty states**: Em listas (boxes, feedbacks), quando não há dados, exibir ilustração ou mensagem orientando o próximo passo (ex.: "Crie sua primeira caixa" com link).
- **Confirmações destrutivas**: Em ações como excluir box ou usuário, usar modal de confirmação ("Tem certeza?") antes de enviar a requisição.
- **Dashboard**: Gráficos (Recharts) e cards estão claros; considerar tooltips em métricas e link "Ver todos" nos últimos feedbacks.

### 4.2 LP

- **Hierarquia e leitura**: A [page.tsx](mentionone-lp/app/page.tsx) tem hero, benefícios, como funciona, preços, FAQ e contato. Estrutura boa; garantir que os títulos tenham níveis corretos (h1 único, h2 para seções) para SEO e acessibilidade.
- **Performance**: Imagens em Next/Image com `priority` no hero; verificar se há lazy loading nas demais e se os tamanhos estão adequados.
- **Checkout**: Reduzir ruído visual (agrupar campos em cards), manter CTA principal sempre visível (sticky no mobile) e mostrar resumo do plano e preço no topo ou na lateral.
- **Dark mode**: O front tem `prefers-color-scheme: dark` no CSS; a LP não. Decidir se a LP terá tema escuro e aplicar de forma consistente.

---

## 5. Sugestões de funcionalidades futuras (produto mais vendável)

- **Relatórios exportáveis (PDF/Excel)**: Além de CSV, oferecer relatório em PDF com gráficos e resumo por período, e exportação em Excel para planos superiores.
- **NPS ou pesquisa de satisfação**: Além de feedback livre, permitir perguntas tipo NPS (0–10) ou múltipla escolha com métricas (média, evolução no tempo).
- **Integrações**: Slack, Teams ou e-mail para notificação de novo feedback; webhook genérico para integrações customizadas.
- **Multi-idioma**: Admin e página de feedback (QR) em português e inglês para expandir mercado.
- **White-label**: Opção em planos maiores para remover "MentionOne" da página de feedback e usar apenas logo e cores do cliente.
- **Templates de caixa**: Galeria de templates (restaurante, varejo, RH) para o cliente começar rápido.
- **Dashboard público ou compartilhado**: Link somente leitura para o cliente compartilhar com gestores ou direção, sem acesso de edição.
- **Metas e alertas**: Definir meta de feedbacks por período ou de NPS e receber alerta (e-mail) quando não atingido ou quando houver pico de reclamações.
- **API pública**: Para integradores ou clientes avançados, expor API documentada (com API key por empresa) para listar feedbacks, criar caixas, etc.
- **App mobile (PWA ou nativo)**: Versão mobile do admin para acompanhar feedbacks e métricas em tempo real.

---

## 6. Resumo de prioridades para produção

| Área                    | Prioridade | Itens principais                                                                                                                                            |
| ----------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Segurança API           | Alta       | JWT secret obrigatório em prod; rate limit em signup/checkout/notificação; não expor detalhes de erro em prod; validação Zod em rotas públicas; trust proxy |
| Segurança LP            | Alta       | Escape HTML no e-mail de contato; rate limit em contact e subscribe; persistir inscritos fora de /tmp                                                       |
| Segurança Front         | Média      | Middleware para proteger /admin; tratamento de 401 (sessão expirada)                                                                                        |
| Usabilidade             | Média      | Recuperação de senha; política de senha; mensagens de erro em PT; CORS alinhado ao deploy                                                                   |
| UX/UI                   | Média      | Empty states; confirmações destrutivas; revisão de acessibilidade e responsividade                                                                          |
| Funcionalidades futuras | Baixa      | Conforme roadmap (NPS, integrações, relatórios PDF, white-label, etc.)                                                                                      |

Implementar primeiro os itens de segurança crítica e, em seguida, recuperação de senha e ajustes de usabilidade/UX listados acima, para ter um lançamento sólido e preparado para crescimento.
