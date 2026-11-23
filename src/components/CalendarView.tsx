'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Plus,
  Edit3,
  Trash2,
  X,
  ClipboardCheck,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileCheck2,
  MessageSquare,
  BarChart3,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  EventoCalendario,
  Integrante,
  RegistroPresencaEvento,
  StatusPresenca,
  SetorElenco,
  adicionarEventoCalendario,
  editarEventoCalendario,
  removerEventoCalendario,
  eventoAceitaListaPresenca,
  obterPresencasPorEvento,
  calcularResumoPresencaEvento,
  calcularResumoFrequenciaIntegrante,
  obterSetorDoGrupo,
  formatarDataBrasileira
} from '../data/blocoData';

interface CalendarViewProps {
  eventos: EventoCalendario[];
  setEventos?: React.Dispatch<React.SetStateAction<EventoCalendario[]>>;
  isAdmin: boolean;
  integrantes?: Integrante[];
  presencas?: RegistroPresencaEvento[];
  onSalvarPresenca?: (
    evento: EventoCalendario,
    integrante: Integrante,
    status: StatusPresenca,
    observacao?: string
  ) => void;
  onSalvarPresencasLote?: (evento: EventoCalendario) => void;
  onRemoverPresenca?: (eventoId: string, integranteId: string) => void;
  onRemoverPresencasEvento?: (eventoId: string) => void;
}

/**
 * Retorna a sigla abreviada em português para o mês numérico.
 */
function obterSiglaMes(mes: string): string {
  const mapa: Record<string, string> = {
    '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
    '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
  };
  return mapa[mes] || mes;
}

/**
 * Calcula automaticamente a sigla do dia da semana a partir da data no formato YYYY-MM-DD.
 */
function calcularSiglaDiaSemana(dataIso: string): string {
  if (!dataIso) return '';
  const partes = dataIso.split('-').map(Number);
  if (partes.length !== 3 || !partes[0] || !partes[1] || !partes[2]) return '';
  const d = new Date(partes[0], partes[1] - 1, partes[2]);
  const siglas = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  return siglas[d.getDay()] || '';
}

/**
 * Retorna o rótulo visual e classes de cor para cada status da lista de presença.
 * 
 * @param status - Status de presença registrado para o integrante
 * @returns Objeto com classes CSS e texto descritivo do status
 */
function obterEstiloStatusPresenca(status: StatusPresenca): {
  ativoClass: string;
  badgeClass: string;
  label: string;
} {
  switch (status) {
    case 'Presente':
      return {
        ativoClass: 'bg-[#00D287] text-[#1E1B2E] border-[#1A181B]',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-700',
        label: 'Presente'
      };
    case 'Atrasado':
      return {
        ativoClass: 'bg-[#FBBF24] text-[#1E1B2E] border-[#1A181B]',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-700',
        label: 'Atrasado'
      };
    case 'Justificada':
      return {
        ativoClass: 'bg-sky-300 text-[#1E1B2E] border-[#1A181B]',
        badgeClass: 'bg-sky-100 text-sky-900 border-sky-700',
        label: 'Justificada'
      };
    case 'Falta':
      return {
        ativoClass: 'bg-red-500 text-white border-[#1A181B]',
        badgeClass: 'bg-red-100 text-red-900 border-red-700',
        label: 'Falta'
      };
  }
}

/**
 * Calendário em Estilo Folhinha / Almanaque de Carnaval do Bloco Bicharada.
 * - Foliões: visualizam as datas oficiais e ensaios filtrados por categoria;
 * - Coordenadores (isAdmin = true): podem cadastrar/editar/excluir datas e gerenciar
 *   exclusivamente a Lista de Presença (inserir, editar, excluir e consultar frequência)
 *   para Ensaios e Reuniões presenciais usando o cadastro oficial do elenco.
 */
export default function CalendarView({
  eventos,
  setEventos,
  isAdmin,
  integrantes = [],
  presencas = [],
  onSalvarPresenca,
  onSalvarPresencasLote,
  onRemoverPresenca,
  onRemoverPresencasEvento
}: CalendarViewProps) {
  const [filtro, setFiltro] = useState<string>('Todos');

  // Estados do Modal de Cadastro / Edição de Evento
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoEmEdicao, setEventoEmEdicao] = useState<EventoCalendario | null>(null);

  const [formData, setFormData] = useState('');
  const [formDiaSemana, setFormDiaSemana] = useState('');
  const [formTipo, setFormTipo] = useState<EventoCalendario['tipo']>('Ensaio');
  const [formLocal, setFormLocal] = useState('');
  const [formHorario, setFormHorario] = useState('19:30');
  const [formObservacoes, setFormObservacoes] = useState('');

  // Estados exclusivos de Coordenação para Lista de Presença
  const [eventoPresencaAtivo, setEventoPresencaAtivo] = useState<EventoCalendario | null>(null);
  const [buscaPresenca, setBuscaPresenca] = useState('');
  const [filtroSetorPresenca, setFiltroSetorPresenca] = useState<'Todos' | SetorElenco>('Todos');
  const [filtroStatusPresenca, setFiltroStatusPresenca] = useState<'Todos' | StatusPresenca | 'Sem Registro'>('Todos');
  const [incluirInativos, setIncluirInativos] = useState(false);
  const [integranteObsAbertaId, setIntegranteObsAbertaId] = useState<string | null>(null);
  const [textoObsDraft, setTextoObsDraft] = useState('');

  // Estados exclusivos de Coordenação para Relatório Geral de Frequência
  const [modalRelatorioAberto, setModalRelatorioAberto] = useState(false);
  const [buscaRelatorio, setBuscaRelatorio] = useState('');
  const [filtroSetorRelatorio, setFiltroSetorRelatorio] = useState<'Todos' | SetorElenco>('Todos');

  const eventosFiltrados = filtro === 'Todos'
    ? eventos
    : eventos.filter(e => e.tipo === filtro);

  /**
   * Abre o modal para cadastrar uma nova data no calendário oficial.
   */
  const handleAbrirNovo = () => {
    setEventoEmEdicao(null);
    setFormData('');
    setFormDiaSemana('');
    setFormTipo('Ensaio');
    setFormLocal('Costeira do Pirajubaé');
    setFormHorario('19:30');
    setFormObservacoes('');
    setModalAberto(true);
  };

  /**
   * Abre o modal com os dados de um evento existente para edição pela coordenação.
   */
  const handleAbrirEditar = (ev: EventoCalendario) => {
    setEventoEmEdicao(ev);
    setFormData(ev.data);
    setFormDiaSemana(ev.diaSemana);
    setFormTipo(ev.tipo);
    setFormLocal(ev.local);
    setFormHorario(ev.horario);
    setFormObservacoes(ev.observacoes || '');
    setModalAberto(true);
  };

  /**
   * Abre o modal exclusivo da coordenação para gerenciar a lista de presença de um ensaio ou reunião.
   * 
   * @param ev - Evento selecionado (Ensaio ou Reunião presencial)
   */
  const handleAbrirPresenca = (ev: EventoCalendario) => {
    if (!isAdmin || !eventoAceitaListaPresenca(ev)) return;
    setEventoPresencaAtivo(ev);
    setBuscaPresenca('');
    setFiltroSetorPresenca('Todos');
    setFiltroStatusPresenca('Todos');
    setIntegranteObsAbertaId(null);
    setTextoObsDraft('');
  };

  /**
   * Atualiza a data e calcula o dia da semana automaticamente.
   */
  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novaData = e.target.value;
    setFormData(novaData);
    const sigla = calcularSiglaDiaSemana(novaData);
    if (sigla) setFormDiaSemana(sigla);
  };

  /**
   * Remove uma data do calendário oficial após confirmação da coordenação
   * e limpa os registros de presença vinculados na tabela fato.
   */
  const handleExcluir = (ev: EventoCalendario) => {
    if (!setEventos) return;
    const confirmou = window.confirm(`Deseja realmente excluir a data "${ev.tipo} - ${ev.data}" do calendário oficial?`);
    if (confirmou) {
      setEventos(prev => removerEventoCalendario(prev, ev.id));
      if (isAdmin && eventoAceitaListaPresenca(ev) && onRemoverPresencasEvento) {
        onRemoverPresencasEvento(ev.id);
      }
    }
  };

  /**
   * Salva a inclusão ou edição da data e atualiza o estado geral.
   */
  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setEventos) return;
    if (!formData.trim() || !formLocal.trim()) {
      alert('Por favor, informe ao menos a data e o local do evento.');
      return;
    }

    const diaFinal = formDiaSemana.trim() || calcularSiglaDiaSemana(formData) || 'DATA';

    if (eventoEmEdicao) {
      setEventos(prev =>
        editarEventoCalendario(prev, eventoEmEdicao.id, {
          data: formData.trim(),
          diaSemana: diaFinal,
          tipo: formTipo,
          local: formLocal.trim(),
          horario: formHorario.trim(),
          observacoes: formObservacoes.trim() || undefined
        })
      );
    } else {
      setEventos(prev =>
        adicionarEventoCalendario(prev, {
          data: formData.trim(),
          diaSemana: diaFinal,
          tipo: formTipo,
          local: formLocal.trim(),
          horario: formHorario.trim(),
          observacoes: formObservacoes.trim() || undefined
        })
      );
    }

    setModalAberto(false);

    confetti({
      particleCount: 40,
      spread: 60,
      colors: ['#E6007E', '#00D287', '#FBBF24']
    });
  };

  /**
   * Registra ou altera o status de presença de um integrante do elenco no evento ativo.
   * 
   * @param integrante - Integrante selecionado do cadastro do elenco
   * @param novoStatus - Novo status de presença
   * @param obsAtual - Observação atual preservada
   */
  const handleAlterarStatusPresenca = (
    integrante: Integrante,
    novoStatus: StatusPresenca,
    obsAtual?: string
  ) => {
    if (!isAdmin || !eventoPresencaAtivo || !onSalvarPresenca) return;
    onSalvarPresenca(eventoPresencaAtivo, integrante, novoStatus, obsAtual);
  };

  /**
   * Abre o editor inline de observação de presença para um integrante.
   * 
   * @param integranteId - Identificador do integrante
   * @param observacaoExistente - Observação já registrada, se houver
   */
  const handleAbrirEditorObservacao = (integranteId: string, observacaoExistente?: string) => {
    if (integranteObsAbertaId === integranteId) {
      setIntegranteObsAbertaId(null);
      setTextoObsDraft('');
      return;
    }
    setIntegranteObsAbertaId(integranteId);
    setTextoObsDraft(observacaoExistente || '');
  };

  /**
   * Salva a observação editada para o integrante no evento ativo.
   * Caso o integrante ainda não tenha status registrado, registra como 'Presente' com a observação.
   * 
   * @param integrante - Integrante do elenco
   * @param registroAtual - Registro de presença existente, se houver
   */
  const handleSalvarObservacao = (
    integrante: Integrante,
    registroAtual?: RegistroPresencaEvento
  ) => {
    if (!isAdmin || !eventoPresencaAtivo || !onSalvarPresenca) return;
    const statusFinal: StatusPresenca = registroAtual ? registroAtual.status : 'Presente';
    onSalvarPresenca(eventoPresencaAtivo, integrante, statusFinal, textoObsDraft.trim());
    setIntegranteObsAbertaId(null);
    setTextoObsDraft('');
  };

  /**
   * Exclui o registro de presença de um integrante específico no evento ativo.
   * 
   * @param integrante - Integrante cujo registro será removido
   */
  const handleExcluirRegistroPresenca = (integrante: Integrante) => {
    if (!isAdmin || !eventoPresencaAtivo || !onRemoverPresenca) return;
    onRemoverPresenca(eventoPresencaAtivo.id, integrante.id);
    if (integranteObsAbertaId === integrante.id) {
      setIntegranteObsAbertaId(null);
      setTextoObsDraft('');
    }
  };

  /**
   * Limpa todos os registros de presença do evento ativo após confirmação da coordenação.
   */
  const handleLimparChamadaEvento = () => {
    if (!isAdmin || !eventoPresencaAtivo || !onRemoverPresencasEvento) return;
    const confirmou = window.confirm(
      `Deseja excluir TODOS os registros de presença de "${eventoPresencaAtivo.tipo} - ${formatarDataBrasileira(eventoPresencaAtivo.data)}"?`
    );
    if (confirmou) {
      onRemoverPresencasEvento(eventoPresencaAtivo.id);
    }
  };

  // Dados calculados para o modal de presença (apenas quando coordenador e modal aberto)
  const presencasDoEventoAtivo = isAdmin && eventoPresencaAtivo
    ? obterPresencasPorEvento(presencas, eventoPresencaAtivo.id)
    : [];

  const mapaPresencasEvento = new Map<string, RegistroPresencaEvento>(
    presencasDoEventoAtivo.map(r => [r.integranteId, r])
  );

  const resumoEventoAtivo = isAdmin && eventoPresencaAtivo
    ? calcularResumoPresencaEvento(presencas, eventoPresencaAtivo.id, integrantes)
    : null;

  // Lista filtrada do elenco para chamada no modal
  const elencoFiltradoPresenca = isAdmin && eventoPresencaAtivo
    ? [...integrantes]
        .filter(m => incluirInativos || m.ativo !== false)
        .filter(m => {
          if (filtroSetorPresenca !== 'Todos' && obterSetorDoGrupo(m.grandeGrupo) !== filtroSetorPresenca) {
            return false;
          }
          const registro = mapaPresencasEvento.get(m.id);
          if (filtroStatusPresenca === 'Sem Registro' && registro) return false;
          if (
            filtroStatusPresenca !== 'Todos' &&
            filtroStatusPresenca !== 'Sem Registro' &&
            registro?.status !== filtroStatusPresenca
          ) {
            return false;
          }
          if (!buscaPresenca.trim()) return true;
          const termo = buscaPresenca.trim().toLowerCase();
          return (
            m.nome.toLowerCase().includes(termo) ||
            m.grandeGrupo.toLowerCase().includes(termo) ||
            m.instrumentoOuFuncao.toLowerCase().includes(termo)
          );
        })
        .sort((a, b) => a.nome.localeCompare(b.nome))
    : [];

  // Dados do relatório consolidado de frequência (apenas coordenador)
  const totalEventosElegiveis = eventos.filter(eventoAceitaListaPresenca).length;
  const relatorioElencoFiltrado = isAdmin && modalRelatorioAberto
    ? [...integrantes]
        .filter(m => m.ativo !== false)
        .filter(m => {
          if (filtroSetorRelatorio !== 'Todos' && obterSetorDoGrupo(m.grandeGrupo) !== filtroSetorRelatorio) {
            return false;
          }
          if (!buscaRelatorio.trim()) return true;
          const termo = buscaRelatorio.trim().toLowerCase();
          return (
            m.nome.toLowerCase().includes(termo) ||
            m.grandeGrupo.toLowerCase().includes(termo) ||
            m.instrumentoOuFuncao.toLowerCase().includes(termo)
          );
        })
        .map(membro => ({
          membro,
          resumo: calcularResumoFrequenciaIntegrante(presencas, eventos, membro.id)
        }))
        .sort((a, b) =>
          b.resumo.percentualFrequencia - a.resumo.percentualFrequencia ||
          a.membro.nome.localeCompare(b.membro.nome)
        )
    : [];

  return (
    <div className="space-y-4">
      {/* Banner Principal com Filtros e Ações de Coordenação */}
      <div className="bg-[#FAF6EC] border-2 border-[#1A181B] p-4 shadow-[3px_3px_0px_#1A181B] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="stamp stamp-urgent text-xs">Agenda Oficial</span>
            <span className="font-mono text-xs font-bold text-stone-600">
              {eventos.length} datas programadas
            </span>
          </div>
          <h2 className="text-xl font-black uppercase text-[#1A181B] flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#E6007E]" />
            <span>Almanaque de Ensaios & Datas</span>
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Cronograma oficial da Bicharada rumo ao grande desfile de Carnaval na Praça Oliva.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Botão exclusivo de Coordenação: Relatório Geral de Frequência */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setModalRelatorioAberto(true)}
              className="vintage-button px-3.5 py-2 bg-[#581C87] hover:bg-[#6B21A8] text-white text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
              title="Exclusivo Coordenação: Consultar frequência consolidada do elenco em ensaios e reuniões"
            >
              <BarChart3 className="w-4 h-4 text-[#FBBF24]" />
              <span>Frequência Geral</span>
            </button>
          )}

          {/* Botão exclusivo de Coordenação para Adicionar Data */}
          {isAdmin && setEventos && (
            <button
              type="button"
              onClick={handleAbrirNovo}
              className="vintage-button px-3.5 py-2 bg-[#00D287] hover:bg-[#34EEA0] text-[#1E1B2E] text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nova Data / Ensaio</span>
            </button>
          )}

          {/* Filtros por Categoria de Evento */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {(['Todos', 'Ensaio', 'Reunião presencial', 'Oficina de Fantasias', 'Desfile Oficial'] as const).map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => setFiltro(tipo)}
                className={`px-3 py-1.5 border-2 border-[#1A181B] font-mono text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#1A181B] cursor-pointer ${
                  filtro === tipo
                    ? 'bg-[#E6007E] text-white'
                    : 'bg-white text-[#1A181B] hover:bg-stone-100'
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista Estilo Folhinha / Almanaque */}
      {eventosFiltrados.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-[#1A181B] p-8 text-center shadow-[3px_3px_0px_#1A181B]">
          <CalendarIcon className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <p className="font-mono text-xs font-bold text-stone-600 uppercase">
            Nenhuma data cadastrada nesta categoria.
          </p>
          {isAdmin && setEventos && (
            <button
              type="button"
              onClick={handleAbrirNovo}
              className="mt-3 vintage-button px-4 py-1.5 bg-[#00D287] text-[#1E1B2E] text-xs uppercase"
            >
              + Cadastrar Primeira Data
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {eventosFiltrados.map((ev) => {
            const isDesfile = ev.tipo === 'Desfile Oficial';
            const aceitaPresenca = eventoAceitaListaPresenca(ev);
            const partes = ev.data.split('-');
            const diaNum = partes[2] || ev.data;
            const mesNum = partes[1] || '';

            const resumoCard = isAdmin && aceitaPresenca
              ? calcularResumoPresencaEvento(presencas, ev.id, integrantes)
              : null;

            return (
              <div
                key={ev.id}
                className={`p-4 border-2 border-[#1A181B] shadow-[3px_3px_0px_#1A181B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                  isDesfile
                    ? 'bg-[#FBBF24] border-[#1A181B] shadow-[4px_4px_0px_#1A181B] rotate-[-0.5deg]'
                    : 'bg-white hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Bloco de Data Retrô */}
                  <div className="w-14 h-14 bg-[#F4EEDF] border-2 border-[#1A181B] flex flex-col items-center justify-center font-mono font-black shrink-0 shadow-[2px_2px_0px_#1A181B]">
                    <span className="text-[10px] uppercase text-[#E6007E]">{ev.diaSemana}</span>
                    <span className="text-base leading-none text-[#1A181B]">{diaNum}</span>
                    <span className="text-[9px] uppercase text-stone-500">
                      {obterSiglaMes(mesNum)}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="stamp stamp-confirmed text-[9px] font-mono">
                        {ev.tipo}
                      </span>
                      <span className="text-xs font-mono font-bold text-stone-600 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#E6007E]" /> {ev.horario}
                      </span>

                      {/* Resumo Rápido de Presença (ESTRITAMENTE EXCLUSIVO PARA COORDENADORES) */}
                      {isAdmin && aceitaPresenca && resumoCard && resumoCard.registrados > 0 && (
                        <span className="px-2 py-0.5 bg-emerald-100 border border-[#1A181B] text-[10px] font-mono font-black text-emerald-900">
                          ✓ {resumoCard.presentes + resumoCard.atrasados}/{resumoCard.totalElencoAtivo || resumoCard.registrados} presentes ({resumoCard.percentualPresenca}%)
                        </span>
                      )}
                    </div>

                    <h3 className="font-mono font-black text-base text-[#1A181B] mt-1">
                      {ev.tipo} — {ev.local}
                    </h3>

                    {ev.observacoes && (
                      <p className="text-xs text-stone-600 font-serif mt-0.5">
                        {ev.observacoes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
                  <div className="shrink-0 font-mono text-xs font-bold text-[#581C87] flex items-center gap-1 bg-[#F4EEDF] px-2.5 py-1 border border-black shadow-[1px_1px_0px_#000]">
                    <MapPin className="w-3.5 h-3.5 text-[#E6007E]" />
                    <span>{ev.local}</span>
                  </div>

                  {/* Botão Lista de Presença — ESTRITAMENTE EXCLUSIVO PARA COORDENADORES em Ensaios e Reuniões */}
                  {isAdmin && aceitaPresenca && (
                    <button
                      type="button"
                      onClick={() => handleAbrirPresenca(ev)}
                      className="px-2.5 py-1.5 bg-[#581C87] hover:bg-[#6B21A8] text-white border-2 border-[#1A181B] font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#1A181B] cursor-pointer"
                      title="Exclusivo Coordenação: Abrir lista de presença deste evento"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5 text-[#00D287]" />
                      <span>Lista de Presença</span>
                    </button>
                  )}

                  {/* Ações Exclusivas para Coordenadores */}
                  {isAdmin && setEventos && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAbrirEditar(ev)}
                        className="p-1.5 bg-white border border-[#1A181B] text-[#581C87] hover:bg-purple-100 shadow-[1px_1px_0px_#1A181B] cursor-pointer"
                        title="Editar esta data do calendário"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleExcluir(ev)}
                        className="p-1.5 bg-white border border-[#1A181B] text-stone-500 hover:text-red-600 hover:bg-red-50 shadow-[1px_1px_0px_#1A181B] cursor-pointer"
                        title="Excluir esta data"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: CADASTRAR OU EDITAR DATA NO CALENDÁRIO (APENAS COORDENAÇÃO) */}
      {isAdmin && modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-md w-full shadow-[6px_6px_0px_#1E1B2E]">
            <div className="flex items-center justify-between mb-2">
              <span className="stamp stamp-urgent text-xs">Exclusivo Coordenação</span>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="text-stone-500 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-black uppercase text-[#1E1B2E] flex items-center gap-2 font-mono">
              <CalendarIcon className="w-5 h-5 text-[#E6007E]" />
              <span>{eventoEmEdicao ? 'Editar Data do Calendário' : 'Inserir Nova Data Oficial'}</span>
            </h3>

            <form onSubmit={handleSalvar} className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                    Data do Evento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData}
                    onChange={handleDataChange}
                    className="w-full px-3 py-1.5 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                    Dia da Semana *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: SEG, SEX, DOM..."
                    value={formDiaSemana}
                    onChange={(e) => setFormDiaSemana(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                    Tipo de Evento *
                  </label>
                  <select
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value as EventoCalendario['tipo'])}
                    className="w-full px-3 py-1.5 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono"
                  >
                    <option value="Ensaio">Ensaio</option>
                    <option value="Reunião presencial">Reunião presencial</option>
                    <option value="Oficina de Fantasias">Oficina de Fantasias</option>
                    <option value="Desfile Oficial">Desfile Oficial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                    Horário *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 19:30, 14:00"
                    value={formHorario}
                    onChange={(e) => setFormHorario(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Local do Evento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Costeira do Pirajubaé, Praça Oliva, Ateliê..."
                  value={formLocal}
                  onChange={(e) => setFormLocal(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Observações & Detalhes (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Trazer instrumentos, garrafa d'água e protetor solar..."
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t-2 border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-3.5 py-1.5 border-2 border-[#1E1B2E] text-xs font-bold uppercase hover:bg-stone-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-[#E6007E] text-white text-xs uppercase cursor-pointer"
                >
                  {eventoEmEdicao ? 'Salvar Alterações' : 'Cadastrar Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LISTA DE PRESENÇA DO EVENTO (ESTRITAMENTE EXCLUSIVO COORDENAÇÃO) */}
      {isAdmin && eventoPresencaAtivo && resumoEventoAtivo && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FAF6EC] border-4 border-[#1A181B] w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[8px_8px_0px_#1A181B]">
            {/* Cabeçalho do Modal */}
            <div className="p-4 sm:p-5 bg-[#1E1B2E] text-white border-b-4 border-[#E6007E] flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2 py-0.5 bg-[#E6007E] text-white font-mono text-[10px] font-black uppercase border border-white">
                    Exclusivo Coordenação
                  </span>
                  <span className="font-mono text-xs text-[#FBBF24] font-bold">
                    {eventoPresencaAtivo.diaSemana} • {formatarDataBrasileira(eventoPresencaAtivo.data)} • {eventoPresencaAtivo.horario}
                  </span>
                </div>
                <h3 className="text-lg font-black uppercase font-mono flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-[#00D287] shrink-0" />
                  <span>Lista de Presença — {eventoPresencaAtivo.tipo}</span>
                </h3>
                <p className="text-xs text-stone-300 font-mono mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#E6007E]" />
                  <span>{eventoPresencaAtivo.local}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEventoPresencaAtivo(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white cursor-pointer"
                title="Fechar lista de presença"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Indicadores KPI da Chamada */}
            <div className="p-3 sm:p-4 bg-white border-b-2 border-[#1A181B] grid grid-cols-3 sm:grid-cols-6 gap-2 font-mono">
              <div className="p-2 border-2 border-[#1A181B] bg-emerald-50 text-center">
                <div className="text-[10px] uppercase font-bold text-emerald-800">Presentes</div>
                <div className="text-lg font-black text-emerald-900">{resumoEventoAtivo.presentes}</div>
              </div>
              <div className="p-2 border-2 border-[#1A181B] bg-amber-50 text-center">
                <div className="text-[10px] uppercase font-bold text-amber-800">Atrasados</div>
                <div className="text-lg font-black text-amber-900">{resumoEventoAtivo.atrasados}</div>
              </div>
              <div className="p-2 border-2 border-[#1A181B] bg-sky-50 text-center">
                <div className="text-[10px] uppercase font-bold text-sky-800">Justif.</div>
                <div className="text-lg font-black text-sky-900">{resumoEventoAtivo.justificadas}</div>
              </div>
              <div className="p-2 border-2 border-[#1A181B] bg-red-50 text-center">
                <div className="text-[10px] uppercase font-bold text-red-800">Faltas</div>
                <div className="text-lg font-black text-red-900">{resumoEventoAtivo.faltas}</div>
              </div>
              <div className="p-2 border-2 border-[#1A181B] bg-stone-100 text-center">
                <div className="text-[10px] uppercase font-bold text-stone-600">Sem Reg.</div>
                <div className="text-lg font-black text-stone-800">{resumoEventoAtivo.semRegistro}</div>
              </div>
              <div className="p-2 border-2 border-[#1A181B] bg-[#581C87] text-white text-center">
                <div className="text-[10px] uppercase font-bold text-[#FBBF24]">Frequência</div>
                <div className="text-lg font-black">{resumoEventoAtivo.percentualPresenca}%</div>
              </div>
            </div>

            {/* Barra de Filtros e Ações Rápidas */}
            <div className="p-3 sm:p-4 bg-[#F4EEDF] border-b-2 border-[#1A181B] space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-500" />
                  <input
                    type="text"
                    placeholder="Buscar integrante do elenco por nome, naipe ou instrumento..."
                    value={buscaPresenca}
                    onChange={(e) => setBuscaPresenca(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                  />
                </div>

                <select
                  value={filtroSetorPresenca}
                  onChange={(e) => setFiltroSetorPresenca(e.target.value as 'Todos' | SetorElenco)}
                  className="px-2.5 py-1.5 bg-white border-2 border-[#1A181B] text-xs font-mono font-bold"
                >
                  <option value="Todos">Todos os Setores</option>
                  <option value="Música">🎺 Música</option>
                  <option value="Performance">🎭 Performance</option>
                  <option value="Organização">📋 Organização</option>
                </select>

                <select
                  value={filtroStatusPresenca}
                  onChange={(e) => setFiltroStatusPresenca(e.target.value as 'Todos' | StatusPresenca | 'Sem Registro')}
                  className="px-2.5 py-1.5 bg-white border-2 border-[#1A181B] text-xs font-mono font-bold"
                >
                  <option value="Todos">Todos os Status</option>
                  <option value="Presente">Presente</option>
                  <option value="Atrasado">Atrasado</option>
                  <option value="Justificada">Justificada</option>
                  <option value="Falta">Falta</option>
                  <option value="Sem Registro">Sem Registro</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="flex items-center gap-1.5 text-xs font-mono font-bold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={incluirInativos}
                    onChange={(e) => setIncluirInativos(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#581C87]"
                  />
                  <span>Mostrar integrantes inativos do elenco</span>
                </label>

                <div className="flex items-center gap-2 flex-wrap">
                  {onSalvarPresencasLote && integrantes.some(i => i.ativo !== false) && (
                    <button
                      type="button"
                      onClick={() => onSalvarPresencasLote(eventoPresencaAtivo)}
                      className="px-3 py-1 bg-[#00D287] hover:bg-[#34EEA0] text-[#1E1B2E] border-2 border-[#1A181B] font-mono text-[11px] font-black uppercase flex items-center gap-1 shadow-[2px_2px_0px_#1A181B] cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Marcar Todos Ativos Presente</span>
                    </button>
                  )}

                  {onRemoverPresencasEvento && resumoEventoAtivo.registrados > 0 && (
                    <button
                      type="button"
                      onClick={handleLimparChamadaEvento}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 border-2 border-[#1A181B] font-mono text-[11px] font-black uppercase flex items-center gap-1 shadow-[2px_2px_0px_#1A181B] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Limpar Chamada</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Corpo da Lista de Chamada Baseada no Cadastro de Elenco */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
              {integrantes.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-[#1A181B] p-8 text-center">
                  <Users className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="font-mono text-xs font-black uppercase text-stone-700">
                    Nenhum integrante cadastrado no Elenco Oficial.
                  </p>
                  <p className="font-serif text-xs text-stone-500 mt-1">
                    Cadastre os participantes na aba &ldquo;Elenco &amp; Naipes&rdquo; para realizar a chamada deste evento.
                  </p>
                </div>
              ) : elencoFiltradoPresenca.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-[#1A181B] p-6 text-center">
                  <p className="font-mono text-xs font-bold uppercase text-stone-500">
                    Nenhum integrante encontrado com os filtros aplicados.
                  </p>
                </div>
              ) : (
                elencoFiltradoPresenca.map((membro) => {
                  const registro = mapaPresencasEvento.get(membro.id);
                  const statusAtual = registro?.status;
                  const obsAberta = integranteObsAbertaId === membro.id;

                  return (
                    <div
                      key={membro.id}
                      className="bg-white border-2 border-[#1A181B] p-2.5 sm:p-3 shadow-[2px_2px_0px_#1A181B] space-y-2"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                        {/* Identificação do Integrante do Elenco */}
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="w-8 h-8 bg-[#E6007E] text-white font-mono font-black text-xs flex items-center justify-center border-2 border-[#1A181B] shrink-0">
                            {membro.nome.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`font-mono font-black text-sm ${membro.ativo === false ? 'line-through text-stone-400' : 'text-[#1A181B]'}`}>
                                {membro.nome}
                              </span>
                              {membro.ativo === false && (
                                <span className="px-1.5 py-0.2 bg-stone-200 border border-stone-400 font-mono text-[9px] uppercase text-stone-600">
                                  Inativo
                                </span>
                              )}
                              {statusAtual && (
                                <span className={`px-1.5 py-0.2 border font-mono text-[10px] font-black uppercase ${obterEstiloStatusPresenca(statusAtual).badgeClass}`}>
                                  {statusAtual}
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[11px] text-stone-600">
                              <span className="font-bold text-[#581C87]">{membro.grandeGrupo}</span> • {membro.instrumentoOuFuncao}
                            </div>
                            {registro?.observacao && !obsAberta && (
                              <div className="text-[11px] font-serif italic text-stone-600 mt-0.5 bg-amber-50 px-2 py-0.5 border-l-2 border-amber-500">
                                Obs: {registro.observacao}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Controles de Inserção, Edição e Exclusão de Presença */}
                        <div className="flex items-center gap-1 flex-wrap shrink-0">
                          {(['Presente', 'Atrasado', 'Justificada', 'Falta'] as StatusPresenca[]).map((st) => {
                            const ativo = statusAtual === st;
                            const estilo = obterEstiloStatusPresenca(st);
                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleAlterarStatusPresenca(membro, st, registro?.observacao)}
                                className={`px-2 py-1 border-2 font-mono text-[10px] font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
                                  ativo
                                    ? `${estilo.ativoClass} shadow-[2px_2px_0px_#1A181B] -translate-y-0.5`
                                    : 'bg-stone-50 text-stone-600 border-stone-300 hover:border-[#1A181B] hover:bg-stone-100'
                                }`}
                                title={`Marcar ${membro.nome} como ${st}`}
                              >
                                {st === 'Presente' && <CheckCircle2 className="w-3 h-3" />}
                                {st === 'Atrasado' && <AlertCircle className="w-3 h-3" />}
                                {st === 'Justificada' && <FileCheck2 className="w-3 h-3" />}
                                {st === 'Falta' && <XCircle className="w-3 h-3" />}
                                <span>{st}</span>
                              </button>
                            );
                          })}

                          {/* Botão de Observação (Editar nota da presença) */}
                          <button
                            type="button"
                            onClick={() => handleAbrirEditorObservacao(membro.id, registro?.observacao)}
                            className={`p-1.5 border-2 font-mono cursor-pointer transition-colors ${
                              obsAberta || registro?.observacao
                                ? 'bg-amber-100 border-[#1A181B] text-amber-900'
                                : 'bg-white border-stone-300 text-stone-500 hover:border-[#1A181B] hover:text-[#1A181B]'
                            }`}
                            title="Adicionar ou editar observação de presença"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Botão Excluir Registro de Presença */}
                          {registro && (
                            <button
                              type="button"
                              onClick={() => handleExcluirRegistroPresenca(membro)}
                              className="p-1.5 bg-white border-2 border-stone-300 text-stone-500 hover:border-red-600 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                              title={`Excluir registro de presença de ${membro.nome}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Editor Inline de Observação */}
                      {obsAberta && (
                        <div className="pt-2 border-t border-dashed border-stone-300 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Observação da coordenação (ex: justificativa, horário de chegada)..."
                            value={textoObsDraft}
                            onChange={(e) => setTextoObsDraft(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 bg-stone-50 border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSalvarObservacao(membro, registro)}
                            className="px-3 py-1.5 bg-[#00D287] text-[#1E1B2E] border-2 border-[#1A181B] font-mono text-xs font-black uppercase flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Salvar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="p-3 bg-white border-t-2 border-[#1A181B] flex items-center justify-between gap-2 text-xs font-mono">
              <span className="text-stone-600">
                Persistido automaticamente na tabela fato <strong>fato_presenca_eventos</strong>
              </span>
              <button
                type="button"
                onClick={() => setEventoPresencaAtivo(null)}
                className="vintage-button px-4 py-1.5 bg-[#1E1B2E] text-white text-xs uppercase cursor-pointer"
              >
                Concluir Chamada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RELATÓRIO CONSOLIDADO DE FREQUÊNCIA DO ELENCO (ESTRITAMENTE EXCLUSIVO COORDENAÇÃO) */}
      {isAdmin && modalRelatorioAberto && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FAF6EC] border-4 border-[#1A181B] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[8px_8px_0px_#1A181B]">
            <div className="p-4 sm:p-5 bg-[#581C87] text-white border-b-4 border-[#FBBF24] flex items-start justify-between gap-3">
              <div>
                <span className="px-2 py-0.5 bg-[#E6007E] text-white font-mono text-[10px] font-black uppercase border border-white">
                  Exclusivo Coordenação
                </span>
                <h3 className="text-lg font-black uppercase font-mono flex items-center gap-2 mt-1">
                  <BarChart3 className="w-5 h-5 text-[#FBBF24]" />
                  <span>Painel de Frequência do Elenco</span>
                </h3>
                <p className="text-xs text-purple-100 font-mono mt-0.5">
                  Consolidado sobre {totalEventosElegiveis} ensaio(s) e reunião(ões) cadastrados no calendário.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalRelatorioAberto(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#F4EEDF] border-b-2 border-[#1A181B] flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-500" />
                <input
                  type="text"
                  placeholder="Filtrar integrante por nome, naipe ou instrumento..."
                  value={buscaRelatorio}
                  onChange={(e) => setBuscaRelatorio(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                />
              </div>
              <select
                value={filtroSetorRelatorio}
                onChange={(e) => setFiltroSetorRelatorio(e.target.value as 'Todos' | SetorElenco)}
                className="px-2.5 py-1.5 bg-white border-2 border-[#1A181B] text-xs font-mono font-bold"
              >
                <option value="Todos">Todos os Setores</option>
                <option value="Música">🎺 Música</option>
                <option value="Performance">🎭 Performance</option>
                <option value="Organização">📋 Organização</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
              {relatorioElencoFiltrado.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-[#1A181B] p-8 text-center font-mono text-xs text-stone-500 uppercase">
                  Nenhum integrante ativo encontrado para exibir frequência.
                </div>
              ) : (
                relatorioElencoFiltrado.map(({ membro, resumo }) => (
                  <div
                    key={membro.id}
                    className="bg-white border-2 border-[#1A181B] p-3 shadow-[2px_2px_0px_#1A181B] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-mono font-black text-sm text-[#1A181B]">
                        {membro.nome}
                      </div>
                      <div className="font-mono text-[11px] text-stone-600">
                        <span className="font-bold text-[#581C87]">{membro.grandeGrupo}</span> • {membro.instrumentoOuFuncao}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap font-mono text-[11px]">
                      <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-700 text-emerald-900 font-bold">
                        P: {resumo.presentes}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 border border-amber-700 text-amber-900 font-bold">
                        A: {resumo.atrasados}
                      </span>
                      <span className="px-2 py-0.5 bg-sky-100 border border-sky-700 text-sky-900 font-bold">
                        J: {resumo.justificadas}
                      </span>
                      <span className="px-2 py-0.5 bg-red-100 border border-red-700 text-red-900 font-bold">
                        F: {resumo.faltas}
                      </span>
                      <span className="px-2.5 py-0.5 bg-[#1E1B2E] text-[#FBBF24] border border-black font-black min-w-[54px] text-center">
                        {resumo.percentualFrequencia}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-white border-t-2 border-[#1A181B] flex justify-end">
              <button
                type="button"
                onClick={() => setModalRelatorioAberto(false)}
                className="vintage-button px-4 py-1.5 bg-[#1E1B2E] text-white text-xs uppercase cursor-pointer"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
