# Marca e Whitelabel

Painel de personalização visual da assessoria. As configurações aqui definidas são refletidas em todas as superfícies públicas: página do caso, formulário do solicitante e página pública da organização.

> A estrutura e os links da página pública da organização são configurados em **[org-page.md](./org-page.md)**. Este arquivo cobre apenas identidade visual (logo, cores, tipografia).

**Acesso:** Assessor (configurações da própria organização) · Master (qualquer organização via detalhe).

**URL:** `/[shortId]/organizacao` — seção "White label" (lista de 4 itens clicáveis, cada um abrindo drawer próprio)

---

## 1. O que é personalizado

A plataforma é multi-tenant. Cada assessoria tem sua própria identidade visual aplicada nas superfícies voltadas ao solicitante:

| Superfície | Whitelabel aplicado |
|---|---|
| Página pública do caso (`/c/{token}`) | Logo, cores, nome da assessoria |
| Formulário do solicitante | Logo, cor primária no header |
| Emails enviados ao solicitante | Logo, cor, nome da assessoria |
| Tela de link inválido/encerrado | Logo, cores |

O dashboard do assessor em si **não** recebe whitelabel — usa o visual padrão da plataforma.

---

## 2. Campos de Configuração

A lista tem 4 itens; cada um abre drawer próprio:

### Short ID

| Campo | Tipo | Notas |
|---|---|---|
| shortId | texto slug | Aparece em `/[shortId]/...`. Formato: `[a-z0-9-]+`. |

### Cores

| Campo | Tipo | Uso |
|---|---|---|
| color1 | color picker + hex | Cor primária — botões, links, destaques |
| color2 | color picker + hex | Cor secundária |
| color3 | color picker + hex | Cor de acento |

Futuro: sugestão automática de cor de texto por contraste + aviso WCAG AA (observação futura, não MVP).

### Marca

| Campo | Tipo | Notas |
|---|---|---|
| logoLight (URL) | url | Usada em fundo escuro (tema dark) |
| logoDark (URL) | url | Usada em fundo claro (tema light) |
| iconLight (URL) | url | Favicon versão clara |
| iconDark (URL) | url | Favicon versão escura |

Se nenhum logo estiver configurado: renderiza o `shortId` em badge colorido como fallback.

Se só uma variante estiver configurada: usada em ambos os temas.

### Tipografia

| Campo | Tipo | Notas |
|---|---|---|
| fontTitle | select Google Fonts | Fonte dos títulos — preview ao vivo na própria fonte |
| fontBody | select Google Fonts | Fonte dos parágrafos |

Lista de ~40 Google Fonts curadas em [lib/google-fonts.ts](../../lib/google-fonts.ts).

---

### Nome público e WhatsApp

`nome` (nome público) e `whatsapp` (número de suporte) NÃO estão na seção White label — ficam em outro drawer da mesma página (`/[shortId]/organizacao`), já que são dados de identificação/contato, não de marca visual.

### Rodapé, CNPJ, endereço, observações internas

NÃO implementados. Podem entrar em "observações futuras" se fizerem sentido depois.

---

## 3. Preview em Tempo Real

**Observação futura** — não implementado no MVP. Hoje o assessor precisa salvar e abrir a página pública em aba separada pra ver o resultado.

---

## 4. Salvar e Publicar

- Botão **"Salvar"** — persiste as configurações
- Aplicação imediata — não há ambiente de rascunho separado
- Alterações são refletidas em todas as páginas públicas ativas da organização instantaneamente após salvar

---

## 5. Configurações Padrão (fallback)

Se uma organização não configurou whitelabel, as páginas públicas exibem:

| Campo | Fallback |
|---|---|
| Logo | `shortId` em badge colorido |
| Nome | Nome cadastrado (`organizacao.nome`) |
| color1 | `#09090b` (preto) |
| color2 | `#71717a` (cinza médio) |
| color3 | `#3b82f6` (azul tailwind) |
| fontTitle / fontBody | `Inter` |
