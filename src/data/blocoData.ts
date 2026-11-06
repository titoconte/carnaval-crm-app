/**
 * Modelo de dados atualizado do Bloco Bicharada para o Carnaval 2027.
 * Suporta o novo ecossistema vintage: Rifa 100% online, Kanban do Desfile,
 * Elenco estruturado por grandes naipes e mural de recados/tarefas estilo cortiça.
 */

export type GrandeGrupoElenco =
  | 'Bateria'
  | 'Sopros'
  | 'Vozes'
  | 'Outros Instrumentos'
  | 'Brincantes & Dança'
  | 'Carro Alegórico'
  | 'Organização & Apoio';

export type SetorElenco = 'Música' | 'Performance' | 'Organização';

export interface Integrante {
  id: string;
  nome: string;
  grandeGrupo: GrandeGrupoElenco;
  instrumentoOuFuncao: string; // Ex: Caixas, Surdos, Trompete, Pernalta, Harmonia, Produção, Carro Alegórico
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
  responsavel?: string; // Responsavel especifico pelo item da checklist
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
    responsavel?: string;
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

export const MACROCATEGORIAS_ELENCO: Integrante['grandeGrupo'][] = [
  'Bateria',
  'Sopros',
  'Vozes',
  'Outros Instrumentos',
  'Brincantes & Dança',
  'Carro Alegórico',
  'Organização & Apoio'
];

export const SETORES_ELENCO: { id: SetorElenco; rotulo: string; descricao: string; emoji: string }[] = [
  { id: 'Música', rotulo: 'Música', descricao: 'Bateria, Sopros, Vozes e Instrumentos de Harmonia', emoji: '🎺' },
  { id: 'Performance', rotulo: 'Performance', descricao: 'Brincantes, Pernaltas, Dança e Carro Alegórico', emoji: '🎭' },
  { id: 'Organização', rotulo: 'Organização', descricao: 'Coordenação Geral, Produção, Apoio e Logística', emoji: '📋' }
];

export const CATEGORIAS_POR_SETOR: Record<SetorElenco, Integrante['grandeGrupo'][]> = {
  'Música': ['Bateria', 'Sopros', 'Vozes', 'Outros Instrumentos'],
  'Performance': ['Brincantes & Dança', 'Carro Alegórico'],
  'Organização': ['Organização & Apoio']
};

export interface ColunaMacrocategoria {
  categoria: Integrante['grandeGrupo'];
  total: number;
  instrumentos: Record<string, Integrante[]>;
}

/**
 * Retorna o setor correspondente a uma macrocategoria do elenco.
 * 
 * @param grupo - Macrocategoria do integrante
 * @returns SetorElenco ('Música' | 'Performance' | 'Organização')
 */
export function obterSetorDoGrupo(grupo: Integrante['grandeGrupo']): SetorElenco {
  if (['Bateria', 'Sopros', 'Vozes', 'Outros Instrumentos'].includes(grupo)) {
    return 'Música';
  }
  if (['Brincantes & Dança', 'Carro Alegórico'].includes(grupo)) {
    return 'Performance';
  }
  return 'Organização';
}

/**
 * Agrupa os integrantes do elenco por macrocategoria (colunas) e subdivide por instrumentos/funções (linhas).
 * 
 * @param integrantes - Lista completa de integrantes
 * @returns Mapeamento estruturado por macrocategoria
 */
export function agruparElencoPorMacrocategoria(
  integrantes: Integrante[]
): Record<Integrante['grandeGrupo'], ColunaMacrocategoria> {
  const resultado: Record<Integrante['grandeGrupo'], ColunaMacrocategoria> = {
    'Bateria': { categoria: 'Bateria', total: 0, instrumentos: {} },
    'Sopros': { categoria: 'Sopros', total: 0, instrumentos: {} },
    'Vozes': { categoria: 'Vozes', total: 0, instrumentos: {} },
    'Outros Instrumentos': { categoria: 'Outros Instrumentos', total: 0, instrumentos: {} },
    'Brincantes & Dança': { categoria: 'Brincantes & Dança', total: 0, instrumentos: {} },
    'Carro Alegórico': { categoria: 'Carro Alegórico', total: 0, instrumentos: {} },
    'Organização & Apoio': { categoria: 'Organização & Apoio', total: 0, instrumentos: {} }
  };

  for (const integrante of integrantes) {
    const grupo = resultado[integrante.grandeGrupo];
    if (grupo) {
      grupo.total += 1;
      const inst = integrante.instrumentoOuFuncao || 'Geral';
      if (!grupo.instrumentos[inst]) {
        grupo.instrumentos[inst] = [];
      }
      grupo.instrumentos[inst].push(integrante);
    }
  }

  return resultado;
}

/**
 * Retorna as colunas de macrocategorias pertencentes a um setor específico do elenco.
 * 
 * @param integrantes - Lista de integrantes
 * @param setor - Setor desejado ('Música', 'Performance' ou 'Organização')
 * @returns Lista de dados agrupados para as macrocategorias do setor informado
 */
export function obterColunasPorSetor(
  integrantes: Integrante[],
  setor: SetorElenco
): ColunaMacrocategoria[] {
  const agrupado = agruparElencoPorMacrocategoria(integrantes);
  const categorias = CATEGORIAS_POR_SETOR[setor] || [];
  return categorias.map(cat => agrupado[cat]);
}

/**
 * Elenco oficial reorganizado pelos Grandes Naipes.
 */
export const INTEGRANTES_INICIAIS: Integrante[] = [];

/**
 * Tarefas estilo Quadro de Cortiça e Post-it.
 */
export const TAREFAS_POSTIT_INICIAIS: TarefaPostIt[] = [];

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
 * Formata uma data no formato ISO (YYYY-MM-DD) para o formato brasileiro legível (DD/MM/AAAA).
 * 
 * @param dataIso - String da data no formato YYYY-MM-DD
 * @returns Data formatada como DD/MM/AAAA ou string original se não puder ser convertida
 */
export function formatarDataBrasileira(dataIso?: string): string {
  if (!dataIso) return '';
  const partes = dataIso.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataIso;
}

/**
 * Ordena tarefas colocando as marcadas como urgente no topo e, em seguida, por data final mais próxima.
 * Tarefas com data definida vêm antes de tarefas sem data dentro de cada nível de urgência.
 * 
 * @param tarefas - Lista de tarefas a serem ordenadas
 * @returns Nova lista com tarefas ordenadas por urgência e depois cronologicamente por datas
 */
export function ordenarTarefasPorUrgencia(tarefas: TarefaPostIt[]): TarefaPostIt[] {
  return [...tarefas].sort((a, b) => {
    // 1º Critério: Urgência (urgente = true antes de urgente = false)
    if (a.urgente && !b.urgente) return -1;
    if (!a.urgente && b.urgente) return 1;

    // 2º Critério: Ordenação cronológica por data limite (mais cedo primeiro)
    const dataA = a.dataFinal?.trim();
    const dataB = b.dataFinal?.trim();

    if (dataA && dataB) {
      const cmp = dataA.localeCompare(dataB);
      if (cmp !== 0) return cmp;
    } else if (dataA && !dataB) {
      return -1; // Tarefas com data vêm antes de tarefas sem data
    } else if (!dataA && dataB) {
      return 1;
    }

    return 0;
  });
}

/**
 * Valida se uma tarefa possui um responsável definido para permitir acionar 'Equipe Pronta'.
 * 
 * @param tarefa - Tarefa a ser validada
 * @returns True se possuir dono atribuído e válido, False caso contrário
 */
export function podeAcionarEquipePronta(tarefa: TarefaPostIt): boolean {
  if (!tarefa.responsavel) return false;
  const resp = tarefa.responsavel.trim().toLowerCase();
  if (resp === '' || resp === 'a definir' || resp === 'órfã' || resp === 'orfa' || resp === 'sem dono') {
    return false;
  }
  return true;
}

/**
 * Converte um post-it do mural em uma macrotarefa do desfile quando a equipe está pronta.
 * 
 * @param tarefa - Tarefa do mural
 * @returns Macrotarefa estruturada para a coluna 'A Fazer' do desfile
 */
/**
 * Retorna o responsavel de um item de checklist.
 * Se o item nao tiver responsavel proprio definido, herda o responsavel da tarefa pai.
 * 
 * @param itemResponsavel - Responsavel especifico do item
 * @param tarefaResponsavel - Responsavel geral da tarefa
 * @returns Responsavel aplicavel ao item
 */
export function obterResponsavelItemChecklist(
  itemResponsavel?: string,
  tarefaResponsavel?: string
): string {
  if (itemResponsavel && itemResponsavel.trim().length > 0) {
    return itemResponsavel.trim();
  }
  if (tarefaResponsavel && tarefaResponsavel.trim().length > 0) {
    return tarefaResponsavel.trim();
  }
  return '';
}

export function converterTarefaEmMacrotarefa(tarefa: TarefaPostIt): MacrotarefaDesfile {
  const responsavelPrincipal = tarefa.responsavel?.trim() || 'Equipe Voluntária Mobilizada';

  const checks = tarefa.checklists && tarefa.checklists.length > 0
    ? tarefa.checklists.map(c => ({
        id: c.id,
        texto: c.dataLimite ? `${c.texto} (Prazo: ${c.dataLimite})` : c.texto,
        concluido: c.concluido,
        responsavel: obterResponsavelItemChecklist(c.responsavel, responsavelPrincipal)
      }))
    : [
        {
          id: `chk-${Date.now()}`,
          texto: 'Mobilização e execução pela equipe',
          concluido: false,
          responsavel: responsavelPrincipal
        }
      ];

  return {
    id: `macro-${tarefa.id}`,
    titulo: tarefa.titulo,
    coluna: 'A Fazer',
    responsavelPrincipal,
    descricao: tarefa.descricao + (tarefa.dataFinal ? ` | Prazo final: ${tarefa.dataFinal}` : ''),
    checklists: checks
  };
}

/**
 * Macrotarefas e Checklists do Desfile (Kanban de Rua).
 */
export const MACROTAREFAS_DESFILE_INICIAIS: MacrotarefaDesfile[] = [];

/**
 * Movimentos do Bar dos Ensaios (Entradas e Saídas ágeis).
 */
export const MOVIMENTOS_BAR_INICIAIS: MovimentoBar[] = [];

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
export const RIFAS_INICIAIS: Rifa[] = [];

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
 * Lista inicial de inscrições recebidas pelo edital.
 */
export const INSCRITOS_INICIAIS: InscritoBloco[] = [];

/**
 * Tabela fato inicial de vendas de rifas.
 */
export const VENDAS_RIFAS_INICIAIS: RifaVenda[] = [];

/**
 * Gerador da cartela de 500 bilhetes da Rifa Online.
 */
export function gerarBilhetesRifaIniciais(): BilheteRifa[] {
  const bilhetes: BilheteRifa[] = [];
  for (let i = 1; i <= 500; i++) {
    bilhetes.push({
      numero: i,
      status: 'Disponível'
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

/**
 * Filtra e seleciona as músicas para compor o caderno de partituras/letras para download.
 * 
 * @param musicas - Lista completa de músicas
 * @param modo - Modo de seleção ('todas' | 'confirmadas' | 'selecionadas')
 * @param selecionadasIds - Array opcional de IDs quando em modo 'selecionadas'
 * @returns Lista filtrada de músicas
 */
export function obterMusicasParaDownload(
  musicas: MusicaRepertorio[],
  modo: 'todas' | 'confirmadas' | 'selecionadas',
  selecionadasIds?: string[]
): MusicaRepertorio[] {
  if (modo === 'confirmadas') {
    return musicas.filter(m => m.statusCuradoria === 'Confirmada');
  }
  if (modo === 'selecionadas' && selecionadasIds && selecionadasIds.length > 0) {
    return musicas.filter(m => selecionadasIds.includes(m.id));
  }
  return [...musicas];
}

/**
 * Monta o texto descritivo e instruções da partitura de uma música para o caderno PDF.
 * 
 * @param musica - Objeto com informações da música
 * @returns Texto formatado para o PDF do caderno
 */
export function montarTextoPartituraMusica(musica: MusicaRepertorio): string {
  const arranjo = musica.partituraTexto || (musica.arquivoRepertorio ? `Arquivo anexado: ${musica.arquivoRepertorio}` : 'Arranjo padrão de percussão e metais.');
  return `FAIXA ${musica.ordemDesfile}: ${musica.titulo.toUpperCase()}\n` +
         `Artista Original: ${musica.artistaOriginal} | Ritmo: ${musica.ritmo} | Status: ${musica.statusCuradoria}\n` +
         `------------------------------------------------------------\n` +
         `PARTITURA & CONVENÇÕES:\n${arranjo}\n`;
}

export const REPERTORIO_INICIAL: MusicaRepertorio[] = [];

export const LETRAS_CIFRAS_INICIAIS: ItemLetraCifra[] = [];

export const ENQUETES_WHATSAPP_INICIAIS: EnqueteWhatsApp[] = [];

export const CALENDARIO_INICIAL: EventoCalendario[] = [
  {
    id: 'cal-desfile-2027',
    data: '2027-02-08',
    diaSemana: 'Segunda',
    tipo: 'Desfile Oficial',
    local: 'Praça Oliva & Centro Histórico',
    horario: '14:30',
    observacoes: '🎊 GRANDE DESFILE DE CARNAVAL DO BLOCO BICHARADA! Concentração com a Kombi Cora e início do cortejo carnavalesco oficial'
  }
];

/**
 * Adiciona um novo evento ou data ao calendário oficial do bloco.
 * 
 * @param eventos - Lista atual de eventos
 * @param novo - Dados do novo evento (sem id)
 * @returns Lista atualizada com o novo evento ordenado cronologicamente
 */
export function adicionarEventoCalendario(
  eventos: EventoCalendario[],
  novo: Omit<EventoCalendario, 'id'>
): EventoCalendario[] {
  const novoEvento: EventoCalendario = {
    ...novo,
    id: `ev-${Date.now()}`
  };
  return [...eventos, novoEvento].sort((a, b) => a.data.localeCompare(b.data));
}

/**
 * Atualiza um evento existente no calendário oficial.
 * 
 * @param eventos - Lista atual de eventos
 * @param id - Identificador do evento a ser modificado
 * @param dados - Campos atualizados
 * @returns Lista com o evento atualizado e reordenado
 */
export function editarEventoCalendario(
  eventos: EventoCalendario[],
  id: string,
  dados: Partial<Omit<EventoCalendario, 'id'>>
): EventoCalendario[] {
  return eventos
    .map(ev => (ev.id === id ? { ...ev, ...dados } : ev))
    .sort((a, b) => a.data.localeCompare(b.data));
}

/**
 * Remove um evento do calendário oficial pelo identificador.
 * 
 * @param eventos - Lista atual de eventos
 * @param id - Identificador do evento a remover
 * @returns Lista sem o evento especificado
 */
export function removerEventoCalendario(
  eventos: EventoCalendario[],
  id: string
): EventoCalendario[] {
  return eventos.filter(ev => ev.id !== id);
}

/**
 * Interface que representa um documento oficial baixável do bloco.
 */
export interface DocumentoBloco {
  id: string;
  titulo: string;
  descricao?: string;
  tags: string[];
  nomeArquivo: string;
  tamanhoFormatado?: string;
  tipoArquivo?: string;
  dataUpload: string;
  urlDownload?: string;
  conteudoBase64OuTexto?: string;
}

/**
 * Lista inicial de documentos oficiais disponibilizados para download.
 */
export const DOCUMENTOS_INICIAIS: DocumentoBloco[] = [];

/**
 * Filtra documentos pela tag selecionada e/ou busca textual no título, descrição e tags.
 * 
 * @param documentos - Lista de documentos a filtrar
 * @param tagSelecionada - Tag para filtrar ou 'Todas'
 * @param buscaTexto - Termo de busca textual
 * @returns Lista de documentos filtrada
 */
export function filtrarDocumentos(
  documentos: DocumentoBloco[],
  tagSelecionada?: string,
  buscaTexto?: string
): DocumentoBloco[] {
  return documentos.filter(doc => {
    const matchTag = !tagSelecionada || tagSelecionada === 'Todas' || doc.tags.includes(tagSelecionada);
    if (!matchTag) return false;

    if (!buscaTexto || !buscaTexto.trim()) return true;
    const termo = buscaTexto.trim().toLowerCase();
    const noTitulo = doc.titulo.toLowerCase().includes(termo);
    const naDesc = doc.descricao ? doc.descricao.toLowerCase().includes(termo) : false;
    const noArquivo = doc.nomeArquivo.toLowerCase().includes(termo);
    const nasTags = doc.tags.some(t => t.toLowerCase().includes(termo));

    return noTitulo || naDesc || noArquivo || nasTags;
  });
}

/**
 * Adiciona um novo documento à lista garantindo ID único, data atual e higienização das tags.
 * 
 * @param documentos - Lista atual de documentos
 * @param dados - Dados do novo documento
 * @returns Lista atualizada com o novo documento inserido no topo
 */
export function adicionarNovoDocumento(
  documentos: DocumentoBloco[],
  dados: {
    titulo: string;
    descricao?: string;
    tags: string[];
    nomeArquivo: string;
    tamanhoFormatado?: string;
    tipoArquivo?: string;
    urlDownload?: string;
    conteudoBase64OuTexto?: string;
  }
): DocumentoBloco[] {
  const tagsLimpass = dados.tags
    .map(t => t.trim())
    .filter(t => t.length > 0);

  const novoDoc: DocumentoBloco = {
    id: `doc-${Date.now()}`,
    titulo: dados.titulo.trim(),
    descricao: dados.descricao?.trim() || undefined,
    tags: tagsLimpass.length > 0 ? tagsLimpass : ['Geral'],
    nomeArquivo: dados.nomeArquivo.trim() || 'documento.pdf',
    tamanhoFormatado: dados.tamanhoFormatado || '100 KB',
    tipoArquivo: dados.tipoArquivo || 'application/pdf',
    dataUpload: new Date().toISOString().split('T')[0],
    urlDownload: dados.urlDownload,
    conteudoBase64OuTexto: dados.conteudoBase64OuTexto
  };

  return [novoDoc, ...documentos];
}

/**
 * Extrai todas as tags únicas presentes na lista de documentos cadastrados.
 * 
 * @param documentos - Lista de documentos
 * @returns Lista com todas as tags únicas
 */
export function extrairTodasTagsDocumentos(documentos: DocumentoBloco[]): string[] {
  const setTags = new Set<string>();
  documentos.forEach(doc => {
    doc.tags.forEach(t => setTags.add(t.trim()));
  });
  return Array.from(setTags);
}

/**
 * Interface que representa uma cor oficial da paleta anual do bloco.
 */
export interface CorPaletaAnual {
  id: string;
  ano: number;
  nome: string;
  hex: string;
  descricaoUso: string;
  textoEscuro?: boolean;
}

/**
 * Interface para arquivos e artes gráficas de identidade visual do bloco.
 */
export interface ArquivoArteMidia {
  id: string;
  titulo: string;
  categoria: 'Logotipos' | 'Cartazes & Lambes' | 'Redes Sociais' | 'Camisetas & Fantasias' | 'Fontes & Tipografia';
  nomeArquivo: string;
  tamanhoFormatado: string;
  formatoExtensao: string;
  dataUpload: string;
  dimensoesOuUso?: string;
  urlDownload?: string;
  conteudoBase64OuTexto?: string;
}

/**
 * Interface para posts planejados ou publicados nas redes sociais (Instagram).
 */
export interface PostInstagramPlanejado {
  id: string;
  titulo: string;
  tipo: 'Feed' | 'Carrossel' | 'Reels' | 'Stories';
  legenda: string;
  hashtags: string[];
  imagemPreviewUrl?: string;
  dataProgramada: string;
  status: 'Planejado' | 'Pronto para Postar' | 'Publicado';
}

/**
 * Interface do Tema Oficial do Ano do Bloco.
 * Contém o título de exibição (que estampa a faixa oficial do cabeçalho),
 * as diretrizes de fantasia e adereços, e a descrição das cores oficiais.
 */
export interface TemaAnoBloco {
  ano: number;
  titulo: string;
  fantasia: string;
  descricaoCores: string;
  subtituloOuSlogan?: string;
  autorOuCriador?: string;
  dataAtualizacao?: string;
}

/**
 * Interface de configuração do perfil e integração com a API do Instagram (Meta Graph API).
 */
export interface ConfiguracaoInstagram {
  handle: string;
  nomePerfil: string;
  biografia: string;
  linkBio: string;
  totalSeguidores: number;
  metaBusinessId?: string;
  accessTokenConectado: boolean;
  ultimaSincronizacao?: string;
}

/**
 * Paleta oficial de cores carnavalescas do Bloco Bicharada 2027.
 */
export const CORES_PALETA_INICIAIS: CorPaletaAnual[] = [
  {
    id: 'cor-1',
    ano: 2027,
    nome: 'Rosa Choque Purpurina',
    hex: '#E6007E',
    descricaoUso: 'Estandarte principal, destaques no fanzine, crachás e fitilhos dos brincantes.',
    textoEscuro: false
  },
  {
    id: 'cor-2',
    ano: 2027,
    nome: 'Verde Menta Costeira',
    hex: '#00D287',
    descricaoUso: 'Ala de percussão, botões de ação do CRM, tiras dos surdos e pulseiras.',
    textoEscuro: true
  },
  {
    id: 'cor-3',
    ano: 2027,
    nome: 'Roxo Estandarte Real',
    hex: '#581C87',
    descricaoUso: 'Tipografia de impacto, contraste nos cartazes e bandeiras das comissões.',
    textoEscuro: false
  },
  {
    id: 'cor-4',
    ano: 2027,
    nome: 'Ouro Glitter & Confete',
    hex: '#FBBF24',
    descricaoUso: 'Adereços luminosos, estrelas da bateria, medalhas e carimbos comemorativos.',
    textoEscuro: true
  },
  {
    id: 'cor-5',
    ano: 2027,
    nome: 'Algodão Cru / Papel Fanzine',
    hex: '#FFFDF9',
    descricaoUso: 'Fundo dos lambe-lambes, camisas oficiais de algodão e miolo das publicações.',
    textoEscuro: true
  },
  {
    id: 'cor-6',
    ano: 2027,
    nome: 'Tinta Tipográfica Noturna',
    hex: '#1E1B2E',
    descricaoUso: 'Bordas neo-brutalistas, sombras sólidas e leitura de alto contraste.',
    textoEscuro: false
  }
];

/**
 * Artes e arquivos de marca iniciais cadastrados no acervo gráfico.
 */
export const ARTES_MIDIA_INICIAIS: ArquivoArteMidia[] = [];

/**
 * Configuração inicial do perfil e integração Instagram.
 */
export const CONFIG_INSTAGRAM_INICIAL: ConfiguracaoInstagram = {
  handle: '@bicharadafloripa',
  nomePerfil: 'Bloco Bicharada • Floripa 2027 🐾🪽',
  biografia: 'Carnaval de rua libertário, diverso e vibrante em Florianópolis! Desfile na Segunda de Carnaval (08/02). Bicharada solta pelos ares!',
  linkBio: 'https://bicharada.org/inscricoes',
  totalSeguidores: 3840,
  metaBusinessId: 'act_1092837465',
  accessTokenConectado: true,
  ultimaSincronizacao: '2026-11-05 00:30'
};

/**
 * Grade inicial de postagens planejadas para o Instagram do bloco.
 */
export const POSTS_INSTAGRAM_INICIAIS: PostInstagramPlanejado[] = [];

/**
 * Adiciona uma nova cor à paleta anual do bloco.
 * 
 * @param cores - Paleta atual
 * @param nova - Dados da nova cor
 * @returns Paleta atualizada com a nova cor inserida
 */
export function adicionarCorPaleta(
  cores: CorPaletaAnual[],
  nova: Omit<CorPaletaAnual, 'id'>
): CorPaletaAnual[] {
  const novaCor: CorPaletaAnual = {
    id: `cor-${Date.now()}`,
    ano: nova.ano || 2027,
    nome: nova.nome.trim(),
    hex: nova.hex.trim().toUpperCase(),
    descricaoUso: nova.descricaoUso.trim(),
    textoEscuro: nova.textoEscuro
  };
  return [...cores, novaCor];
}

/**
 * Remove uma cor da paleta anual pelo identificador.
 * 
 * @param cores - Paleta atual
 * @param id - Identificador da cor a ser removida
 * @returns Paleta sem a cor especificada
 */
export function removerCorPaleta(cores: CorPaletaAnual[], id: string): CorPaletaAnual[] {
  return cores.filter(c => c.id !== id);
}

/**
 * Atualiza os dados de uma cor existente na paleta anual do bloco.
 * 
 * @param cores - Paleta atual
 * @param id - Identificador da cor a ser editada
 * @param dadosAtualizados - Novos valores para nome, hex, ano ou descricaoUso
 * @returns Paleta atualizada com a cor modificada
 */
export function editarCorPaleta(
  cores: CorPaletaAnual[],
  id: string,
  dadosAtualizados: Partial<Omit<CorPaletaAnual, 'id'>>
): CorPaletaAnual[] {
  return cores.map(cor => {
    if (cor.id === id) {
      return {
        ...cor,
        ...dadosAtualizados,
        nome: dadosAtualizados.nome !== undefined ? dadosAtualizados.nome.trim() : cor.nome,
        hex: dadosAtualizados.hex !== undefined ? dadosAtualizados.hex.trim().toUpperCase() : cor.hex,
        descricaoUso: dadosAtualizados.descricaoUso !== undefined ? dadosAtualizados.descricaoUso.trim() : cor.descricaoUso,
        ano: dadosAtualizados.ano !== undefined ? dadosAtualizados.ano : cor.ano
      };
    }
    return cor;
  });
}

/**
 * Cadastra um novo arquivo de arte/marca na galeria de mídia do bloco.
 * 
 * @param artes - Lista atual de artes
 * @param nova - Dados do arquivo de arte
 * @returns Lista atualizada com o novo arquivo no topo
 */
export function adicionarArquivoArte(
  artes: ArquivoArteMidia[],
  nova: Omit<ArquivoArteMidia, 'id' | 'dataUpload'>
): ArquivoArteMidia[] {
  const novoArquivo: ArquivoArteMidia = {
    id: `arte-${Date.now()}`,
    titulo: nova.titulo.trim(),
    categoria: nova.categoria,
    nomeArquivo: nova.nomeArquivo.trim(),
    tamanhoFormatado: nova.tamanhoFormatado || '200 KB',
    formatoExtensao: nova.formatoExtensao.toUpperCase(),
    dataUpload: new Date().toISOString().split('T')[0],
    dimensoesOuUso: nova.dimensoesOuUso?.trim(),
    conteudoBase64OuTexto: nova.conteudoBase64OuTexto
  };
  return [novoArquivo, ...artes];
}

/**
 * Filtra os arquivos de arte por categoria e por busca textual.
 * 
 * @param artes - Lista de arquivos de arte
 * @param categoria - Categoria selecionada ('Todas' ou categoria específica)
 * @param busca - Termo de busca textual
 * @returns Lista filtrada de artes
 */
export function filtrarArquivosArte(
  artes: ArquivoArteMidia[],
  categoria?: string,
  busca?: string
): ArquivoArteMidia[] {
  return artes.filter(arte => {
    const matchCat = !categoria || categoria === 'Todas' || arte.categoria === categoria;
    if (!matchCat) return false;

    if (!busca || !busca.trim()) return true;
    const termo = busca.trim().toLowerCase();
    return (
      arte.titulo.toLowerCase().includes(termo) ||
      arte.nomeArquivo.toLowerCase().includes(termo) ||
      arte.formatoExtensao.toLowerCase().includes(termo)
    );
  });
}

/**
 * Gera o texto de legenda formatado para o Instagram pronto para ser copiado.
 * 
 * @param post - Post planejado
 * @param handleBloco - Handle oficial do bloco
 * @returns Texto formatado com quebras e hashtags
 */
export function gerarTextoLegendaInstagram(
  post: PostInstagramPlanejado,
  handleBloco: string = '@bicharadafloripa'
): string {
  const hashtagsTexto = post.hashtags.map(h => (h.startsWith('#') ? h : `#${h}`)).join(' ');
  return (
    `${post.legenda}\n\n` +
    `🐾 Siga ${handleBloco} para acompanhar todos os ensaios e oficinas!\n` +
    `📍 Desfile Oficial: Segunda-feira de Carnaval (08/02/2027) no Centro Histórico de Floripa.\n\n` +
    `.\n.\n` +
    `${hashtagsTexto}`
  );
}

/**
 * Adiciona um novo post planejado à grade do Instagram do bloco.
 * 
 * @param posts - Lista atual de posts
 * @param novo - Dados do novo post
 * @returns Lista de posts com o novo item adicionado
 */
export function adicionarPostPlanejado(
  posts: PostInstagramPlanejado[],
  novo: Omit<PostInstagramPlanejado, 'id'>
): PostInstagramPlanejado[] {
  const postCriado: PostInstagramPlanejado = {
    id: `post-ig-${Date.now()}`,
    titulo: novo.titulo.trim(),
    tipo: novo.tipo,
    legenda: novo.legenda.trim(),
    hashtags: novo.hashtags.map(h => h.trim()).filter(h => h.length > 0),
    imagemPreviewUrl: novo.imagemPreviewUrl,
    dataProgramada: novo.dataProgramada,
    status: novo.status || 'Planejado'
  };
  return [postCriado, ...posts];
}

/**
 * Tema Oficial Inicial do Bloco Bicharada.
 */
export const TEMA_ANO_INICIAL: TemaAnoBloco = {
  ano: 2027,
  titulo: 'Solta pelos Ares 🪽',
  fantasia: 'Fantasias leves e esvoaçantes com asas, penas coloridas sintéticas, capas translúcidas, criaturas aladas e insetos polinizadores. Uso criativo de maquiagens holográficas e glitter biodegradável.',
  descricaoCores: 'Paleta vibrante 2027: Rosa Choque Neon (#FF007A) como força principal, Verde Papagaio (#00D287) como contraste tropical, Amarelo Ouro (#FBBF24) para brilhos e Roxo Profundo (#581C87) para contrastes e forros.',
  subtituloOuSlogan: 'O voo livre da diversidade no Carnaval de Floripa',
  autorOuCriador: 'Coordenação Artística & Visual'
};

/**
 * Atualiza as informações do tema do ano oficial do bloco.
 * 
 * @param temaAtual - Objeto com os dados do tema atual
 * @param novosDados - Campos a serem atualizados (título, fantasia, descrição de cores, etc.)
 * @returns Novo objeto atualizado do tema do ano
 */
export function atualizarTemaAno(
  temaAtual: TemaAnoBloco,
  novosDados: Partial<TemaAnoBloco>
): TemaAnoBloco {
  return {
    ...temaAtual,
    ...novosDados,
    subtituloOuSlogan: novosDados.subtituloOuSlogan !== undefined
      ? novosDados.subtituloOuSlogan
      : temaAtual.subtituloOuSlogan,
    dataAtualizacao: new Date().toISOString()
  };
}

/**
 * Perfis de acesso do sistema do Bloco Bicharada:
 * - 'coordenador': Acesso total a todas as abas, edições, exclusões e criação de usuários.
 * - 'bicho': Folião integrante do bloco, acesso às 11 abas com interações operacionais normais.
 * - 'publico': Acesso anônimo sem login, restrito a 5 abas em modo estritamente consulta (apenas inscrição permite envio).
 */
export type PerfilUsuario = 'coordenador' | 'bicho' | 'publico';

export interface UsuarioBloco {
  id: string;
  username: string; // Nome de usuário (letras/números)
  senha: string;    // Senha simples de acesso
  perfil: 'coordenador' | 'bicho';
  criadoEm: string;
}

/**
 * Usuários cadastrados inicialmente no sistema.
 * O primeiro usuário é a coordenação geral com username 'adminbixarada' e senha 'Hluz@1006'.
 */
export const USUARIOS_INICIAIS: UsuarioBloco[] = [
  {
    id: 'user-coord-master',
    username: 'adminbixarada',
    senha: 'Hluz@1006',
    perfil: 'coordenador',
    criadoEm: '2026-11-05'
  }
];

/**
 * Autentica um usuário pelo nome de usuário e senha simples.
 * 
 * @param usuarios - Lista de usuários cadastrados no sistema
 * @param username - Nome de usuário informado
 * @param senha - Senha digitada
 * @returns Objeto do usuário autenticado ou null se credenciais incorretas
 */
export function autenticarUsuario(
  usuarios: UsuarioBloco[],
  username: string,
  senha: string
): UsuarioBloco | null {
  const userLimpo = username.trim().toLowerCase();
  const senhaLimpa = senha.trim();

  const encontrado = usuarios.find(
    u => u.username.toLowerCase() === userLimpo && u.senha === senhaLimpa
  );

  return encontrado || null;
}

/**
 * Adiciona um novo usuário ao sistema com validação de unicidade de nome de usuário.
 * 
 * @param usuarios - Lista atual de usuários
 * @param dados - Dados do novo usuário a ser criado
 * @returns Objeto com a lista atualizada de usuários e status de sucesso ou mensagem de erro
 */
export function adicionarNovoUsuario(
  usuarios: UsuarioBloco[],
  dados: {
    username: string;
    senha: string;
    perfil: 'coordenador' | 'bicho';
  }
): { usuariosAtualizados: UsuarioBloco[]; sucesso: boolean; erro?: string } {
  const usernameSanitizado = dados.username.trim().toLowerCase().replace(/\s+/g, '');

  if (!usernameSanitizado) {
    return { usuariosAtualizados: usuarios, sucesso: false, erro: 'Informe um nome de usuário válido.' };
  }

  if (usernameSanitizado.length < 3) {
    return { usuariosAtualizados: usuarios, sucesso: false, erro: 'O nome de usuário deve conter pelo menos 3 caracteres.' };
  }

  if (!dados.senha || dados.senha.trim().length < 4) {
    return { usuariosAtualizados: usuarios, sucesso: false, erro: 'A senha simples deve ter no mínimo 4 caracteres.' };
  }

  const jaExiste = usuarios.some(u => u.username.toLowerCase() === usernameSanitizado);
  if (jaExiste) {
    return { usuariosAtualizados: usuarios, sucesso: false, erro: `O nome de usuário "${usernameSanitizado}" já está em uso.` };
  }

  const novoUsuario: UsuarioBloco = {
    id: `user-${Date.now()}`,
    username: usernameSanitizado,
    senha: dados.senha.trim(),
    perfil: dados.perfil,
    criadoEm: new Date().toISOString().split('T')[0]
  };

  return {
    usuariosAtualizados: [novoUsuario, ...usuarios],
    sucesso: true
  };
}

/**
 * Remove um usuário do sistema pelo seu identificador único.
 * Impede que a lista de usuários fique completamente vazia.
 * 
 * @param usuarios - Lista de usuários
 * @param id - Identificador do usuário a ser removido
 * @returns Lista de usuários sem o usuário removido
 */
export function removerUsuario(
  usuarios: UsuarioBloco[],
  id: string
): UsuarioBloco[] {
  return usuarios.filter(u => u.id !== id);
}

/**
 * Remove um integrante do elenco oficial pelo seu identificador unico.
 * 
 * @param integrantes - Lista atual de integrantes
 * @param id - Identificador do integrante a ser removido
 * @returns Lista atualizada sem o integrante removido
 */
export function removerIntegranteElenco(
  integrantes: Integrante[],
  id: string
): Integrante[] {
  return integrantes.filter(i => i.id !== id);
}

/**
 * Atualiza os dados de uma tarefa post-it existente no mural de tarefas.
 * 
 * @param tarefas - Lista atual de tarefas post-it
 * @param tarefaAtualizada - Tarefa com os dados modificados
 * @returns Lista atualizada com a tarefa modificada
 */
export function atualizarTarefaPostIt(
  tarefas: TarefaPostIt[],
  tarefaAtualizada: TarefaPostIt
): TarefaPostIt[] {
  return tarefas.map(t => t.id === tarefaAtualizada.id ? { ...tarefaAtualizada } : t);
}

/**
 * Remove uma tarefa post-it do mural pelo seu identificador unico.
 * 
 * @param tarefas - Lista atual de tarefas post-it
 * @param id - Identificador da tarefa a ser removida
 * @returns Lista de tarefas sem a tarefa removida
 */
export function removerTarefaPostIt(
  tarefas: TarefaPostIt[],
  id: string
): TarefaPostIt[] {
  return tarefas.filter(t => t.id !== id);
}

/**
 * Atualiza os dados de uma macrotarefa do cortejo/desfile em andamento.
 * 
 * @param macrotarefas - Lista atual de macrotarefas
 * @param macroAtualizada - Macrotarefa modificada
 * @returns Lista atualizada com a macrotarefa modificada
 */
export function atualizarMacrotarefa(
  macrotarefas: MacrotarefaDesfile[],
  macroAtualizada: MacrotarefaDesfile
): MacrotarefaDesfile[] {
  return macrotarefas.map(m => m.id === macroAtualizada.id ? { ...macroAtualizada } : m);
}

/**
 * Remove uma macrotarefa do desfile pelo seu identificador unico.
 * 
 * @param macrotarefas - Lista atual de macrotarefas
 * @param id - Identificador da macrotarefa a ser removida
 * @returns Lista de macrotarefas sem a macrotarefa removida
 */
export function removerMacrotarefa(
  macrotarefas: MacrotarefaDesfile[],
  id: string
): MacrotarefaDesfile[] {
  return macrotarefas.filter(m => m.id !== id);
}

/**
 * Atualiza os dados de uma enquete apurada do WhatsApp.
 * 
 * @param enquetes - Lista atual de enquetes
 * @param enqueteAtualizada - Enquete modificada
 * @returns Lista atualizada com a enquete modificada
 */
export function atualizarEnquete(
  enquetes: EnqueteWhatsApp[],
  enqueteAtualizada: EnqueteWhatsApp
): EnqueteWhatsApp[] {
  return enquetes.map(e => e.id === enqueteAtualizada.id ? { ...enqueteAtualizada } : e);
}

/**
 * Remove uma enquete do WhatsApp pelo seu identificador unico.
 * 
 * @param enquetes - Lista atual de enquetes
 * @param id - Identificador da enquete a ser removida
 * @returns Lista de enquetes sem a enquete removida
 */
export function removerEnquete(
  enquetes: EnqueteWhatsApp[],
  id: string
): EnqueteWhatsApp[] {
  return enquetes.filter(e => e.id !== id);
}
