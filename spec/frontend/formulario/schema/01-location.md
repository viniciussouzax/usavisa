# Seção 1: `location` — Local da Entrevista

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `location` | Local da entrevista | `select` | ✅ | `ddlLocation` | Lista de postos consulares mundiais. Postos brasileiros no topo (BRA, PTA, RCF, RDJ, SPL). |
| `locationPhotoWarning` | Alerta foto digital | `alert` | — | — | `showWhen: location in [PTA, RCF]`. alertStyle: warning. |
