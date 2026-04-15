# Seção 21: `photo` — Foto do Solicitante

> Esta seção coleta a foto do solicitante para o DS-160. O upload é enviado diretamente ao servidor Supabase Storage — **não** ao CEAC durante o preenchimento. O actor de automação usa a URL armazenada para fazer o upload ao portal CEAC no momento da submissão.

## Campo

| id | label | type | req | notas |
|---|---|---|---|---|
| `photo` | Foto do Solicitante | `file` | ✅ | Formato: JPG. Tamanho máximo: 240 KB. Fundo branco, rosto centralizado. |

## Requisitos da Foto (padrão CEAC)

- Formato: `.jpg`
- Tamanho máximo: 240 KB
- Dimensões mínimas: 600 × 600 px
- Fundo branco liso
- Rosto centralizado, sem óculos, expressão neutra

## Comportamento no Form

1. O solicitante faz upload da foto via input `file`.
2. O form valida tamanho e formato antes de aceitar.
3. A foto é armazenada no Supabase Storage e a URL é salva no JSON do solicitante.
4. Um preview da foto é exibido após o upload bem-sucedido.

## Uso pelo Actor

O actor de automação lê a URL da foto do JSON e executa o upload ao portal `identix.state.gov` em etapa separada, após preencher os dados textuais do DS-160. Para detalhes do fluxo de upload ao CEAC (popup, confirmação, skip), consultar [`actors/ceac_ds160/pages/23_photo.md`](../../../../actors/ceac_ds160/pages/23_photo.md).
