import type { FormField, FormSection } from "../primitives";

type SecurityQ = { id: string; label: string; withExpl?: boolean };

/**
 * Gera um par (radio, textarea-de-explicação opcional) pra cada pergunta
 * do §17 security. Todas com default "N" (resposta recomendada para a
 * maioria dos casos), conforme política descrita em assisted-fill.md.
 */
function buildQuestions(qs: SecurityQ[]): FormField[] {
  const out: FormField[] = [];
  for (const q of qs) {
    out.push({
      id: q.id,
      type: "radio",
      label: q.label,
      required: true,
      default: "N",
    });
    if (q.withExpl) {
      out.push({
        id: `${q.id}Expl`,
        type: "textarea",
        label: "Explique (resposta completa e honesta)",
        required: true,
        maxLen: 200,
        showWhen: { field: q.id, equals: "Y" },
      });
    }
  }
  return out;
}

const QUESTIONS: SecurityQ[] = [
  { id: "disease", label: "Possui doença comunicável?", withExpl: true },
  { id: "disorder", label: "Possui distúrbio mental ou físico?", withExpl: true },
  { id: "drugUser", label: "É usuário de drogas?", withExpl: true },
  { id: "arrested", label: "Já foi preso ou condenado?", withExpl: true },
  {
    id: "controlledSubstances",
    label: "Violou lei de substâncias controladas?",
    withExpl: true,
  },
  { id: "prostitution", label: "Envolvido em prostituição?" },
  { id: "moneyLaundering", label: "Envolvido em lavagem de dinheiro?" },
  { id: "humanTrafficking", label: "Envolvido em tráfico de pessoas?" },
  { id: "assistedSevereTrafficking", label: "Auxiliou tráfico severo?" },
  { id: "humanTraffickingRelated", label: "Parente de traficante de pessoas?" },
  { id: "illegalActivity", label: "Pretende atividades ilegais nos EUA?" },
  { id: "terroristActivity", label: "Envolvido em atividades terroristas?" },
  { id: "terroristSupport", label: "Apoiou atividades terroristas?" },
  { id: "terroristOrg", label: "Membro de organização terrorista?" },
  { id: "terroristRel", label: "Parente de envolvido em terrorismo?" },
  { id: "genocide", label: "Envolvido em genocídio?" },
  { id: "torture", label: "Envolvido em tortura?" },
  { id: "exViolence", label: "Envolvido em violência extrajudicial?" },
  { id: "childSoldier", label: "Recrutou crianças-soldado?" },
  { id: "religiousFreedom", label: "Violou liberdade religiosa?" },
  {
    id: "populationControls",
    label: "Envolvido em controle populacional forçado?",
  },
  { id: "transplant", label: "Envolvido em transplante forçado de órgãos?" },
  { id: "removalHearing", label: "Já teve audiência de remoção?" },
  { id: "immigrationFraud", label: "Cometeu fraude imigratória?" },
  { id: "failToAttend", label: "Falhou em comparecer a audiência?" },
  { id: "visaViolation", label: "Violou termos de um visto anterior?" },
  { id: "deport", label: "Já foi deportado?" },
  {
    id: "childCustody",
    label: "Detém custódia de criança de cidadão americano?",
  },
  { id: "votingViolation", label: "Violou lei eleitoral?" },
  { id: "renounceExp", label: "Renunciou cidadania para evitar impostos?" },
  { id: "attWoReimb", label: "Participou de treinamento sem reembolso?" },
];

export const securitySection: FormSection = {
  id: "security",
  label: "Segurança e Antecedentes",
  fields: [
    {
      id: "_securityIntro",
      type: "orientation",
      text:
        "Forneça respostas completas e honestas. Respostas vagas ou omissões podem causar atraso no processamento ou negativa do visto. O oficial consular tem acesso ao histórico.",
    },
    ...buildQuestions(QUESTIONS),
  ],
};
