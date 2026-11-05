'use client';

import React, { useState } from 'react';
import { Plus, CheckSquare, Square, ArrowRight, ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MacrotarefaDesfile, atualizarMacrotarefa, removerMacrotarefa } from '../data/blocoData';

interface ParadeKanbanProps {
  macrotarefas: MacrotarefaDesfile[];
  setMacrotarefas: React.Dispatch<React.SetStateAction<MacrotarefaDesfile[]>>;
  isAdmin: boolean;
}

/**
 * Kanban de Rua do Desfile com as Cores Oficiais da Bicharada.
 * Permite acompanhar, movimentar, editar e excluir as macrotarefas operacionais.
 */
export default function ParadeKanban({ macrotarefas, setMacrotarefas, isAdmin }: ParadeKanbanProps) {
  const [modalNovaMacro, setModalNovaMacro] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoResponsavel, setNovoResponsavel] = useState('');
  const [novaColuna, setNovaColuna] = useState<MacrotarefaDesfile['coluna']>('A Fazer');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [checklistsTexto, setChecklistsTexto] = useState('');

  // Estados para edição de macrotarefa
  const [modalEditarMacro, setModalEditarMacro] = useState<MacrotarefaDesfile | null>(null);
  const [editTitulo, setEditTitulo] = useState('');
  const [editResponsavel, setEditResponsavel] = useState('');
  const [editColuna, setEditColuna] = useState<MacrotarefaDesfile['coluna']>('A Fazer');
  const [editDescricao, setEditDescricao] = useState('');

  const [cardAdicionandoSubitem, setCardAdicionandoSubitem] = useState<string | null>(null);
  const [textoNovoSubitem, setTextoNovoSubitem] = useState('');

  const colunas: MacrotarefaDesfile['coluna'][] = ['A Fazer', 'No Dia do Desfile', 'Concluído na Avenida'];

  /**
   * Alterna a conclusão de um item de checklist da macrotarefa.
   */
  const toggleCheck = (macroId: string, checkId: string) => {
    setMacrotarefas(prev => prev.map(macro => {
      if (macro.id === macroId) {
        const checksAtualizados = macro.checklists.map(c => {
          if (c.id === checkId) return { ...c, concluido: !c.concluido };
          return c;
        });
        return { ...macro, checklists: checksAtualizados };
      }
      return macro;
    }));
  };

  /**
   * Move uma macrotarefa entre as colunas do kanban de tarefas em andamento.
   */
  const moverColuna = (macroId: string, direcao: 'avancar' | 'voltar') => {
    setMacrotarefas(prev => prev.map(macro => {
      if (macro.id === macroId) {
        const idxAtual = colunas.indexOf(macro.coluna);
        const novoIdx = direcao === 'avancar' ? Math.min(colunas.length - 1, idxAtual + 1) : Math.max(0, idxAtual - 1);
        return { ...macro, coluna: colunas[novoIdx] };
      }
      return macro;
    }));

    if (direcao === 'avancar') {
      confetti({
        particleCount: 25,
        spread: 40,
        colors: ['#00D287', '#E6007E', '#FBBF24']
      });
    }
  };

  /**
   * Adiciona uma nova etapa/subitem na checklist da macrotarefa.
   */
  const handleAddSubitem = (macroId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!textoNovoSubitem.trim()) return;

    setMacrotarefas(prev => prev.map(macro => {
      if (macro.id === macroId) {
        return {
          ...macro,
          checklists: [
            ...macro.checklists,
            {
              id: `c-${Date.now()}`,
              texto: textoNovoSubitem.trim(),
              concluido: false
            }
          ]
        };
      }
      return macro;
    }));

    setTextoNovoSubitem('');
    setCardAdicionandoSubitem(null);
  };

  /**
   * Cria uma nova macrotarefa com múltiplos itens de checklist.
   */
  const handleCriarMacro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim()) return;

    const linhas = checklistsTexto.split('\n').filter(l => l.trim().length > 0);
    const checks = linhas.map((linha, i) => ({
      id: `c-new-${Date.now()}-${i}`,
      texto: linha.trim(),
      concluido: false
    }));

    const nova: MacrotarefaDesfile = {
      id: `macro-${Date.now()}`,
      titulo: novoTitulo.trim(),
      coluna: novaColuna,
      responsavelPrincipal: novoResponsavel.trim() || 'Apoio Geral',
      descricao: novaDescricao.trim() || undefined,
      checklists: checks.length > 0 ? checks : [{ id: `c-${Date.now()}`, texto: 'Planejar execução', concluido: false }]
    };

    setMacrotarefas(prev => [...prev, nova]);
    setModalNovaMacro(false);
    setNovoTitulo('');
    setNovoResponsavel('');
    setNovaDescricao('');
    setChecklistsTexto('');

    confetti({
      particleCount: 40,
      spread: 60,
      colors: ['#E6007E', '#00D287']
    });
  };

  /**
   * Abre o modal de edição para a macrotarefa selecionada.
   */
  const abrirModalEditarMacro = (macro: MacrotarefaDesfile) => {
    setModalEditarMacro(macro);
    setEditTitulo(macro.titulo);
    setEditResponsavel(macro.responsavelPrincipal);
    setEditColuna(macro.coluna);
    setEditDescricao(macro.descricao || '');
  };

  /**
   * Salva as alterações da macrotarefa em edição.
   */
  const handleSalvarEdicaoMacro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEditarMacro || !editTitulo.trim()) return;

    const atualizada: MacrotarefaDesfile = {
      ...modalEditarMacro,
      titulo: editTitulo.trim(),
      responsavelPrincipal: editResponsavel.trim() || 'Apoio Geral',
      coluna: editColuna,
      descricao: editDescricao.trim() || undefined
    };

    setMacrotarefas(prev => atualizarMacrotarefa(prev, atualizada));
    setModalEditarMacro(null);
  };

  /**
   * Remove uma macrotarefa após confirmação do usuário.
   */
  const handleRemoverMacro = (id: string) => {
    const macro = macrotarefas.find(m => m.id === id);
    if (!macro) return;

    const confirmou = window.confirm(`Tem certeza que deseja excluir a macrotarefa "${macro.titulo}"?`);
    if (!confirmou) return;

    setMacrotarefas(prev => removerMacrotarefa(prev, id));
  };

  return (
    <div className="space-y-4">
      {/* Banner Principal */}
      <div className="vintage-card p-5 border-l-8 border-[#E6007E]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="stamp stamp-urgent text-xs">Operação Carnavalesca</span>
              <span className="font-mono text-xs font-bold text-stone-600">Kombi Cora • 08/02/2027</span>
            </div>
            <h2 className="text-2xl font-black uppercase text-[#1E1B2E] font-mono leading-tight">
              Tarefas em Andamento 🚐
            </h2>
            <p className="text-xs text-stone-700 mt-1 max-w-lg font-serif">
              Quadro kanban de macrotarefas com checklists em execução para o cortejo e o suporte móvel da Kombi Cora.
            </p>
          </div>

          <button
            onClick={() => setModalNovaMacro(true)}
            className="vintage-button px-4 py-2 bg-[#E6007E] text-white hover:bg-[#C2006A] text-xs uppercase flex items-center gap-1.5 shrink-0 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Macrotarefa</span>
          </button>
        </div>
      </div>

      {/* Kanban de Rua (3 Colunas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {colunas.map((coluna) => {
          const cardsDaColuna = macrotarefas.filter(m => m.coluna === coluna);
          const bgHeader = coluna === 'A Fazer' 
            ? 'bg-[#581C87] text-[#FBBF24]' 
            : coluna === 'No Dia do Desfile' 
            ? 'bg-[#E6007E] text-white' 
            : 'bg-[#00D287] text-[#1E1B2E]';

          return (
            <div key={coluna} className="bg-stone-50 border-2 border-[#1E1B2E] shadow-[3px_3px_0px_#1E1B2E] flex flex-col min-h-[460px]">
              {/* Cabeçalho */}
              <div className={`p-3 border-b-2 border-[#1E1B2E] flex items-center justify-between font-mono font-black text-xs uppercase ${bgHeader}`}>
                <span>{coluna}</span>
                <span className="px-1.5 py-0.2 bg-black/20 border border-black/40 text-[10px]">
                  {cardsDaColuna.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-3 space-y-3 flex-1">
                {cardsDaColuna.length === 0 ? (
                  <div className="p-6 text-center text-xs font-mono text-stone-400 border border-dashed border-stone-300 mt-2">
                    Nenhum card nesta etapa.
                  </div>
                ) : (
                  cardsDaColuna.map((macro) => {
                    const totalChecks = macro.checklists.length;
                    const concluidos = macro.checklists.filter(c => c.concluido).length;
                    const percentual = totalChecks > 0 ? Math.round((concluidos / totalChecks) * 100) : 0;

                    return (
                      <div
                        key={macro.id}
                        className="bg-white border-2 border-[#1E1B2E] p-3.5 shadow-[3px_3px_0px_#1E1B2E] space-y-2.5"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono text-[10px] font-black uppercase bg-[#FBBF24] text-[#1E1B2E] px-1.5 py-0.2 border border-black truncate">
                              Resp: {macro.responsavelPrincipal}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="font-mono text-[10px] font-bold text-stone-500">
                                {concluidos}/{totalChecks}
                              </span>
                              <button
                                type="button"
                                onClick={() => abrirModalEditarMacro(macro)}
                                className="p-0.5 text-stone-500 hover:text-black transition-colors cursor-pointer"
                                title="Editar macrotarefa"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoverMacro(macro.id)}
                                className="p-0.5 text-stone-500 hover:text-red-600 transition-colors cursor-pointer"
                                title="Excluir macrotarefa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h3 className="font-black text-sm text-[#1E1B2E] font-mono leading-tight">
                            {macro.titulo}
                          </h3>

                          {macro.descricao && (
                            <p className="text-[11px] text-stone-600 font-serif mt-1">
                              {macro.descricao}
                            </p>
                          )}
                        </div>

                        {/* Barra de Progresso */}
                        <div className="w-full h-1.5 bg-stone-200 border border-black">
                          <div
                            className="h-full bg-[#00D287] transition-all"
                            style={{ width: `${percentual}%` }}
                          />
                        </div>

                        {/* Checklist */}
                        <div className="space-y-1.5 pt-1">
                          {macro.checklists.map((check) => (
                            <div
                              key={check.id}
                              onClick={() => toggleCheck(macro.id, check.id)}
                              className="flex items-start gap-2 text-xs font-mono cursor-pointer hover:bg-stone-50 p-1 border border-transparent hover:border-stone-200"
                            >
                              <button type="button" className="mt-0.5 shrink-0">
                                {check.concluido ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-[#00A868]" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-stone-400" />
                                )}
                              </button>
                              <span className={`leading-tight ${check.concluido ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                                {check.texto}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Adicionar subitem */}
                        {cardAdicionandoSubitem === macro.id ? (
                          <form onSubmit={(e) => handleAddSubitem(macro.id, e)} className="pt-1 flex gap-1">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Nova sub-tarefa..."
                              value={textoNovoSubitem}
                              onChange={(e) => setTextoNovoSubitem(e.target.value)}
                              className="flex-1 px-2 py-1 bg-stone-50 border border-black text-xs font-mono focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="px-2 py-1 bg-[#1E1B2E] text-white text-[10px] font-black uppercase cursor-pointer"
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => setCardAdicionandoSubitem(null)}
                              className="px-1.5 py-1 text-stone-500 text-[10px] cursor-pointer"
                            >
                              ✕
                            </button>
                          </form>
                        ) : (
                          <button
                            onClick={() => setCardAdicionandoSubitem(macro.id)}
                            className="text-[10px] font-mono font-bold text-[#E6007E] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Adicionar item na checklist</span>
                          </button>
                        )}

                        {/* Mover Coluna */}
                        <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[10px] font-mono font-black">
                          {coluna !== 'A Fazer' ? (
                            <button
                              onClick={() => moverColuna(macro.id, 'voltar')}
                              className="flex items-center gap-1 text-stone-600 hover:text-black uppercase cursor-pointer"
                            >
                              <ArrowLeft className="w-3 h-3" /> Voltar
                            </button>
                          ) : <div />}

                          {coluna !== 'Concluído na Avenida' && (
                            <button
                              onClick={() => moverColuna(macro.id, 'avancar')}
                              className="flex items-center gap-1 text-[#00A868] hover:text-[#008f58] uppercase cursor-pointer"
                            >
                              Avançar <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Editar Macrotarefa */}
      {modalEditarMacro && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-md w-full shadow-[6px_6px_0px_#1E1B2E]">
            <div className="stamp stamp-urgent text-xs mb-2">Desfile 2027</div>
            <h3 className="text-base font-black uppercase text-[#1E1B2E]">
              Editar Macrotarefa do Desfile
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 font-serif">
              Atualize o título, o responsável e a coluna operacional desta missão.
            </p>

            <form onSubmit={handleSalvarEdicaoMacro} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Título da Macrotarefa *</label>
                <input
                  type="text"
                  required
                  value={editTitulo}
                  onChange={(e) => setEditTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Coluna / Etapa</label>
                  <select
                    value={editColuna}
                    onChange={(e) => setEditColuna(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono"
                  >
                    <option value="A Fazer">A Fazer</option>
                    <option value="No Dia do Desfile">No Dia do Desfile</option>
                    <option value="Concluído na Avenida">Concluído na Avenida</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Responsável Principal</label>
                  <input
                    type="text"
                    value={editResponsavel}
                    onChange={(e) => setEditResponsavel(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setModalEditarMacro(null)}
                  className="px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-bold uppercase hover:bg-stone-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-[#00D287] hover:bg-[#34EEA0] text-[#1E1B2E] text-xs uppercase cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nova Macrotarefa */}
      {modalNovaMacro && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-md w-full shadow-[6px_6px_0px_#1E1B2E]">
            <div className="stamp stamp-urgent text-xs mb-2">Desfile 2027</div>
            <h3 className="text-base font-black uppercase text-[#1E1B2E]">
              Criar Nova Macrotarefa do Desfile
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 font-serif">
              Crie uma missão de rua e defina os itens da sua checklist operacional.
            </p>

            <form onSubmit={handleCriarMacro} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Título da Macrotarefa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Abastecimento de Água da Bateria"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Detalhes operacionais sobre a Kombi ou o trajeto..."
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Coluna Inicial</label>
                  <select
                    value={novaColuna}
                    onChange={(e) => setNovaColuna(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono"
                  >
                    <option value="A Fazer">A Fazer</option>
                    <option value="No Dia do Desfile">No Dia do Desfile</option>
                    <option value="Concluído na Avenida">Concluído na Avenida</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Responsável Principal</label>
                  <input
                    type="text"
                    placeholder="Ex: Bel R. / Tito"
                    value={novoResponsavel}
                    onChange={(e) => setNovoResponsavel(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Itens da Checklist (um por linha)
                </label>
                <textarea
                  rows={3}
                  value={checklistsTexto}
                  onChange={(e) => setChecklistsTexto(e.target.value)}
                  placeholder={`Comprar 10 fardos de água mineral\nCarregar na Kombi Cora\nDistribuir no km 2 do cortejo`}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setModalNovaMacro(false)}
                  className="px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-bold uppercase hover:bg-stone-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-[#E6007E] text-white text-xs uppercase cursor-pointer"
                >
                  Salvar Macrotarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
