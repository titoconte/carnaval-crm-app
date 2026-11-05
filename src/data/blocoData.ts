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

export interface InscritoBloco {
  id: string;
  nome: string;
  whatsapp: string;
  grandeGrupo: Integrante['grandeGrupo'];
  instrumentoOuFuncao: string;
  experiencia: string;
  observacao?: string;
  dataInscricao: string;
  status: 'Pendente' | 'Aprovado' | 'Recusado';
}

export interface ItemChecklistTarefa {
  id: string;
  texto: string;
  dataLimite?: string; // Data por tarefa da checklist
  concluido: boolean;
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
  dataFinal?: string; // Data final da tarefa geral
  checklists?: ItemChecklistTarefa[];
}

export interface PremioRifa {
  posicao: number;
  descricao: string;
}

export interface Rifa {
  id: string;
  titulo: string;
  nomeCoordenador: string;
  quantidadeNumeros: number;
  precoNumero: number;
  dataLimite: string; // Formato YYYY-MM-DD
  numeroPremios: number;
  premios: PremioRifa[];
  chavePix?: string;
  telefoneContato?: string;
  dataCriacao: string;
  ativa: boolean;
}

export interface RifaVenda {
  id: string;
  rifaId: string;
  numero: number;
  status: 'Disponível' | 'Reservado' | 'Pago';
  compradorNome?: string;
  compradorWhats?: string;
  dataVenda?: string; // Data ISO da reserva ou venda
  valorPago?: number;
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
  youtubeUrl?: string;
  partituraUrl?: string;
  partituraTexto?: string;
  arquivoRepertorio?: string;
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
 * Calcula o percentual de conclusão dos itens de uma checklist (0 a 100).
 * 
 * @param checklists - Lista de itens da checklist
 * @returns Percentual inteiro de conclusão
 */
export function calcularProgressoChecklist(checklists?: ItemChecklistTarefa[]): number {
  if (!checklists || checklists.length === 0) return 0;
  const concluidos = checklists.filter(c => c.concluido).length;
  return Math.round((concluidos / checklists.length) * 100);
}

/**
 * Converte um post-it do mural em uma macrotarefa do desfile quando a equipe está pronta.
 * 
 * @param tarefa - Tarefa do mural
 * @returns Macrotarefa estruturada para a coluna 'A Fazer' do desfile
 */
export function converterTarefaEmMacrotarefa(tarefa: TarefaPostIt): MacrotarefaDesfile {
  const checks = tarefa.checklists && tarefa.checklists.length > 0
    ? tarefa.checklists.map(c => ({
        id: c.id,
        texto: c.dataLimite ? `${c.texto} (Prazo: ${c.dataLimite})` : c.texto,
        concluido: c.concluido
      }))
    : [
        {
          id: `chk-${Date.now()}`,
          texto: 'Mobilização e execução pela equipe',
          concluido: false
        }
      ];

  return {
    id: `macro-${tarefa.id}`,
    titulo: tarefa.titulo,
    coluna: 'A Fazer',
    responsavelPrincipal: tarefa.responsavel || 'Equipe Voluntária Mobilizada',
    descricao: tarefa.descricao + (tarefa.dataFinal ? ` | Prazo final: ${tarefa.dataFinal}` : ''),
    checklists: checks
  };
}

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
 * Valida se a venda de um bilhete de rifa é permitida de acordo com a data limite.
 * Regra: A venda não pode passar de 1 dia da data limite estabelecida.
 * 
 * @param rifa - Objeto da rifa contendo a dataLimite
 * @param dataTentativa - Data da tentativa de venda (padrão: agora)
 * @returns Objeto informando se é permitida e motivo em caso de recusa
 */
export function validarVendaRifa(
  rifa: Rifa,
  dataTentativa: string | Date = new Date()
): { permitida: boolean; motivo?: string } {
  const dataAtual = typeof dataTentativa === 'string' ? new Date(dataTentativa) : dataTentativa;
  
  // Limite é 1 dia após a data limite especificada (final do dia seguinte)
  const [ano, mes, dia] = rifa.dataLimite.split('-').map(Number);
  const dataLimiteObj = new Date(ano, mes - 1, dia, 23, 59, 59, 999);
  
  // Adiciona exatamente 1 dia completo de tolerância ao limite
  const limiteMaximoVenda = new Date(dataLimiteObj.getTime() + 24 * 60 * 60 * 1000);

  if (dataAtual.getTime() > limiteMaximoVenda.getTime()) {
    return {
      permitida: false,
      motivo: `Venda não permitida: o prazo limite da rifa (${rifa.dataLimite}) foi ultrapassado em mais de 1 dia.`
    };
  }

  return { permitida: true };
}

/**
 * Cria uma nova rifa garantindo a estrutura correta de prêmios e metadados.
 * 
 * @param dados - Parâmetros da nova rifa informados pelo administrador
 * @returns Nova rifa estruturada
 */
export function criarNovaRifa(dados: {
  titulo: string;
  nomeCoordenador: string;
  quantidadeNumeros: number;
  precoNumero: number;
  dataLimite: string;
  premios: PremioRifa[];
  chavePix?: string;
  telefoneContato?: string;
}): Rifa {
  return {
    id: `rifa-${Date.now()}`,
    titulo: dados.titulo.trim(),
    nomeCoordenador: dados.nomeCoordenador.trim(),
    quantidadeNumeros: dados.quantidadeNumeros,
    precoNumero: dados.precoNumero,
    dataLimite: dados.dataLimite,
    numeroPremios: dados.premios.length,
    premios: dados.premios,
    chavePix: dados.chavePix || 'apoio@bicharada.org',
    telefoneContato: dados.telefoneContato || '5548999999999',
    dataCriacao: new Date().toISOString().split('T')[0],
    ativa: true
  };
}

/**
 * Registra a venda/reserva de um bilhete na tabela fato de vendas, validando a data limite.
 * 
 * @param rifa - Rifa em que a venda está ocorrendo
 * @param vendas - Lista atual de vendas (tabela fato)
 * @param numero - Número do bilhete a ser vendido
 * @param comprador - Informações do comprador e data
 * @returns Resultado com sucesso ou recusa e a lista atualizada
 */
export function registrarVendaBilhete(
  rifa: Rifa,
  vendas: RifaVenda[],
  numero: number,
  comprador: {
    compradorNome: string;
    compradorWhats: string;
    dataVenda?: string;
    valorPago?: number;
    status?: 'Reservado' | 'Pago';
  }
): { sucesso: boolean; motivo?: string; vendasAtualizadas: RifaVenda[] } {
  const dataVenda = comprador.dataVenda || new Date().toISOString();
  const validacao = validarVendaRifa(rifa, dataVenda);

  if (!validacao.permitida) {
    return {
      sucesso: false,
      motivo: validacao.motivo,
      vendasAtualizadas: vendas
    };
  }

  const status = comprador.status || 'Reservado';
  let encontrado = false;

  const vendasAtualizadas = vendas.map(v => {
    if (v.rifaId === rifa.id && v.numero === numero) {
      encontrado = true;
      return {
        ...v,
        status,
        compradorNome: comprador.compradorNome.trim(),
        compradorWhats: comprador.compradorWhats.trim(),
        dataVenda,
        valorPago: comprador.valorPago || rifa.precoNumero
      };
    }
    return v;
  });

  if (!encontrado) {
    vendasAtualizadas.push({
      id: `venda-${rifa.id}-${numero}`,
      rifaId: rifa.id,
      numero,
      status,
      compradorNome: comprador.compradorNome.trim(),
      compradorWhats: comprador.compradorWhats.trim(),
      dataVenda,
      valorPago: comprador.valorPago || rifa.precoNumero
    });
  }

  return {
    sucesso: true,
    vendasAtualizadas
  };
}

/**
 * Gera as linhas iniciais da tabela fato de vendas para uma nova rifa.
 * 
 * @param rifa - Rifa para a qual os números serão gerados
 * @returns Lista inicial de vendas para a tabela fato
 */
export function gerarVendasIniciaisParaRifa(rifa: Rifa): RifaVenda[] {
  const vendas: RifaVenda[] = [];
  for (let i = 1; i <= rifa.quantidadeNumeros; i++) {
    vendas.push({
      id: `venda-${rifa.id}-${i}`,
      rifaId: rifa.id,
      numero: i,
      status: 'Disponível'
    });
  }
  return vendas;
}

/**
 * Rifas estruturadas iniciais cadastradas no sistema.
 */
export const RIFAS_INICIAIS: Rifa[] = [
  {
    id: 'rifa-oficial-2027',
    titulo: 'Grande Rifa Carnavalesca Bicharada 2027',
    nomeCoordenador: 'Regina',
    quantidadeNumeros: 500,
    precoNumero: 10.0,
    dataLimite: '2027-02-05',
    numeroPremios: 3,
    premios: [
      { posicao: 1, descricao: 'Cesta Artesanal Carnavalesca + Kit Cervejas Especiais' },
      { posicao: 2, descricao: 'Par de Óculos & Adereço Exclusivo Bicharada' },
      { posicao: 3, descricao: 'Camiseta Oficial 2027 + Copo Tiracolo' }
    ],
    chavePix: 'apoio@bicharada.org',
    telefoneContato: '5548999999999',
    dataCriacao: '2026-10-01',
    ativa: true
  }
];

/**
 * Atualiza o status de aceite/recusa de uma inscrição no bloco.
 * 
 * @param inscritos - Lista atual de inscritos
 * @param id - Identificador do inscrito
 * @param novoStatus - Novo status ('Aprovado' | 'Recusado' | 'Pendente')
 * @returns Lista atualizada com o novo status
 */
export function atualizarStatusInscrito(
  inscritos: InscritoBloco[],
  id: string,
  novoStatus: 'Aprovado' | 'Recusado' | 'Pendente'
): InscritoBloco[] {
  return inscritos.map(i => {
    if (i.id === id) {
      return { ...i, status: novoStatus };
    }
    return i;
  });
}

/**
 * Gera mensagem personalizada e amigável para envio via WhatsApp informando aceite ou recusa.
 * 
 * @param inscrito - Dados do inscrito
 * @param decisao - Decisão tomada pela coordenação ('Aprovado' | 'Recusado')
 * @returns Texto formatado da mensagem para o folião
 */
export function gerarMensagemWhatsappInscricao(
  inscrito: InscritoBloco,
  decisao: 'Aprovado' | 'Recusado'
): string {
  if (decisao === 'Aprovado') {
    return (
      `🎉 *PARABÉNS, ${inscrito.nome}!* 🐾🪽\n\n` +
      `Sua inscrição para o *Bloco Bicharada 2027* foi *APROVADA*!\n\n` +
      `🥁 *Naipe/Setor:* ${inscrito.grandeGrupo} — ${inscrito.instrumentoOuFuncao}\n` +
      `📍 Em breve você será adicionado(a) aos subgrupos oficiais de ensaios e oficinas no WhatsApp.\n\n` +
      `Seja muito bem-vindo(a) à nossa bicharada solta pelos ares! ✨🦁`
    );
  } else {
    return (
      `Olá, *${inscrito.nome}*! 🐾\n\n` +
      `Agradecemos imensamente o seu interesse e carinho em querer sair no *Bloco Bicharada 2027* no naipe *${inscrito.grandeGrupo} (${inscrito.instrumentoOuFuncao})*.\n\n` +
      `No momento nossas vagas para esta função estão preenchidas para mantermos o equilíbrio sonoro do desfile. Guardamos com muito carinho seu contato para futuras vagas de remanejamento e oficinas abertas!\n\n` +
      `Esperamos você cantando e pulando com a gente na avenida! 🪽✨`
    );
  }
}

/**
 * Gera o link universal do WhatsApp (wa.me) higienizando caracteres não numéricos do telefone.
 * 
 * @param inscrito - Dados do inscrito com número de WhatsApp
 * @param decisao - Decisão ('Aprovado' | 'Recusado')
 * @returns URL wa.me com a mensagem pré-formatada
 */
export function gerarLinkWhatsappInscricao(
  inscrito: InscritoBloco,
  decisao: 'Aprovado' | 'Recusado'
): string {
  let fone = inscrito.whatsapp.replace(/\D/g, '');
  if (fone.length === 10 || fone.length === 11) {
    fone = `55${fone}`;
  }
  const texto = encodeURIComponent(gerarMensagemWhatsappInscricao(inscrito, decisao));
  return `https://wa.me/${fone}?text=${texto}`;
}

/**
 * Lista de demonstração inicial de inscrições recebidas pelo edital.
 */
export const INSCRITOS_INICIAIS: InscritoBloco[] = [
  {
    id: 'insc-1',
    nome: 'Carolina Mendez',
    whatsapp: '(48) 99876-5432',
    grandeGrupo: 'Bateria',
    instrumentoOuFuncao: 'Caixa',
    experiencia: 'Já toco o instrumento com facilidade',
    observacao: 'Disponível para todos os ensaios de sexta-feira',
    dataInscricao: '2026-11-02',
    status: 'Pendente'
  },
  {
    id: 'insc-2',
    nome: 'Rodrigo Bastos',
    whatsapp: '(48) 98765-4321',
    grandeGrupo: 'Sopros',
    instrumentoOuFuncao: 'Trombone de Vara',
    experiencia: 'Toco profissionalmente em outros blocos',
    observacao: 'Possuo instrumento próprio',
    dataInscricao: '2026-11-03',
    status: 'Aprovado'
  },
  {
    id: 'insc-3',
    nome: 'Samara Albuquerque',
    whatsapp: '(48) 97654-3210',
    grandeGrupo: 'Brincantes & Dança',
    instrumentoOuFuncao: 'Pernalta',
    experiencia: 'Iniciante com oficinas de circo',
    observacao: 'Preciso de perna de pau emprestada se houver',
    dataInscricao: '2026-11-04',
    status: 'Pendente'
  }
];

/**
 * Tabela fato inicial de vendas de rifas.
 */
export const VENDAS_RIFAS_INICIAIS: RifaVenda[] = (() => {
  const rifa = RIFAS_INICIAIS[0];
  const vendas: RifaVenda[] = [];
  for (let i = 1; i <= rifa.quantidadeNumeros; i++) {
    let status: RifaVenda['status'] = 'Disponível';
    let compradorNome: string | undefined;
    let compradorWhats: string | undefined;
    let dataVenda: string | undefined;
    let valorPago: number | undefined;

    if ([7, 13, 24, 69, 100, 222, 333, 444, 499].includes(i)) {
      status = 'Pago';
      compradorNome = 'Folião Bicharada';
      dataVenda = '2026-10-15';
      valorPago = rifa.precoNumero;
    } else if ([14, 55, 88, 120].includes(i)) {
      status = 'Reservado';
      compradorNome = 'Aguardando Pix';
      dataVenda = '2026-10-20';
    }

    vendas.push({
      id: `venda-${rifa.id}-${i}`,
      rifaId: rifa.id,
      numero: i,
      status,
      compradorNome,
      compradorWhats,
      dataVenda,
      valorPago
    });
  }
  return vendas;
})();

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

/**
 * Reordena a sequência de músicas do repertório do desfile.
 * Regra: Apenas coordenadores (isAdmin = true) têm autorização para editar a ordem.
 * 
 * @param musicas - Lista de músicas atual
 * @param fromIndex - Posição de origem
 * @param toIndex - Posição de destino
 * @param isAdmin - Flag indicando se é usuário da coordenação
 * @returns Lista de músicas com ordem recalculada se admin, ou lista original inalterada
 */
export function reordenarRepertorio(
  musicas: MusicaRepertorio[],
  fromIndex: number,
  toIndex: number,
  isAdmin: boolean
): MusicaRepertorio[] {
  if (!isAdmin) {
    return musicas;
  }
  if (fromIndex < 0 || fromIndex >= musicas.length || toIndex < 0 || toIndex >= musicas.length) {
    return musicas;
  }
  const reordenadas = [...musicas];
  const [removido] = reordenadas.splice(fromIndex, 1);
  reordenadas.splice(toIndex, 0, removido);

  return reordenadas.map((m, idx) => ({
    ...m,
    ordemDesfile: idx + 1
  }));
}

/**
 * Cria uma nova sugestão de música com suporte a link do YouTube e arquivo de repertório/partitura.
 * 
 * @param dados - Metadados da sugestão
 * @returns Novo objeto MusicaRepertorio
 */
export function criarSugestaoMusica(dados: {
  titulo: string;
  artistaOriginal: string;
  ritmo: string;
  youtubeUrl?: string;
  partituraUrl?: string;
  partituraTexto?: string;
  arquivoRepertorio?: string;
  ordemDesfile?: number;
}): MusicaRepertorio {
  return {
    id: `mus-${Date.now()}`,
    titulo: dados.titulo.trim(),
    artistaOriginal: dados.artistaOriginal.trim() || 'Compositor a confirmar',
    ritmo: dados.ritmo || 'Axé / Samba-Reggae',
    ordemDesfile: dados.ordemDesfile || 99,
    votosFavoraveis: 1,
    statusCuradoria: 'Em Votação',
    youtubeUrl: dados.youtubeUrl?.trim() || undefined,
    partituraUrl: dados.partituraUrl?.trim() || undefined,
    partituraTexto: dados.partituraTexto?.trim() || undefined,
    arquivoRepertorio: dados.arquivoRepertorio?.trim() || undefined
  };
}

export const REPERTORIO_INICIAL: MusicaRepertorio[] = [
  {
    id: 'mus-1',
    titulo: 'Banho de Folhas',
    artistaOriginal: 'Luedji Luna',
    ritmo: 'Afoxé',
    ordemDesfile: 1,
    votosFavoraveis: 34,
    statusCuradoria: 'Confirmada',
    audioGuiaUrl: 'https://archive.org/download/sample-carnaval/banho_de_folhas_contra_canto.mp3',
    youtubeUrl: 'https://www.youtube.com/watch?v=1F_cZf9Ww_o',
    partituraUrl: 'https://archive.org/details/banho_de_folhas_partitura',
    partituraTexto: 'Tom: Em | Sopros em contra-canto no compasso 8. Convenção da percussão: 4 toques secos.'
  },
  {
    id: 'mus-2',
    titulo: 'Ilê Pérola Negra',
    artistaOriginal: 'Daniela Mercury',
    ritmo: 'Axé / Samba-Reggae',
    ordemDesfile: 2,
    votosFavoraveis: 29,
    statusCuradoria: 'Confirmada',
    youtubeUrl: 'https://www.youtube.com/watch?v=F3P_7c1A9d0',
    partituraUrl: 'https://archive.org/details/ile_perola_negra_partitura',
    partituraTexto: 'Arranjo de Metais: Trompetes puxam o refrão. Cavaquinho e baixo em contratempo.'
  },
  {
    id: 'mus-3',
    titulo: 'Frevo Mulher',
    artistaOriginal: 'Zé Ramalho',
    ritmo: 'Frevo',
    ordemDesfile: 3,
    votosFavoraveis: 27,
    statusCuradoria: 'Confirmada',
    youtubeUrl: 'https://www.youtube.com/watch?v=gT8T5aF_b9E',
    partituraUrl: 'https://archive.org/details/frevo_mulher_partitura',
    partituraTexto: 'Convenção da bateria após o refrão: 3 batidas secas de surdo -> repique solo 2 tempos -> caixa.'
  },
  {
    id: 'mus-4',
    titulo: 'Me Abraça',
    artistaOriginal: 'Banda Eva',
    ritmo: 'Axé / Samba-Reggae',
    ordemDesfile: 4,
    votosFavoraveis: 22,
    statusCuradoria: 'Em Votação',
    youtubeUrl: 'https://www.youtube.com/watch?v=7uK4p7yWkXo'
  },
  {
    id: 'mus-5',
    titulo: 'Pequena Eva',
    artistaOriginal: 'Banda Eva',
    ritmo: 'Axé / Samba-Reggae',
    ordemDesfile: 5,
    votosFavoraveis: 19,
    statusCuradoria: 'Em Votação',
    youtubeUrl: 'https://www.youtube.com/watch?v=aG0jC_0V9gE'
  },
  {
    id: 'mus-6',
    titulo: 'Erva Venenosa',
    artistaOriginal: 'Rita Lee',
    ritmo: 'Marchinha',
    ordemDesfile: 6,
    votosFavoraveis: 8,
    statusCuradoria: 'Sugerida para Corte',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }
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
