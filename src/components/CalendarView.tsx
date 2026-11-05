'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, MapPin, Clock, Plus, Edit3, Trash2, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  EventoCalendario,
  adicionarEventoCalendario,
  editarEventoCalendario,
  removerEventoCalendario
} from '../data/blocoData';

interface CalendarViewProps {
  eventos: EventoCalendario[];
  setEventos?: React.Dispatch<React.SetStateAction<EventoCalendario[]>>;
  isAdmin: boolean;
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
 * Calendário em Estilo Folhinha / Almanaque de Carnaval do Bloco Bicharada.
 * - Foliões: visualizam as datas oficiais e ensaios filtrados por categoria;
 * - Coordenadores (isAdmin = true): podem cadastrar novas datas, editar ou excluir existentes.
 */
export default function CalendarView({ eventos, setEventos, isAdmin }: CalendarViewProps) {
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
   * Atualiza a data e calcula o dia da semana automaticamente.
   */
  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novaData = e.target.value;
    setFormData(novaData);
    const sigla = calcularSiglaDiaSemana(novaData);
    if (sigla) setFormDiaSemana(sigla);
  };

  /**
   * Remove uma data do calendário oficial após confirmação da coordenação.
   */
  const handleExcluir = (ev: EventoCalendario) => {
    if (!setEventos) return;
    const confirmou = window.confirm(`Deseja realmente excluir a data "${ev.tipo} - ${ev.data}" do calendário oficial?`);
    if (confirmou) {
      setEventos(prev => removerEventoCalendario(prev, ev.id));
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
      // Edição de evento existente
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
      // Inclusão de novo evento
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

  return (
    <div className="space-y-4">
      {/* Banner Principal com Filtros e Ação de Coordenação */}
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
            const partes = ev.data.split('-');
            const diaNum = partes[2] || ev.data;
            const mesNum = partes[1] || '';

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

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <div className="shrink-0 font-mono text-xs font-bold text-[#581C87] flex items-center gap-1 bg-[#F4EEDF] px-2.5 py-1 border border-black shadow-[1px_1px_0px_#000]">
                    <MapPin className="w-3.5 h-3.5 text-[#E6007E]" />
                    <span>{ev.local}</span>
                  </div>

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
      {modalAberto && (
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
    </div>
  );
}
