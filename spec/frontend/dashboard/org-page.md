# Página Pública da Organização — Hotpage

> **⚠️ Fase 6 — parcialmente implementado.** Hoje `/[shortId]` renderiza uma landing mínima (logo + nome + botão Entrar + Suporte via WhatsApp). Os links configuráveis (Linktree-style) descritos abaixo são da Fase 6 do roadmap.

Cada organização tem uma página pública acessível via shortId:

```
{NEXT_PUBLIC_BASE_URL}/{shortId}
```

Uma hotpage simples — não é um site completo nem uma landing page elaborada. Tem um único propósito: **reforçar a marca da assessoria e indicar os próximos passos** para quem já conhece ou foi indicado.

Três elementos fixos: **marca** (quem é), **apresentação** (o que faz), **caminhos** (onde ir). Nada além disso.

A assessoria compartilha essa URL no Instagram, WhatsApp, email, cartão de visitas — é o link único que representa a presença digital mínima e funcional da assessoria.

---

## 1. Estrutura da página

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [ Logo ]
  Nome da Assessoria
  Tagline  →  "Seu visto americano com segurança"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Descrição breve
  Ex: "Somos especializados em vistos B1/B2, F1 e J1.
       Atendemos famílias e profissionais em todo o Brasil."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [ 📅 Agendar consultoria          → ]
  [ 💬 Falar no WhatsApp            → ]
  [ 📋 Acessar meu formulário       → ]
  [ 📄 Documentos necessários       → ]
      Lista completa para visto B1/B2
  [ 📷 Instagram                    → ]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  © 2025 Assessoria Silva
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- Página centralizada, sem menu, sem navegação lateral
- Whitelabel completo: logo, cores e tipografia da assessoria
- Sem interface da plataforma visível
- Cada botão é um caminho — link externo, WhatsApp, agenda ou modal interno

---

## 2. Tipos de Link

### Links pré-configurados (atalhos inteligentes)

São botões com comportamento específico além de abrir uma URL. A assessoria ativa com um toggle — sem precisar configurar do zero.

| Tipo | Comportamento ao clicar | Campo necessário |
|---|---|---|
| **Agendamento** | Abre modal com embed da agenda (Calendly, Cal.com, etc.) | Link ou código embed |
| **WhatsApp** | Abre `wa.me/{número}` direto no app | Número com DDI |
| **Formulário de contato** | Abre modal com form simples → envia email para a assessoria | Email de destino |

---

### Links personalizados (livres)

A assessoria adiciona quantos quiser. Ao clicar, o visitante é levado para a URL definida — em nova aba.

**Campos por link personalizado:**

| Campo | Tipo | Notas |
|---|---|---|
| Nome | texto | Rótulo exibido no botão — ex: "Tire suas dúvidas" |
| Descrição | texto | Linha menor abaixo do nome — ex: "Perguntas frequentes sobre o visto B1/B2" |
| URL | url | Para onde o visitante vai ao clicar |
| Ícone | select | Conjunto fixo de ícones para escolher (opcional) |
| Ativo | toggle | Desativar sem deletar |

**Exemplos de uso:**

```
[ 📄 Documentos necessários                          → ]
      Lista completa para visto B1/B2

[ 📅 Agendar consultoria                             → ]
      Escolha o melhor horário para você

[ 💬 Grupo de dicas no WhatsApp                      → ]
      Orientações gratuitas toda semana

[ 🎥 Como funciona o processo                        → ]
      Vídeo explicativo — 3 minutos
```

---

## 3. Painel de Configuração (assessor)

**URL:** `/[shortId]/configuracoes/pagina-publica` *(Fase 6 — a implementar)*

```
IDENTIDADE
Slug da página   [ assessoria-silva        ]  → /assessoria-silva
Tagline          [ Seu visto americano com segurança e agilidade ]
Descrição        [ Somos especializados em vistos B1/B2, F1 e J1.  ]
                 [ Atendemos famílias e profissionais em todo o     ]
                 [ Brasil com acompanhamento completo do processo.  ]
                 máx. 300 caracteres

LINKS
                                              [ + Adicionar link ]
┌──────────────────────────────────────────────────────────────────┐
│ ☰  📅  Agendamento          ● Ativo    Calendly embed  [✎] [✕]  │
│ ☰  💬  WhatsApp             ● Ativo    +55 11 99999    [✎] [✕]  │
│ ☰  📧  Formulário contato   ○ Inativo  —               [✎] [✕]  │
│ ☰  📄  Documentos B1/B2     ● Ativo    notion.so/...   [✎] [✕]  │
│ ☰  📷  Instagram            ● Ativo    instagram.com/  [✎] [✕]  │
└──────────────────────────────────────────────────────────────────┘

RODAPÉ
Texto  [ © 2025 Assessoria Silva. Todos os direitos reservados. ]

[ Ver página →  ]        [ Salvar ]
```

- `☰` — arrastar para reordenar
- Toggle por linha — ativar/desativar sem deletar
- `[✎]` — editar campos do link
- `[✕]` — deletar (com confirmação)

---

## 4. Modal de Adicionar / Editar Link

```
Adicionar link

Ícone       [ 📄 ▼ ]

Nome        [_________________________________]
            Ex: Documentos necessários

Descrição   [_________________________________]
            Linha explicativa abaixo do nome (opcional)

URL         [_________________________________]
            https://...

            [ Cancelar ]    [ Salvar link ]
```

---

## 5. Modal de Agendamento (visitante)

Ao clicar no botão de agendamento, abre um modal sobreposto na própria página — o visitante não sai do link hub:

```
┌─────────────────────────────────────┐
│  Agendar consultoria          [ ✕ ] │
├─────────────────────────────────────┤
│                                     │
│  [ iframe do Calendly / Cal.com ]   │
│                                     │
└─────────────────────────────────────┘
```

Configuração: a assessoria cola o link ou código embed do serviço que já usa. Sem acoplamento a um serviço específico.

---

## 6. Modal de Formulário de Contato (visitante)

```
┌─────────────────────────────────────┐
│  Enviar mensagem              [ ✕ ] │
├─────────────────────────────────────┤
│  Nome        [___________________]  │
│  Email       [___________________]  │
│  Telefone    [___________________]  │
│  Mensagem    [___________________]  │
│              [___________________]  │
│                                     │
│              [ Enviar ]             │
└─────────────────────────────────────┘
```

Ao enviar: email entregue via Mailgun para o endereço configurado pela assessoria. Mensagem de confirmação exibida no modal.

---

## 7. Slug da Organização

| Aspecto | Decisão |
|---|---|
| Formato | URL-safe, minúsculas, sem espaços — ex: `assessoria-silva` |
| Unicidade | Único na plataforma — validado ao salvar |
| Editável | Sim — mas alterar o slug quebra links já compartilhados. Aviso explícito ao editar. |
| Definido por | Master no cadastro da org · Assessor pode editar nas configurações |
| Fallback | Se não configurado: página retorna 404 |

---

## 8. Estados da Página

| Estado | O que aparece |
|---|---|
| Configurada e ativa | Página normal com os links ativos |
| Sem links cadastrados | Página com logo + tagline + mensagem: *"Em breve."* |
| Org suspensa / inativa | 404 genérico — sem revelar que a org existe |
| Slug não encontrado | 404 genérico |

---

## 9. O que esta página substitui

- Conta no Linktree ou Beacons
- Link da bio do Instagram apontando para fora
- Site externo para assessorias pequenas que só precisam de uma presença online básica
- Links espalhados em mensagens de WhatsApp e email
