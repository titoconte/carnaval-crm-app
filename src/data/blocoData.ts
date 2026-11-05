/**
 * Modelo de dados atualizado do Bloco Bicharada para o Carnaval 2027.
 * Suporta o novo ecossistema vintage: Rifa 100% online, Kanban do Desfile,
 * Elenco estruturado por grandes naipes e mural de recados/tarefas estilo cortiça.
 */

export interface Integrante {
  id: string;
  nome: string;
  grandeGrupo: 'Bateria' | 'Sopros' | 'Vozes' | 'Outros Instrumentos' | 'Brincantes & Dança' | 'Organização & Apoio';
  instrumentoOuFuncao: string; // Ex: Caixas, Surdos, Trompete, Pernalta, Harmonia, Produção
  observacao?: string;
  ativo: boolean;
}

export interface TarefaPostIt {
  id: string;
  titulo: string;
  descricao: string;
  categoria: 'Apoio' | 'Logística' | 'Produção' | 'Música' | 'Comunicação' | 'Fantasias';
  responsavel: string; // Se vazio ("") ou "A Definir", é Tarefa Órfã
  corPostIt: 'amarelo' | 'rosa' | 'verde' | 'azul';
  urgente: boolean;
  concluida: boolean;
}

export interface BilheteRifa {
  numero: number; // 1 a 500
  status: 'Disponível' | 'Reservado' | 'Pago';
  compradorNome?: string;
  compradorWhats?: string;
  dataReserva?: string;
}

export interface MacrotarefaDesfile {
  id: string;
  titulo: string;
  coluna: 'A Fazer' | 'No Dia do Desfile' | 'Concluído na Avenida';
  responsavelPrincipal: string;
  descricao?: string;
  checklists: {
    id: string;
    texto: string;
    concluido: boolean;
  }[];
}

export interface MovimentoBar {
  id: string;
  data: string;
  descricao: string;
  tipo: 'Entrada' | 'Saída';
  categoria: 'Venda de Cerveja / Bebidas' | 'Compra no Atacado (Fort)' | 'Isopor da Peixaria' | 'Gelo' | 'Outros';
  valor: number;
  responsavel: string;
}

export interface EnqueteWhatsApp {
  id: string;
  titulo: string;
  dataEncerramento: string;
  totalVotos: number;
  pergunta: string;
  opcoes: {
    rotulo: string;
    votos: number;
    percentual: number;
  }[];
  resolucaoOficial?: string;
}

export interface MusicaRepertorio {
  id: string;
  titulo: string;
  artistaOriginal: string;
  ritmo: string;
  ordemDesfile: number;
  votosFavoraveis: number;
  statusCuradoria: 'Confirmada' | 'Em Votação' | 'Sugerida para Corte';
  audioGuiaUrl?: string;
  letra?: string;
}

export interface ItemLetraCifra {
  id: string;
  titulo: string;
  tipo: 'Letra' | 'Cifra' | 'Partitura';
  autorUpload: string;
  dataUpload: string;
  conteudoTexto?: string;
  arquivoNome?: string;
}

export interface EventoCalendario {
  id: string;
  data: string;
  diaSemana: string;
  tipo: 'Ensaio' | 'Reunião presencial' | 'Oficina de Fantasias' | 'Desfile Oficial';
  local: string;
  horario: string;
  observacoes?: string;
}

/**
 * Elenco oficial reorganizado pelos Grandes Naipes.
 */
export const INTEGRANTES_INICIAIS: Integrante[] = [
  // 1. BATERIA
  { id: 'bat-1', nome: 'André Luis', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Caixa', ativo: true },
  { id: 'bat-2', nome: 'Gabriel', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Caixa', ativo: true },
  { id: 'bat-3', nome: 'Jeff', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Caixa', ativo: true },
  { id: 'bat-4', nome: 'Gabriel Bio', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Caixa / Xequerê', ativo: true },
  { id: 'bat-5', nome: 'Júlia', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Caixa', ativo: true },
  { id: 'bat-6', nome: 'Igor G.', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Caixa', ativo: true },
  { id: 'bat-7', nome: 'Nathy R.', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Repinique', ativo: true },
  { id: 'bat-8', nome: 'Rafa', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Repinique', ativo: true },
  { id: 'bat-9', nome: 'Mari', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Repinique', ativo: true },
  { id: 'bat-10', nome: 'Shei', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Surdo', ativo: true },
  { id: 'bat-11', nome: 'Regina', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Surdo', ativo: true },
  { id: 'bat-12', nome: 'Moscão', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Surdo', ativo: true },
  { id: 'bat-13', nome: 'Gui', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Surdo', ativo: true },
  { id: 'bat-14', nome: 'Fer do Surdo', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Surdo', ativo: true },
  { id: 'bat-15', nome: 'Guigo', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Xequerê', ativo: true },
  { id: 'bat-16', nome: 'Merlim', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Xequerê', ativo: true },
  { id: 'bat-17', nome: 'Dani', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Xequerê', ativo: true },
  { id: 'bat-18', nome: 'Diva', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Xequerê', ativo: true },
  { id: 'bat-19', nome: 'Camila', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Xequerê', ativo: true },
  { id: 'bat-20', nome: 'Sara', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Agogô', ativo: true },
  { id: 'bat-21', nome: 'Lívia', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Agogô', ativo: true },
  { id: 'bat-22', nome: 'Silvana', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Agogô', ativo: true },
  { id: 'bat-23', nome: 'Ariadne', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Pandeiro', ativo: true },
  { id: 'bat-24', nome: 'Cleber', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Pandeiro', ativo: true },
  { id: 'bat-25', nome: 'Bibi', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Pandeiro', ativo: true },
  { id: 'bat-26', nome: 'Mari Pelli', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Pandeiro', ativo: true },
  { id: 'bat-27', nome: 'Juliano', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Tamborim', ativo: true },
  { id: 'bat-28', nome: 'Leda', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Tamborim', ativo: true },
  { id: 'bat-29', nome: 'Adriana', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Tamborim', ativo: true },
  { id: 'bat-30', nome: 'Hélio', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Tamborim', ativo: true },
  { id: 'bat-31', nome: 'Luciane', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Tamborim', ativo: true },
  { id: 'bat-32', nome: 'Flor', grandeGrupo: 'Bateria', instrumentoOuFuncao: 'Tamborim', ativo: true },

  // 2. SOPROS
  { id: 'sop-1', nome: 'Claudinha', grandeGrupo: 'Sopros', instrumentoOuFuncao: 'Trompete', ativo: true },
  { id: 'sop-2', nome: 'Carlinhos', grandeGrupo: 'Sopros', instrumentoOuFuncao: 'Trompete', ativo: true },
  { id: 'sop-3', nome: 'Luciano', grandeGrupo: 'Sopros', instrumentoOuFuncao: 'Trompete', ativo: true },
  { id: 'sop-4', nome: 'Zeva', grandeGrupo: 'Sopros', instrumentoOuFuncao: 'Saxofone', ativo: true },
  { id: 'sop-5', nome: 'Pedro', grandeGrupo: 'Sopros', instrumentoOuFuncao: 'Trombone', ativo: true },
  { id: 'sop-6', nome: 'Guilherme', grandeGrupo: 'Sopros', instrumentoOuFuncao: 'Trombone', ativo: true },

  // 3. VOZES
  { id: 'voc-1', nome: 'Patricia Amante', grandeGrupo: 'Vozes', instrumentoOuFuncao: 'Voz Principal', ativo: true },
  { id: 'voc-2', nome: 'Cris Bueno', grandeGrupo: 'Vozes', instrumentoOuFuncao: 'Coro / Vocal', ativo: true },
  { id: 'voc-3', nome: 'Andri', grandeGrupo: 'Vozes', instrumentoOuFuncao: 'Coro / Vocal', ativo: true },

  // 4. OUTROS INSTRUMENTOS / HARMONIA
  { id: 'out-1', nome: 'Vitinho', grandeGrupo: 'Outros Instrumentos', instrumentoOuFuncao: 'Baixo Elétrico & Harmonia', ativo: true },
  { id: 'out-2', nome: 'Léo', grandeGrupo: 'Outros Instrumentos', instrumentoOuFuncao: 'Cavaquinho', ativo: true },
  { id: 'out-3', nome: 'Fael', grandeGrupo: 'Outros Instrumentos', instrumentoOuFuncao: 'Direção Musical & Arranjos', ativo: true },

  // 5. BRINCANTES & DANÇA (Aba à parte)
  { id: 'bri-1', nome: 'Lissa Capeleto', grandeGrupo: 'Brincantes & Dança', instrumentoOuFuncao: 'Estandarte Oficial', ativo: true },
  { id: 'bri-2', nome: 'Barbara Baccin', grandeGrupo: 'Brincantes & Dança', instrumentoOuFuncao: 'Bambolê & Palhaçaria', ativo: true },
  { id: 'bri-3', nome: 'Beatriz Aguiar', grandeGrupo: 'Brincantes & Dança', instrumentoOuFuncao: 'Pernalta', ativo: true },
  { id: 'bri-4', nome: 'Lua', grandeGrupo: 'Brincantes & Dança', instrumentoOuFuncao: 'Pernalta', ativo: true },
  { id: 'bri-5', nome: 'Juliana', grandeGrupo: 'Brincantes & Dança', instrumentoOuFuncao: 'Pernalta', ativo: true },
  { id: 'bri-6', nome: 'Lahana', grandeGrupo: 'Brincantes & Dança', instrumentoOuFuncao: 'Pernalta', ativo: true },
  { id: 'bri-7', nome: 'Will', grandeGrupo: 'Brincantes & Dança', instrumentoOuFuncao: 'Brincante / Performance', ativo: true },
  { id: 'bri-8', nome: 'Dodô', grandeGrupo: 'Brincantes & Dança', instrumentoOuFuncao: 'Brincante / Performance', ativo: true },
  { id: 'bri-9', nome: 'Laura', grandeGrupo: 'Brincantes & Dança', instrumentoOuFuncao: 'Brincante / Performance', ativo: true },
  { id: 'bri-10', nome: 'Marlu', grandeGrupo: 'Brincantes & Dança', instrumentoOuFuncao: 'Brincante / Performance', ativo: true },
  { id: 'dan-1', nome: 'Bel Rodrigues', grandeGrupo: 'Brincantes & Dança', instrumentoOuFuncao: 'Ala de Dança', ativo: true },
  { id: 'dan-2', nome: 'Ju Ben', grandeGrupo: 'Brincantes & Dança', instrumentoOuFuncao: 'Ala de Dança', ativo: true },
  { id: 'dan-3', nome: 'Vini Franke', grandeGrupo: 'Brincantes & Dança', instrumentoOuFuncao: 'Ala de Dança', ativo: true },

  // 6. ORGANIZAÇÃO & APOIO (Aba à parte)
  { id: 'org-1', nome: 'Tito', grandeGrupo: 'Organização & Apoio', instrumentoOuFuncao: 'Coordenação Geral, Jurídico & Apoio', ativo: true },
  { id: 'org-2', nome: 'Nathy R.', grandeGrupo: 'Organização & Apoio', instrumentoOuFuncao: 'Produção Executiva & Espaços', ativo: true },
  { id: 'org-3', nome: 'Laís', grandeGrupo: 'Organização & Apoio', instrumentoOuFuncao: 'Comunicação / Redação e Conceito', ativo: true },
  { id: 'org-4', nome: 'Camela', grandeGrupo: 'Organização & Apoio', instrumentoOuFuncao: 'Agenda de Postagens & Mídias', ativo: true },
  { id: 'org-5', nome: 'Maria Alice', grandeGrupo: 'Organização & Apoio', instrumentoOuFuncao: 'Infraestrutura & Documentos', ativo: true },
  { id: 'apo-1', nome: 'Anabel', grandeGrupo: 'Organização & Apoio', instrumentoOuFuncao: 'Apoio de Rua', ativo: true },
  { id: 'apo-2', nome: 'Rod', grandeGrupo: 'Organização & Apoio', instrumentoOuFuncao: 'Apoio Operacional', ativo: true },
  { id: 'apo-3', nome: 'Diogo', grandeGrupo: 'Organização & Apoio', instrumentoOuFuncao: 'Apoio Operacional', ativo: true }
];

/**
 * Tarefas estilo Quadro de Cortiça e Post-it.
 */
export const TAREFAS_POSTIT_INICIAIS: TarefaPostIt[] = [
  // ÓRFÃS (Sem responsável)
  {
    id: 'post-1',
    titulo: 'Buscar caixas de isopor na peixaria',
    descricao: 'Coletar semanalmente as caixas térmicas descartáveis da peixaria para os ensaios de sexta.',
    categoria: 'Logística',
    responsavel: '', // Órfã!
    corPostIt: 'amarelo',
    urgente: true,
    concluida: false
  },
  {
    id: 'post-2',
    titulo: 'Voluntário para o Caixa do Bar',
    descricao: 'Ajudar Pedro a atender a galera, vender fichas e conferir comprovantes Pix durante o ensaio.',
    categoria: 'Apoio',
    responsavel: '', // Órfã!
    corPostIt: 'rosa',
    urgente: true,
    concluida: false
  },
  {
    id: 'post-3',
    titulo: 'Revezamento do Estandarte Oficial',
    descricao: 'Apoiar Lissa Capeleto na condução e segurança do estandarte durante o cortejo.',
    categoria: 'Produção',
    responsavel: '', // Órfã!
    corPostIt: 'azul',
    urgente: false,
    concluida: false
  },
  {
    id: 'post-4',
    titulo: 'Ala de Corda & Segurança',
    descricao: 'Equipe de 6 pessoas para segurar a corda de proteção ao redor da bateria e da Kombi Cora.',
    categoria: 'Logística',
    responsavel: '', // Órfã!
    corPostIt: 'verde',
    urgente: true,
    concluida: false
  },
  // ATRIBUÍDAS
  {
    id: 'post-5',
    titulo: 'Acordo com Renato Cartola (Kombi Cora)',
    descricao: 'Fechar proposta de R$ 200 para usar a Kombi como suporte de bebidas no cortejo.',
    categoria: 'Logística',
    responsavel: 'Nathy R.',
    corPostIt: 'amarelo',
    urgente: true,
    concluida: false
  },
  {
    id: 'post-6',
    titulo: 'Curadoria dos Sopros & Contra-Canto',
    descricao: 'Gravar guias de contra-canto para os metais e disponibilizar nos subgrupos.',
    categoria: 'Música',
    responsavel: 'Fael',
    corPostIt: 'verde',
    urgente: true,
    concluida: false
  },
  {
    id: 'post-7',
    titulo: 'Viabilidade de CNPJ / Associação',
    descricao: 'Estudo para constituir associação própria com blocos parceiros e evitar Pix em CPF pessoal.',
    categoria: 'Produção',
    responsavel: 'Tito & Elisa',
    corPostIt: 'azul',
    urgente: false,
    concluida: false
  },
  {
    id: 'post-8',
    titulo: 'Organização das Oficinas de Fantasias',
    descricao: 'Agendar datas no ateliê e recolher sobras de tecido e materiais recicláveis.',
    categoria: 'Fantasias',
    responsavel: 'Bel R. & Nathy',
    corPostIt: 'rosa',
    urgente: false,
    concluida: false
  }
];

/**
 * Macrotarefas e Checklists do Desfile (Kanban de Rua).
 */
export const MACROTAREFAS_DESFILE_INICIAIS: MacrotarefaDesfile[] = [
  {
    id: 'macro-1',
    titulo: 'Apoio Móvel: Kombi Cora',
    coluna: 'A Fazer',
    responsavelPrincipal: 'Renato Cartola & Nathy',
    descricao: 'Veículo de suporte de hidratação, open bar e primeiros socorros.',
    checklists: [
      { id: 'c1', texto: 'Acerto de R$ 200 com Renato Cartola', concluido: true },
      { id: 'c2', texto: 'Revisão mecânica básica e estepe', concluido: false },
      { id: 'c3', texto: 'Abastecer com 4 caixas de isopor da peixaria + gelo', concluido: false },
      { id: 'c4', texto: 'Fixar suporte para faixas decorativas e estandarte reserva', concluido: false }
    ]
  },
  {
    id: 'macro-2',
    titulo: 'Concentração na Praça Oliva (14h30)',
    coluna: 'No Dia do Desfile',
    responsavelPrincipal: 'Regina, Tito & Fael',
    descricao: 'Ponto de encontro dos bichos, credenciamento e aquecimento.',
    checklists: [
      { id: 'c5', texto: 'Distribuição dos crachás e pulseiras de identificação', concluido: false },
      { id: 'c6', texto: 'Montagem do Estandarte com Lissa Capeleto', concluido: false },
      { id: 'c7', texto: 'Aquecimento da bateria e afinação dos naipes com Fael', concluido: false },
      { id: 'c8', texto: 'Distribuição das primeiras águas para os músicos', concluido: false }
    ]
  },
  {
    id: 'macro-3',
    titulo: 'Ala de Corda e Isolamento dos Pernaltas',
    coluna: 'No Dia do Desfile',
    responsavelPrincipal: 'Apoio de Rua',
    descricao: 'Proteção do perímetro da bateria e dos artistas com perna de pau.',
    checklists: [
      { id: 'c9', texto: 'Reunião de 5 min com os 6 voluntários da corda', concluido: false },
      { id: 'c10', texto: 'Garantir raio de segurança de 2m para os pernaltas', concluido: false },
      { id: 'c11', texto: 'Manter a Kombi Cora a 3 metros atrás da bateria', concluido: false }
    ]
  },
  {
    id: 'macro-4',
    titulo: 'Dispersão & Limpeza Coletiva',
    coluna: 'Concluído na Avenida',
    responsavelPrincipal: 'Coordenação e Apoio',
    descricao: 'Encerramento seguro do cortejo no centro histórico.',
    checklists: [
      { id: 'c12', texto: 'Guardar instrumentos pesados (surdos e caixas)', concluido: false },
      { id: 'c13', texto: 'Descarte e doação dos isopores para catadores locais', concluido: false },
      { id: 'c14', texto: 'Acerto final de combustível com a Kombi Cora', concluido: false }
    ]
  }
];

/**
 * Movimentos do Bar dos Ensaios (Entradas e Saídas ágeis).
 */
export const MOVIMENTOS_BAR_INICIAIS: MovimentoBar[] = [
  { id: 'mov-1', data: '2026-10-16', descricao: 'Compra de 5 caixas de cerveja (Fort Atacadista)', tipo: 'Saída', categoria: 'Compra no Atacado (Fort)', valor: 240.00, responsavel: 'Pedro' },
  { id: 'mov-2', data: '2026-10-16', descricao: '2 sacos de gelo e isopor da peixaria', tipo: 'Saída', categoria: 'Gelo', valor: 35.00, responsavel: 'Pedro' },
  { id: 'mov-3', data: '2026-10-16', descricao: 'Venda de latinhas no 1º Ensaio', tipo: 'Entrada', categoria: 'Venda de Cerveja / Bebidas', valor: 410.00, responsavel: 'Pedro & Tito' },
  { id: 'mov-4', data: '2026-10-20', descricao: 'Compra de 6 caixas de cerveja e água', tipo: 'Saída', categoria: 'Compra no Atacado (Fort)', valor: 290.00, responsavel: 'Pedro' },
  { id: 'mov-5', data: '2026-10-20', descricao: 'Venda de bebidas no 2º Ensaio', tipo: 'Entrada', categoria: 'Venda de Cerveja / Bebidas', valor: 520.00, responsavel: 'Pedro' }
];

/**
 * Gerador da cartela de 500 bilhetes da Rifa Online (com alguns números já comprados para demonstração).
 */
export function gerarBilhetesRifaIniciais(): BilheteRifa[] {
  const bilhetes: BilheteRifa[] = [];
  for (let i = 1; i <= 500; i++) {
    let status: BilheteRifa['status'] = 'Disponível';
    let compradorNome: string | undefined;
    let compradorWhats: string | undefined;

    // Números já comprados ou reservados de demonstração
    if ([7, 13, 24, 69, 100, 222, 333, 444, 499].includes(i)) {
      status = 'Pago';
      compradorNome = 'Folião Bicharada';
    } else if ([14, 55, 88, 120].includes(i)) {
      status = 'Reservado';
      compradorNome = 'Aguardando Pix';
    }

    bilhetes.push({
      numero: i,
      status,
      compradorNome,
      compradorWhats
    });
  }
  return bilhetes;
}

export const REPERTORIO_INICIAL: MusicaRepertorio[] = [
  { id: 'mus-1', titulo: 'Banho de Folhas', artistaOriginal: 'Luedji Luna', ritmo: 'Afoxé', ordemDesfile: 1, votosFavoraveis: 34, statusCuradoria: 'Confirmada', audioGuiaUrl: 'https://archive.org/download/sample-carnaval/banho_de_folhas_contra_canto.mp3' },
  { id: 'mus-2', titulo: 'Ilê Pérola Negra', artistaOriginal: 'Daniela Mercury', ritmo: 'Axé / Samba-Reggae', ordemDesfile: 2, votosFavoraveis: 29, statusCuradoria: 'Confirmada' },
  { id: 'mus-3', titulo: 'Frevo Mulher', artistaOriginal: 'Zé Ramalho', ritmo: 'Frevo', ordemDesfile: 3, votosFavoraveis: 27, statusCuradoria: 'Confirmada' },
  { id: 'mus-4', titulo: 'Me Abraça', artistaOriginal: 'Banda Eva', ritmo: 'Axé / Samba-Reggae', ordemDesfile: 4, votosFavoraveis: 22, statusCuradoria: 'Em Votação' },
  { id: 'mus-5', titulo: 'Pequena Eva', artistaOriginal: 'Banda Eva', ritmo: 'Axé / Samba-Reggae', ordemDesfile: 5, votosFavoraveis: 19, statusCuradoria: 'Em Votação' },
  { id: 'mus-6', titulo: 'Erva Venenosa', artistaOriginal: 'Rita Lee', ritmo: 'Marchinha', ordemDesfile: 6, votosFavoraveis: 8, statusCuradoria: 'Sugerida para Corte' }
];

export const LETRAS_CIFRAS_INICIAIS: ItemLetraCifra[] = [
  {
    id: 'lc-1',
    titulo: 'Banho de Folhas — Arranjo Sopros & Cifra',
    tipo: 'Cifra',
    autorUpload: 'Fael (Direção Musical)',
    dataUpload: '2026-11-02',
    conteudoTexto: `Tom: Em | Ritmo: Ijexá / Afoxé\n\n[Intro] Em D C B7 (4x)\nSopros entram na 3ª repetição em contra-canto.\n\nEm                   D\nUm banho de folha pra purificar\nC                    B7\nÁgua de cheiro no nosso caminhar\nEm                   D\nBicharada na pista não cansa de amar!`
  },
  {
    id: 'lc-2',
    titulo: 'Frevo Mulher — Convenção dos Metais',
    tipo: 'Partitura',
    autorUpload: 'Vitinho & Pedro',
    dataUpload: '2026-10-28',
    conteudoTexto: `Convenção da bateria após o refrão:\n3 batidas secas de surdo -> repique solo 2 tempos -> entrada de caixa em levada corrida.`
  }
];

export const ENQUETES_WHATSAPP_INICIAIS: EnqueteWhatsApp[] = [
  {
    id: 'enq-1',
    titulo: 'Dias de Ensaio Oficial com Fael',
    dataEncerramento: '2026-10-14',
    totalVotos: 38,
    pergunta: 'Quais dias funcionam melhor para conciliar com Samba Brás e agenda do Fael?',
    opcoes: [
      { rotulo: 'Segundas e Sextas', votos: 26, percentual: 68 },
      { rotulo: 'Terças e Quintas', votos: 8, percentual: 21 },
      { rotulo: 'Apenas aos Sábados', votos: 4, percentual: 11 }
    ],
    resolucaoOficial: 'Decidido: Ensaios confirmados para segundas e sextas-feiras à noite na Costeira.'
  },
  {
    id: 'enq-2',
    titulo: 'Diretriz do Tema de Fantasias 2027',
    dataEncerramento: '2026-10-25',
    totalVotos: 42,
    pergunta: 'Como devemos orientar o conceito das fantasias para democratizar a participação?',
    opcoes: [
      { rotulo: 'Tema Livre / Animais em Extinção & Bicharada Aberta', votos: 31, percentual: 74 },
      { rotulo: 'Tema Rígido Fechado (Ex: Bicharada no Espaço)', votos: 11, percentual: 26 }
    ],
    resolucaoOficial: 'Decidido: Tema amplo e inclusivo com oficinas coletivas de reaproveitamento.'
  },
  {
    id: 'enq-3',
    titulo: 'Modelo de Bebidas dos Ensaios (Isopor vs Cooler)',
    dataEncerramento: '2026-10-31',
    totalVotos: 35,
    pergunta: 'Como gerenciar o gelo e as cervejas para evitar perdas de caixas térmicas pessoais?',
    opcoes: [
      { rotulo: 'Isopor descartável de peixaria (doado após o evento)', votos: 29, percentual: 83 },
      { rotulo: 'Continuar com coolers etiquetados com fita crepe', votos: 6, percentual: 17 }
    ],
    resolucaoOficial: 'Decidido: Adotar caixas de isopor descartáveis da peixaria.'
  }
];

export const CALENDARIO_INICIAL: EventoCalendario[] = [
  { id: 'cal-1', data: '2026-10-16', diaSemana: 'SEX', tipo: 'Ensaio', local: 'Costeira', horario: '19:30', observacoes: 'Ensaio inaugural com 8 pessoas' },
  { id: 'cal-2', data: '2026-10-20', diaSemana: 'TER', tipo: 'Ensaio', local: 'Costeira', horario: '19:30', observacoes: 'Sugestões de temas para o carnaval' },
  { id: 'cal-3', data: '2026-10-30', diaSemana: 'SEX', tipo: 'Reunião presencial', local: 'Centro', horario: '19:00', observacoes: 'Alinhamento geral e divisão de comissões' },
  { id: 'cal-4', data: '2026-11-06', diaSemana: 'SEX', tipo: 'Ensaio', local: 'Odara / Borogodó', horario: '19:30', observacoes: 'Ensaio musical geral com Fael' },
  { id: 'cal-5', data: '2026-11-09', diaSemana: 'SEG', tipo: 'Ensaio', local: 'Costeira', horario: '19:30', observacoes: 'Ensaio de bateria e naipes de sopro' },
  { id: 'cal-6', data: '2026-11-20', diaSemana: 'SEX', tipo: 'Ensaio', local: 'Costeira', horario: '19:30', observacoes: 'Ensaio rítmico' },
  { id: 'cal-7', data: '2026-11-23', diaSemana: 'SEG', tipo: 'Oficina de Fantasias', local: 'Ateliê Coletivo', horario: '19:00', observacoes: 'Oficinas de adereços com Bel R. e Nathy' },
  { id: 'cal-8', data: '2026-12-04', diaSemana: 'SEX', tipo: 'Ensaio', local: 'Costeira', horario: '19:30', observacoes: 'Repertório unificado' },
  { id: 'cal-9', data: '2026-12-18', diaSemana: 'SEX', tipo: 'Ensaio', local: 'Costeira', horario: '19:30', observacoes: 'Último ensaio antes da pausa de fim de ano' },
  { id: 'cal-10', data: '2027-01-04', diaSemana: 'SEG', tipo: 'Ensaio', local: 'Costeira', horario: '19:30', observacoes: 'Retorno intensivo de janeiro' },
  { id: 'cal-11', data: '2027-02-08', diaSemana: 'SEG', tipo: 'Desfile Oficial', local: 'Praça Oliva & Centro Histórico', horario: '14:30', observacoes: '🎊 GRANDE DESFILE DE CARNAVAL DO BLOCO BICHARADA!' }
];
