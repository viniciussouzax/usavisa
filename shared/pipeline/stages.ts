// Fonte canônica do pipeline Sends160.
// Landing page, dashboard e actors importam daqui.
// Nenhum outro arquivo deve definir etapas, sub-etapas ou tarefas.

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export const STATUS_HUMANO = ["Pendente", "Executando", "Concluído"] as const;
export const STATUS_AUTOMACAO = ["Pendente", "Executando", "Concluído", "Erro", "Falha", "Espera"] as const;
export const STATUS_ENTREVISTA = ["Pendente", "Realizada"] as const;
export const STATUS_RESULTADO = ["Aprovado", "Negado", "Nova Entrevista", "Docs Complementares", "Processo Administrativo"] as const;

export const STATUS_POR_ETAPA = {
  Triagem: STATUS_HUMANO,
  Análise: STATUS_HUMANO,
  Automação: STATUS_AUTOMACAO,
  Entrevista: STATUS_ENTREVISTA,
  Resultado: STATUS_RESULTADO,
  Arquivado: [],
} as const;

export type Etapa = keyof typeof STATUS_POR_ETAPA;
export type StatusDeEtapa<E extends Etapa> = (typeof STATUS_POR_ETAPA)[E][number];

export const ETAPAS = Object.keys(STATUS_POR_ETAPA) as Etapa[];

// ---------------------------------------------------------------------------
// Tarefas dentro de cada sub-etapa de Automação
// ---------------------------------------------------------------------------

export type Tarefa = {
  id: string;
  titulo: string;
  descricao: string;
};

export type SubEtapa = {
  slug: string;
  letra: string;
  titulo: string;
  descricao: string;
  tarefas: Tarefa[];
};

export const SUB_ETAPAS: SubEtapa[] = [
  {
    slug: "ds160",
    letra: "A",
    titulo: "DS-160 (CEAC)",
    descricao: "Preenchimento completo do formulário oficial e geração das confirmações.",
    tarefas: [
      { id: "ds160.01_apply", titulo: "Acessa CEAC e resolve captcha", descricao: "Abre sessão, resolve captcha e inicia nova solicitação." },
      { id: "ds160.03_security_question", titulo: "Cria Application ID", descricao: "Gera o identificador oficial e salva no caso." },
      { id: "ds160.04_personal1", titulo: "Informações Pessoais 1", descricao: "Nome, sexo, estado civil, nascimento." },
      { id: "ds160.05_personal2", titulo: "Informações Pessoais 2", descricao: "Nacionalidade, documentos, residência permanente." },
      { id: "ds160.06_travel", titulo: "Informações da Viagem", descricao: "Propósito, datas, endereço nos EUA, pagante." },
      { id: "ds160.07_travel_companions", titulo: "Acompanhantes de Viagem", descricao: "Companheiros de viagem e grupo." },
      { id: "ds160.08_previous_us_travel", titulo: "Viagens Anteriores aos EUA", descricao: "Histórico de viagens, vistos anteriores, recusas." },
      { id: "ds160.09_address_and_phone", titulo: "Endereço e Telefone", descricao: "Endereço residencial, telefones, e-mail, redes sociais." },
      { id: "ds160.10_passport", titulo: "Passaporte", descricao: "Dados do passaporte e extraviados." },
      { id: "ds160.11_us_contact", titulo: "Contato nos EUA", descricao: "Ponto de contato nos Estados Unidos." },
      { id: "ds160.12_family1", titulo: "Família (Pais e Parentes)", descricao: "Informações de pai, mãe e parentes nos EUA." },
      { id: "ds160.13_family2_spouse", titulo: "Cônjuge", descricao: "Dados do cônjuge atual." },
      { id: "ds160.16_work_education1", titulo: "Trabalho e Educação (Atual)", descricao: "Ocupação e empregador atual." },
      { id: "ds160.17_work_education2", titulo: "Trabalho e Educação (Anterior)", descricao: "Empregos e educação anteriores." },
      { id: "ds160.18_work_education3", titulo: "Trabalho e Educação (Adicional)", descricao: "Idiomas, viagens, serviço militar." },
      { id: "ds160.19_security", titulo: "Segurança e Antecedentes", descricao: "Perguntas obrigatórias de segurança (5 partes)." },
      { id: "ds160.23_photo", titulo: "Upload da Foto", descricao: "Valida e envia a foto pelo sistema oficial." },
      { id: "ds160.24_review", titulo: "Revisão dos Dados", descricao: "Verifica coerência antes da confirmação final." },
      { id: "ds160.25_sign_and_submit", titulo: "Assinatura e Envio", descricao: "Submete o DS-160 e encerra a solicitação." },
      { id: "ds160.confirmation", titulo: "Confirmation Page e PDFs", descricao: "Captura confirmação, gera PDFs de arquivo." },
      { id: "ds160.email", titulo: "Envia documentos por e-mail", descricao: "Dispara e-mail com documentos e instruções." },
    ],
  },
  {
    slug: "cadastro-taxa",
    letra: "B",
    titulo: "Cadastro e Taxa (AIS)",
    descricao: "Cadastro do solicitante no AIS e emissão da taxa consular.",
    tarefas: [
      { id: "cadastro-taxa.acessa-ais", titulo: "Acessa o sistema oficial AIS", descricao: "Abre sessão autenticada no Applicant Information System." },
      { id: "cadastro-taxa.cria-perfil", titulo: "Cria o perfil do solicitante", descricao: "Cadastra o solicitante no AIS usando os dados validados." },
      { id: "cadastro-taxa.confirma-email", titulo: "Confirma cadastro por e-mail", descricao: "Ativa a conta clicando no link de confirmação enviado pelo AIS." },
      { id: "cadastro-taxa.vincula-dependentes", titulo: "Vincula solicitantes ao perfil", descricao: "Agrupa familiares ou dependentes no mesmo processo." },
      { id: "cadastro-taxa.emite-boleto", titulo: "Emite o boleto da taxa MRV", descricao: "Gera o documento de cobrança da taxa consular no valor oficial." },
      { id: "cadastro-taxa.envia-boleto", titulo: "Envia boleto por e-mail", descricao: "Encaminha o boleto com instruções de pagamento e prazo." },
    ],
  },
  {
    slug: "monitoramento",
    letra: "C",
    titulo: "Monitoramento",
    descricao: "Acompanha pagamento e disponibilidade de vagas no consulado.",
    tarefas: [
      { id: "monitoramento.aguarda-pagamento", titulo: "Aguarda confirmação do pagamento", descricao: "Consulta periodicamente o status do boleto até ser compensado." },
      { id: "monitoramento.monitora-calendario", titulo: "Monitora calendário para agendamento", descricao: "Verifica continuamente vagas liberadas no consulado selecionado." },
    ],
  },
  {
    slug: "agendamento",
    letra: "D",
    titulo: "Agendamento",
    descricao: "Marca o CASV, a entrevista e organiza retirada do passaporte.",
    tarefas: [
      { id: "agendamento.agenda-casv", titulo: "Agenda o CASV", descricao: "Marca a coleta biométrica no centro de atendimento mais próximo." },
      { id: "agendamento.agenda-entrevista", titulo: "Agenda a entrevista consular", descricao: "Marca a entrevista na data disponível escolhida." },
      { id: "agendamento.comprovante-pagamento", titulo: "Baixa comprovante de pagamento", descricao: "Salva o comprovante oficial do pagamento da taxa MRV." },
      { id: "agendamento.comprovante-agendamento", titulo: "Baixa comprovante de agendamento", descricao: "Guarda documentos necessários para CASV e entrevista." },
      { id: "agendamento.local-retirada", titulo: "Define local de retirada do passaporte", descricao: "Configura o ponto de retirada ou endereço de entrega." },
      { id: "agendamento.metodo-entrega", titulo: "Seleciona método de entrega", descricao: "Escolhe a forma de entrega conforme opções do consulado." },
    ],
  },
  {
    slug: "status-check",
    letra: "E",
    titulo: "Status do Visto (CEAC)",
    descricao: "Consulta e atualização contínua do status oficial após a entrevista.",
    tarefas: [
      { id: "status-check.acessa-ceac", titulo: "Acessa o sistema de consulta CEAC", descricao: "Abre sessão autenticada no portal oficial de consulta." },
      { id: "status-check.consulta-status", titulo: "Consulta andamento do processo", descricao: "Verifica o status em intervalos regulares até o desfecho final." },
      { id: "status-check.identifica-resultado", titulo: "Identifica e atualiza status oficial", descricao: "Application Received, Ready, Administrative Processing, Issued, Refused." },
    ],
  },
  {
    slug: "entrevista",
    letra: "F",
    titulo: "Entrevista",
    descricao: "Solicitante comparece à entrevista consular e aguarda resultado.",
    tarefas: [
      { id: "entrevista.comparece", titulo: "Solicitante comparece à entrevista", descricao: "Apresenta documentos e realiza a entrevista no consulado." },
      { id: "entrevista.monitora-resultado", titulo: "Sistema monitora resultado via CEAC", descricao: "Consulta automática até que o status oficial mude." },
    ],
  },
  {
    slug: "resultado",
    letra: "G",
    titulo: "Resultado",
    descricao: "Desfecho oficial do processo de visto.",
    tarefas: [
      { id: "resultado.identifica", titulo: "Identifica resultado oficial", descricao: "Aprovado / Negado / Processo Administrativo / Docs Complementares / Nova Entrevista." },
      { id: "resultado.notifica", titulo: "Notifica assessor e solicitante", descricao: "Dispara comunicação com o resultado e próximos passos." },
      { id: "resultado.arquiva", titulo: "Arquiva o processo", descricao: "Move o caso para o histórico com todos os documentos e evidências." },
    ],
  },
];

// ---------------------------------------------------------------------------
// Etapas pós-automação (Entrevista + Resultado) — sem sub-tarefas automáticas
// ---------------------------------------------------------------------------

export type EtapaResultado = {
  status: string;
  descricao: string;
  proximo: string;
};

export const RESULTADOS: EtapaResultado[] = [
  { status: "Aprovado", descricao: "Visto aprovado — passaporte enviado com o visto", proximo: "Arquivar processo" },
  { status: "Negado", descricao: "Visto negado — motivo informado pelo consulado", proximo: "Arquivar ou novo processo" },
  { status: "Nova Entrevista", descricao: "Necessário reagendar", proximo: "Retornar para Agendamento" },
  { status: "Docs Complementares", descricao: "Documentos adicionais solicitados", proximo: "Enviar e acompanhar" },
  { status: "Processo Administrativo", descricao: "Em análise (pode levar semanas)", proximo: "Aguardar consulado" },
];
