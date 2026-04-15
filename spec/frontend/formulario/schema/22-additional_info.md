# Seção 22: `additionalInfo` — Informações Adicionais do Caso

> **Seção exclusiva da plataforma Sends160 — não faz parte do DS-160 oficial.**
> Espaço para o solicitante comunicar ao assessor contexto, histórico e detalhes complementares sobre o seu caso que não cabem nos campos estruturados do formulário consular.

## Finalidade

O assessor lê essas informações antes de revisar o DS-160. Serve para:
- Explicar situações fora do padrão (ex: viagem anterior recusada, visto cancelado, lacunas de emprego)
- Alertar sobre dados sensíveis que precisam de atenção
- Fornecer documentação ou contexto que o formulário não captura
- Comunicar preferências ou restrições do solicitante

## Campos

| id | label | type | req | notas |
|---|---|---|---|---|
| `caseNotes` | Informações adicionais sobre o seu caso | `textarea` | — | Texto livre. O solicitante descreve com suas próprias palavras qualquer detalhe relevante. Sem limite restritivo de caracteres. |
| `sensitiveFlags` | Possui alguma situação sensível? | `radio` | — | Opções: S(Sim), N(Não). Sinaliza ao assessor que o caso requer atenção especial antes da revisão. |
| `sensitiveDetails` | Descreva a situação | `textarea` | — | `showWhen: sensitiveFlags=S`. Permite detalhar a situação sensível sem expô-la nos campos do DS-160. |

## Comportamento

- Esta seção **não gera campos no JSON enviado ao actor** — é dados internos da plataforma.
- O conteúdo fica visível para o assessor na view de Revisão como um bloco de contexto destacado antes das seções do DS-160.
- Não interfere no cálculo de progresso nem na validação do formulário.
- Pode ser preenchida em qualquer momento, sem ordem obrigatória.
