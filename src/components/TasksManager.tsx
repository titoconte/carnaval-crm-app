'use client';

import React, { useState } from 'react';
import {
  Pin,
  AlertTriangle,
  Plus,
  Users,
  Calendar,
  CheckSquare,
  Square,
  Sparkles,
  Trash2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  TarefaPostIt,
  ItemChecklistTarefa,
  calcularProgressoChecklist,
  ordenarTarefasPorUrgencia,
  podeAcionarEquipePronta
} from '../data/blocoData';

interface TasksManagerProps {
  tarefas: TarefaPostIt[];
  setTarefas: React.Dispatch<React.SetStateAction<TarefaPostIt[]>>;
  isAdmin: boolean;
  onEquipePronta?: (tarefa: TarefaPostIt) => void;
}

/**
 * Mural Comunitário de Tarefas e Apoio do Bloco Bicharada.
 * Estilo Quadro de Cortiça com Post-its vivos.
 * Funcionalidades:
 * - "Quero Ajudar" para assumir tarefas órfãs;
 * - Checklists individuais com datas limites por item e % de progresso da tarefa;
 * - Data final global da tarefa;
 * - Botão "Equipe Pronta" que transfere a tarefa para a aba Tarefas em Andamento (Desfile).
 */
export default function TasksManager({
  tarefas,
  setTarefas,
  isAdmin,
  onEquipePronta
}: TasksManagerProps) {
  const [filtro, setFiltro] = useState<'todas' | 'orfas' | 'andamento'>('todas');
  const [modalAssumir, setModalAssumir] = useState<TarefaPostIt | null>(null);
  const [nomeVoluntario, setNomeVoluntario] = useState('');
  const [modalNovoPostIt, setModalNovoPostIt] = useState(false);

  // Estados do formulário de novo Post-it
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novaCategoria, setNovaCategoria] = useState<TarefaPostIt['categoria']>('Apoio');
  const [novoResponsavel, setNovoResponsavel] = useState('');
  const [novaCor, setNovaCor] = useState<TarefaPostIt['corPostIt']>('rosa');
  const [novoUrgente, setNovoUrgente] = useState(false);
  const [novaDataFinal, setNovaDataFinal] = useState('');

  // Checklist dinâmica no cadastro
  const [checklistTemp, setChecklistTemp] = useState<{ id: string; texto: string; dataLimite?: string }[]>([]);
  const [itemTexto, setItemTexto] = useState('');
  const [itemData, setItemData] = useState('');

  const isOrfa = (t: TarefaPostIt) => !podeAcionarEquipePronta(t);

  const tarefasFiltradas = tarefas.filter(t => {
    if (filtro === 'orfas') return isOrfa(t);
    return true;
  });

  // Sempre exibe todos os post-its juntos ordenados com urgentes no topo
  const tarefasExibidas = ordenarTarefasPorUrgencia(tarefasFiltradas);

  /**
   * Associa o nome de um folião voluntário à tarefa órfã selecionada.
   */
  const handleAssumir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAssumir || !nomeVoluntario.trim()) return;

    setTarefas(prev => prev.map(t => {
      if (t.id === modalAssumir.id) {
        return {
          ...t,
          responsavel: nomeVoluntario.trim()
        };
      }
      return t;
    }));

    confetti({
      particleCount: 50,
      spread: 70,
      colors: ['#00D287', '#E6007E', '#FBBF24']
    });

    setModalAssumir(null);
    setNomeVoluntario('');
  };

  /**
   * Adiciona um item à checklist no formulário de criação de novo post-it.
   */
  const handleAdicionarItemChecklist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!itemTexto.trim()) return;

    setChecklistTemp(prev => [
      ...prev,
      {
        id: `chk-new-${Date.now()}-${prev.length}`,
        texto: itemTexto.trim(),
        dataLimite: itemData ? itemData : undefined
      }
    ]);

    setItemTexto('');
    setItemData('');
  };

  /**
   * Remove um item da checklist temporária.
   */
  const handleRemoverItemChecklist = (id: string) => {
    setChecklistTemp(prev => prev.filter(item => item.id !== id));
  };

  /**
   * Cria um novo post-it com checklist opcional, percentual e prazos.
   */
  const handleCriarPostIt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim()) return;

    const itensConvertidos: ItemChecklistTarefa[] = checklistTemp.map(item => ({
      id: item.id,
      texto: item.texto,
      dataLimite: item.dataLimite,
      concluido: false
    }));

    const nova: TarefaPostIt = {
      id: `post-${Date.now()}`,
      titulo: novoTitulo.trim(),
      descricao: novaDescricao.trim(),
      categoria: novaCategoria,
      responsavel: novoResponsavel.trim(),
      corPostIt: novaCor,
      urgente: novoUrgente,
      concluida: false,
      dataFinal: novaDataFinal ? novaDataFinal : undefined,
      checklists: itensConvertidos.length > 0 ? itensConvertidos : undefined
    };

    setTarefas(prev => [nova, ...prev]);
    setModalNovoPostIt(false);
    setNovoTitulo('');
    setNovaDescricao('');
    setNovoResponsavel('');
    setNovaDataFinal('');
    setChecklistTemp([]);

    confetti({
      particleCount: 40,
      spread: 60,
      colors: ['#E6007E', '#00D287', '#FBBF24']
    });
  };

  /**
   * Alterna a conclusão de um item de checklist individual de um post-it.
   */
  const toggleItemChecklist = (tarefaId: string, itemId: string) => {
    setTarefas(prev => prev.map(t => {
      if (t.id === tarefaId && t.checklists) {
        const atualizados = t.checklists.map(c => {
          if (c.id === itemId) return { ...c, concluido: !c.concluido };
          return c;
        });
        return { ...t, checklists: atualizados };
      }
      return t;
    }));
  };

  /**
   * Dispara o fluxo "Equipe Pronta", promovendo a tarefa para a aba de Tarefas em Andamento (Desfile).
   * Regra: Só permite disparar quando a tarefa já possui dono/responsável atribuído.
   */
  const handleEquipePronta = (tarefa: TarefaPostIt) => {
    if (!podeAcionarEquipePronta(tarefa)) return;

    if (onEquipePronta) {
      onEquipePronta(tarefa);
    }

    confetti({
      particleCount: 60,
      spread: 80,
      colors: ['#00D287', '#E6007E', '#581C87']
    });
  };

  // Cores vivas dos post-its alinhadas à identidade visual
  const corFundoMap = {
    rosa: 'bg-[#FDF2F8] border-2 border-[#E6007E] text-[#1E1B2E] shadow-[4px_4px_0px_#E6007E]',
    verde: 'bg-[#ECFDF5] border-2 border-[#00D287] text-[#1E1B2E] shadow-[4px_4px_0px_#00A868]',
    amarelo: 'bg-[#FEFCE8] border-2 border-[#FBBF24] text-[#1E1B2E] shadow-[4px_4px_0px_#CA8A04]',
    azul: 'bg-[#FAF5FF] border-2 border-[#6C2BD9] text-[#1E1B2E] shadow-[4px_4px_0px_#581C87]'
  };

  return (
    <div className="space-y-4">
      {/* Barra de Ações do Mural */}
      <div className="vintage-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black uppercase text-[#1E1B2E] flex items-center gap-2">
            <Pin className="w-5 h-5 text-[#E6007E]" />
            <span>Mural de Recados & Apoio da Bicharada</span>
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Quadro comunitário: ofereça ajuda nas tarefas abertas ou monte um plano com checklist e prazos!
          </p>
        </div>

        <button
          onClick={() => setModalNovoPostIt(true)}
          className="vintage-button px-4 py-2 bg-[#E6007E] text-white hover:bg-[#C2006A] text-xs uppercase flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Pregar Novo Post-It</span>
        </button>
      </div>

      {/* Filtros em Estilo Carimbos Coloridos */}
      <div className="flex items-center gap-2 pb-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFiltro('todas')}
          className={`px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#1E1B2E] ${
            filtro === 'todas'
              ? 'bg-[#581C87] text-[#FBBF24]'
              : 'bg-white text-[#1E1B2E] hover:bg-purple-50'
          }`}
        >
          📌 Todos os Post-its [{tarefas.length}]
        </button>

        <button
          onClick={() => setFiltro('orfas')}
          className={`px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#1E1B2E] ${
            filtro === 'orfas'
              ? 'bg-[#E6007E] text-white'
              : 'bg-white text-[#1E1B2E] hover:bg-pink-50'
          }`}
        >
          🚨 Vagas Abertas (Órfãs) [{tarefas.filter(t => isOrfa(t)).length}]
        </button>
      </div>

      {/* Quadro de Cortiça Visual com Cores Carnavalescas */}
      <div className="cork-texture p-4 sm:p-6 rounded-2xl min-h-[420px]">
        {tarefasExibidas.length === 0 ? (
          <div className="bg-white border-2 border-[#1E1B2E] p-8 text-center max-w-sm mx-auto shadow-[4px_4px_0px_#1E1B2E] rotate-[-1deg]">
            <p className="font-mono text-sm font-black uppercase text-[#1E1B2E]">
              Nenhum bilhete pregado nesta seção no momento!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-3">
            {tarefasExibidas.map((tarefa, idx) => {
              const semDono = isOrfa(tarefa);
              const rotation = idx % 3 === 0 ? '-rotate-1' : idx % 3 === 1 ? 'rotate-1' : 'rotate-[-0.5deg]';
              const temChecklist = tarefa.checklists && tarefa.checklists.length > 0;
              const progresso = temChecklist ? calcularProgressoChecklist(tarefa.checklists) : 0;

              return (
                <div
                  key={tarefa.id}
                  className={`tape-top relative p-4 transition-transform hover:scale-[1.02] flex flex-col justify-between ${
                    corFundoMap[tarefa.corPostIt]
                  } ${rotation}`}
                >
                  <div>
                    {/* Carimbos e Cabeçalho do Post-it */}
                    <div className="flex items-center justify-between gap-1 mb-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-black/10 px-2 py-0.5 border border-black/30 font-mono">
                        {tarefa.categoria}
                      </span>

                      {tarefa.urgente && (
                        <span className="stamp stamp-urgent text-[10px]">
                          Urgente!
                        </span>
                      )}

                      {semDono && (
                        <span className="stamp stamp-open text-[10px]">
                          Vaga Aberta
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-base text-[#1E1B2E] leading-tight font-mono">
                      {tarefa.titulo}
                    </h3>

                    {tarefa.dataFinal && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] font-mono font-bold text-red-700 bg-red-50/60 px-1.5 py-0.5 border border-red-200">
                        <Clock className="w-3 h-3" />
                        <span>Data Final: {tarefa.dataFinal}</span>
                      </div>
                    )}

                    <p className="text-xs text-stone-800 mt-2 font-serif leading-relaxed">
                      {tarefa.descricao}
                    </p>

                    {/* Exibição e Interação da Checklist com % de Conclusão */}
                    {temChecklist && (
                      <div className="mt-3 pt-2 border-t border-black/15">
                        <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1">
                          <span className="flex items-center gap-1">
                            <CheckSquare className="w-3 h-3 text-[#581C87]" />
                            Checklist da Tarefa:
                          </span>
                          <span className="text-[#00A868] font-black">{progresso}% concluído</span>
                        </div>

                        {/* Barra de Progresso */}
                        <div className="w-full h-2 bg-white border border-black mb-2 shadow-[1px_1px_0px_#000]">
                          <div
                            className="h-full bg-gradient-to-r from-[#FBBF24] to-[#00D287]"
                            style={{ width: `${progresso}%` }}
                          />
                        </div>

                        <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
                          {tarefa.checklists!.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => toggleItemChecklist(tarefa.id, item.id)}
                              className="flex items-start gap-1.5 text-xs font-mono cursor-pointer hover:bg-black/5 p-1 rounded transition-colors"
                            >
                              {item.concluido ? (
                                <CheckSquare className="w-3.5 h-3.5 text-[#00A868] shrink-0 mt-0.5" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <span className={item.concluido ? 'line-through text-stone-500' : 'text-stone-900'}>
                                  {item.texto}
                                </span>
                                {item.dataLimite && (
                                  <span className="block text-[10px] text-stone-600 font-sans italic">
                                    Prazo: {item.dataLimite}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rodapé do Post-it */}
                  <div className="mt-4 pt-3 border-t-2 border-[#1E1B2E]/20 flex items-center justify-between gap-2 flex-wrap">
                    <div className="text-xs font-bold text-[#1E1B2E]">
                      {semDono ? (
                        <span className="text-[#E6007E] font-black underline uppercase text-[11px]">
                          Sem Dono!
                        </span>
                      ) : (
                        <span className="text-stone-700 text-[11px]">
                          Resp: <strong>{tarefa.responsavel}</strong>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                      {/* Botão Quero Ajudar */}
                      {semDono && (
                        <button
                          onClick={() => setModalAssumir(tarefa)}
                          className="px-2.5 py-1 bg-[#E6007E] text-white hover:bg-[#C2006A] text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                        >
                          Quero Ajudar!
                        </button>
                      )}

                      {/* Botão Equipe Pronta (só habilitado quando tiver dono) */}
                      {(() => {
                        const podeEquipe = podeAcionarEquipePronta(tarefa);
                        return (
                          <button
                            type="button"
                            disabled={!podeEquipe}
                            onClick={() => podeEquipe && handleEquipePronta(tarefa)}
                            className={`px-2.5 py-1 text-[10px] font-black uppercase border border-black flex items-center gap-1 transition-all ${
                              podeEquipe
                                ? 'bg-[#00D287] hover:bg-[#34EEA0] text-[#1E1B2E] shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer'
                                : 'bg-stone-300 text-stone-500 border-stone-400 opacity-60 cursor-not-allowed shadow-none'
                            }`}
                            title={
                              podeEquipe
                                ? 'Equipe mobilizada: passar para Tarefas em Andamento'
                                : 'Defina um responsável antes de acionar Equipe Pronta'
                            }
                          >
                            <Users className="w-3 h-3" />
                            <span>Equipe Pronta</span>
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para Quero Ajudar (Assumir Post-it) */}
      {modalAssumir && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-sm w-full shadow-[6px_6px_0px_#1E1B2E]">
            <div className="stamp stamp-open text-xs mb-2">Compromisso Carnavalesco</div>
            <h3 className="text-base font-black uppercase text-[#1E1B2E]">
              Ajudar na Missão: {modalAssumir.titulo}
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 font-serif">
              Coloque seu nome ou apelido para registrarmos você como responsável no mural do bloco.
            </p>

            <form onSubmit={handleAssumir} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Seu Nome / Apelido *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pedro / Nati / Tito"
                  value={nomeVoluntario}
                  onChange={(e) => setNomeVoluntario(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-bold font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAssumir(null)}
                  className="px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-bold uppercase hover:bg-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-[#00D287] text-[#1E1B2E] text-xs uppercase"
                >
                  Confirmar Ajuda!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Pregar Novo Post-It com Checklists e Prazos */}
      {modalNovoPostIt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-md w-full shadow-[6px_6px_0px_#1E1B2E] max-h-[90vh] overflow-y-auto">
            <div className="stamp stamp-urgent text-xs mb-2">Novo Bilhete de Apoio</div>
            <h3 className="text-base font-black uppercase text-[#1E1B2E]">
              Pregar Demanda no Mural
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 font-serif">
              Configure os detalhes da missão, checklists operacionais e prazos finais.
            </p>

            <form onSubmit={handleCriarPostIt} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Título do Recado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Buscar fitas de cetim para os adereços"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-bold font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Instruções / Detalhes</label>
                <textarea
                  rows={2}
                  placeholder="Como fazer, local de entrega, etc..."
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-serif focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Data Final da Tarefa</label>
                  <input
                    type="date"
                    value={novaDataFinal}
                    onChange={(e) => setNovaDataFinal(e.target.value)}
                    className="w-full px-2 py-1.5 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Cor do Post-it</label>
                  <select
                    value={novaCor}
                    onChange={(e) => setNovaCor(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white border-2 border-[#1E1B2E] text-xs font-bold"
                  >
                    <option value="rosa">Rosa Choque (#E6007E)</option>
                    <option value="verde">Verde Menta (#00D287)</option>
                    <option value="amarelo">Amarelo Dourado (#FBBF24)</option>
                    <option value="azul">Lavanda (#6C2BD9)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Categoria</label>
                  <select
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white border-2 border-[#1E1B2E] text-xs font-bold"
                  >
                    <option value="Apoio">Apoio</option>
                    <option value="Logística">Logística</option>
                    <option value="Produção">Produção</option>
                    <option value="Fantasias">Fantasias</option>
                    <option value="Música">Música</option>
                    <option value="Comunicação">Comunicação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                    Responsável (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Vazio para Vaga Aberta"
                    value={novoResponsavel}
                    onChange={(e) => setNovoResponsavel(e.target.value)}
                    className="w-full px-2 py-1.5 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-bold font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Seção de Checklist da Tarefa */}
              <div className="pt-2 border-t border-stone-200">
                <label className="block text-xs font-black uppercase text-[#581C87] mb-1">
                  Adicionar Itens na Checklist (com Data por Tarefa)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Etapa ou sub-tarefa..."
                    value={itemTexto}
                    onChange={(e) => setItemTexto(e.target.value)}
                    className="flex-1 px-2 py-1 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono"
                  />
                  <input
                    type="date"
                    value={itemData}
                    onChange={(e) => setItemData(e.target.value)}
                    className="w-32 px-1 py-1 bg-stone-50 border-2 border-[#1E1B2E] text-[11px] font-mono"
                    title="Data limite para este item da checklist"
                  />
                  <button
                    onClick={handleAdicionarItemChecklist}
                    className="px-2.5 py-1 bg-[#00D287] text-[#1E1B2E] text-xs font-black uppercase border border-black shadow-[1px_1px_0px_#000]"
                  >
                    +
                  </button>
                </div>

                {checklistTemp.length > 0 && (
                  <div className="space-y-1 bg-stone-100 p-2 border border-stone-300 max-h-32 overflow-y-auto">
                    {checklistTemp.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs font-mono bg-white p-1 border">
                        <span className="truncate">{item.texto}</span>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {item.dataLimite && (
                            <span className="text-[10px] text-stone-500 font-sans">{item.dataLimite}</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoverItemChecklist(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="urgenteCheck"
                  checked={novoUrgente}
                  onChange={(e) => setNovoUrgente(e.target.checked)}
                  className="w-4 h-4 border-2 border-[#1E1B2E]"
                />
                <label htmlFor="urgenteCheck" className="text-xs font-black uppercase text-[#E6007E]">
                  Carimbar como URGENTE!
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setModalNovoPostIt(false)}
                  className="px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-bold uppercase hover:bg-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-[#E6007E] text-white text-xs uppercase"
                >
                  Pregar Bilhete!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
