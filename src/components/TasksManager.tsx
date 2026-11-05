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
  Edit2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  TarefaPostIt,
  ItemChecklistTarefa,
  calcularProgressoChecklist,
  ordenarTarefasPorUrgencia,
  podeAcionarEquipePronta,
  formatarDataBrasileira,
  atualizarTarefaPostIt,
  removerTarefaPostIt
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
 * - Edição completa e deleção de tarefas do mural;
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
  const [dataAssumir, setDataAssumir] = useState('');
  const [modalEditarData, setModalEditarData] = useState<TarefaPostIt | null>(null);
  const [dataEdicao, setDataEdicao] = useState('');
  const [modalNovoPostIt, setModalNovoPostIt] = useState(false);

  // Estados para edição completa da tarefa
  const [modalEditarTarefa, setModalEditarTarefa] = useState<TarefaPostIt | null>(null);
  const [editTitulo, setEditTitulo] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editCategoria, setEditCategoria] = useState<TarefaPostIt['categoria']>('Apoio');
  const [editResponsavel, setEditResponsavel] = useState('');
  const [editCor, setEditCor] = useState<TarefaPostIt['corPostIt']>('rosa');
  const [editUrgente, setEditUrgente] = useState(false);
  const [editDataFinal, setEditDataFinal] = useState('');

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

  // Sempre exibe todos os post-its juntos ordenados por urgência e depois por data
  const tarefasExibidas = ordenarTarefasPorUrgencia(tarefasFiltradas);

  /**
   * Abre o modal para pegar uma tarefa órfã, pré-preenchendo os dados existentes.
   */
  const abrirModalAssumir = (tarefa: TarefaPostIt) => {
    setModalAssumir(tarefa);
    setNomeVoluntario('');
    setDataAssumir(tarefa.dataFinal || '');
  };

  /**
   * Associa o nome do voluntário e a data de entrega definida à tarefa órfã.
   */
  const handleAssumir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAssumir || !nomeVoluntario.trim()) return;

    setTarefas(prev => prev.map(t => {
      if (t.id === modalAssumir.id) {
        return {
          ...t,
          responsavel: nomeVoluntario.trim(),
          dataFinal: dataAssumir.trim() ? dataAssumir.trim() : t.dataFinal
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
    setDataAssumir('');
  };

  /**
   * Abre o modal rápido para definir ou alterar o prazo de uma tarefa.
   */
  const abrirModalEditarData = (tarefa: TarefaPostIt) => {
    setModalEditarData(tarefa);
    setDataEdicao(tarefa.dataFinal || '');
  };

  /**
   * Salva a nova data da tarefa selecionada.
   */
  const handleSalvarData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEditarData) return;

    setTarefas(prev => prev.map(t => {
      if (t.id === modalEditarData.id) {
        return {
          ...t,
          dataFinal: dataEdicao.trim() ? dataEdicao.trim() : undefined
        };
      }
      return t;
    }));

    setModalEditarData(null);
    setDataEdicao('');
  };

  /**
   * Abre o modal de edição completa para a tarefa selecionada.
   */
  const abrirModalEditarTarefa = (tarefa: TarefaPostIt) => {
    setModalEditarTarefa(tarefa);
    setEditTitulo(tarefa.titulo);
    setEditDescricao(tarefa.descricao);
    setEditCategoria(tarefa.categoria);
    setEditResponsavel(tarefa.responsavel || '');
    setEditCor(tarefa.corPostIt);
    setEditUrgente(!!tarefa.urgente);
    setEditDataFinal(tarefa.dataFinal || '');
  };

  /**
   * Salva as alterações da tarefa em edição.
   */
  const handleSalvarEdicaoTarefa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEditarTarefa || !editTitulo.trim()) return;

    const atualizada: TarefaPostIt = {
      ...modalEditarTarefa,
      titulo: editTitulo.trim(),
      descricao: editDescricao.trim(),
      categoria: editCategoria,
      responsavel: editResponsavel.trim(),
      corPostIt: editCor,
      urgente: editUrgente,
      dataFinal: editDataFinal.trim() ? editDataFinal.trim() : undefined
    };

    setTarefas(prev => atualizarTarefaPostIt(prev, atualizada));
    setModalEditarTarefa(null);
  };

  /**
   * Remove uma tarefa do mural após confirmação do usuário.
   */
  const handleRemoverTarefa = (id: string) => {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;

    const confirmou = window.confirm(`Tem certeza que deseja excluir o post-it "${tarefa.titulo}"?`);
    if (!confirmou) return;

    setTarefas(prev => removerTarefaPostIt(prev, id));
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
          className="vintage-button px-4 py-2 bg-[#E6007E] text-white hover:bg-[#C2006A] text-xs uppercase flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Pregar Novo Post-It</span>
        </button>
      </div>

      {/* Filtros em Estilo Carimbos Coloridos */}
      <div className="flex items-center gap-2 pb-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFiltro('todas')}
          className={`px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#1E1B2E] cursor-pointer ${
            filtro === 'todas'
              ? 'bg-[#581C87] text-[#FBBF24]'
              : 'bg-white text-[#1E1B2E] hover:bg-purple-50'
          }`}
        >
          📌 Todos os Post-its [{tarefas.length}]
        </button>

        <button
          onClick={() => setFiltro('orfas')}
          className={`px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#1E1B2E] cursor-pointer ${
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
                    {/* Carimbos, Cabeçalho e Botões de Ação do Post-it */}
                    <div className="flex items-center justify-between gap-1 mb-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
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

                      {/* Botões de Edição e Deleção da Tarefa */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => abrirModalEditarTarefa(tarefa)}
                          className="p-1 text-stone-600 hover:text-black hover:bg-black/10 transition-colors rounded cursor-pointer"
                          title="Editar post-it"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoverTarefa(tarefa.id)}
                          className="p-1 text-stone-600 hover:text-red-600 hover:bg-black/10 transition-colors rounded cursor-pointer"
                          title="Excluir post-it"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-black text-base text-[#1E1B2E] leading-tight font-mono">
                      {tarefa.titulo}
                    </h3>

                    {/* Badge de Data de Prazo no Post-It (Sempre visível nos post-its) */}
                    <div
                      onClick={() => abrirModalEditarData(tarefa)}
                      className="mt-2 mb-1 flex items-center justify-between gap-1.5 p-1.5 bg-black/5 border border-black/20 font-mono text-xs cursor-pointer hover:bg-black/10 transition-colors shadow-2xs"
                      title="Clique para definir ou alterar o prazo desta missão"
                    >
                      <div className="flex items-center gap-1 text-[11px] font-black uppercase text-[#1E1B2E]">
                        <Calendar className="w-3.5 h-3.5 text-[#E6007E]" />
                        <span>Prazo:</span>
                      </div>
                      <span className={`px-2 py-0.5 font-mono font-black text-[11px] border border-black shadow-[1px_1px_0px_#000] shrink-0 ${
                        tarefa.dataFinal
                          ? tarefa.urgente
                            ? 'bg-red-200 text-red-900 border-red-700'
                            : 'bg-[#FBBF24] text-[#1E1B2E]'
                          : 'bg-stone-200 text-stone-600'
                      }`}>
                        {tarefa.dataFinal ? formatarDataBrasileira(tarefa.dataFinal) : 'Definir Data +'}
                      </span>
                    </div>

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
                                  <span className="block text-[10px] text-stone-600 font-mono font-bold mt-0.5">
                                    📅 Prazo item: {formatarDataBrasileira(item.dataLimite)}
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
                          onClick={() => abrirModalAssumir(tarefa)}
                          className="px-2.5 py-1 bg-[#E6007E] text-white hover:bg-[#C2006A] text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
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

      {/* Modal para Quero Ajudar (Pegar / Assumir Post-it com Prazo) */}
      {modalAssumir && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-sm w-full shadow-[6px_6px_0px_#1E1B2E]">
            <div className="stamp stamp-open text-xs mb-2">Compromisso Carnavalesco</div>
            <h3 className="text-base font-black uppercase text-[#1E1B2E] font-mono">
              Assumir Missão: {modalAssumir.titulo}
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 font-serif">
              Insira seu nome e confirme ou ajuste a data de entrega para organizarmos o cronograma do bloco.
            </p>

            <form onSubmit={handleAssumir} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1 font-mono">
                  Seu Nome / Apelido *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pedro / Nati / Tito"
                  value={nomeVoluntario}
                  onChange={(e) => setNomeVoluntario(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-bold font-mono focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1 font-mono">
                  Prazo / Data Prevista de Conclusão
                </label>
                <input
                  type="date"
                  value={dataAssumir}
                  onChange={(e) => setDataAssumir(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono font-bold focus:outline-none focus:bg-white"
                />
                <span className="text-[10px] text-stone-500 font-mono mt-0.5 block">
                  Esta data será exibida no post-it e usada para ordenar a prioridade no mural.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setModalAssumir(null)}
                  className="px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-bold uppercase hover:bg-stone-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-[#00D287] hover:bg-[#34EEA0] text-[#1E1B2E] text-xs uppercase cursor-pointer"
                >
                  Confirmar Ajuda!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Rápido para Editar Data de qualquer Post-it */}
      {modalEditarData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-5 max-w-sm w-full shadow-[6px_6px_0px_#1E1B2E]">
            <div className="stamp stamp-urgent text-xs mb-2">Cronograma</div>
            <h3 className="text-base font-black uppercase text-[#1E1B2E] font-mono">
              Prazo da Missão
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-3 font-serif">
              Defina ou altere a data final de <strong>{modalEditarData.titulo}</strong>.
            </p>

            <form onSubmit={handleSalvarData} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1 font-mono">
                  Data Limite da Tarefa
                </label>
                <input
                  type="date"
                  value={dataEdicao}
                  onChange={(e) => setDataEdicao(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono font-bold focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setModalEditarData(null)}
                  className="px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-bold uppercase hover:bg-stone-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-[#00D287] hover:bg-[#34EEA0] text-[#1E1B2E] text-xs uppercase cursor-pointer"
                >
                  Salvar Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Edição Completa da Tarefa / Post-it */}
      {modalEditarTarefa && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-md w-full shadow-[6px_6px_0px_#1E1B2E] max-h-[90vh] overflow-y-auto">
            <div className="stamp stamp-urgent text-xs mb-2">Editar Tarefa</div>
            <h3 className="text-base font-black uppercase text-[#1E1B2E]">
              Editar Post-It do Mural
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 font-serif">
              Atualize as informações, o responsável e os prazos desta demanda.
            </p>

            <form onSubmit={handleSalvarEdicaoTarefa} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Título do Recado *</label>
                <input
                  type="text"
                  required
                  value={editTitulo}
                  onChange={(e) => setEditTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Cor do Post-it</label>
                  <select
                    value={editCor}
                    onChange={(e) => setEditCor(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white border-2 border-[#1E1B2E] text-xs font-bold font-mono focus:outline-none"
                  >
                    <option value="rosa">Rosa</option>
                    <option value="verde">Verde</option>
                    <option value="amarelo">Amarelo</option>
                    <option value="azul">Azul</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Prazo Final</label>
                  <input
                    type="date"
                    value={editDataFinal}
                    onChange={(e) => setEditDataFinal(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Categoria</label>
                  <select
                    value={editCategoria}
                    onChange={(e) => setEditCategoria(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white border-2 border-[#1E1B2E] text-xs font-bold font-mono focus:outline-none"
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
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Responsável</label>
                  <input
                    type="text"
                    placeholder="Vazio para Vaga Aberta"
                    value={editResponsavel}
                    onChange={(e) => setEditResponsavel(e.target.value)}
                    className="w-full px-2 py-1.5 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-bold font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editUrgenteCheck"
                  checked={editUrgente}
                  onChange={(e) => setEditUrgente(e.target.checked)}
                  className="w-4 h-4 border-2 border-[#1E1B2E]"
                />
                <label htmlFor="editUrgenteCheck" className="text-xs font-black uppercase text-[#E6007E]">
                  Carimbar como URGENTE!
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setModalEditarTarefa(null)}
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
                  placeholder="Ex: Transportar instrumentos para o ensaio"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Descrição Detalhada *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Precisamos de carro ou van no sábado às 13h..."
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Cor do Post-it</label>
                  <select
                    value={novaCor}
                    onChange={(e) => setNovaCor(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white border-2 border-[#1E1B2E] text-xs font-bold font-mono focus:outline-none"
                  >
                    <option value="rosa">Rosa (Destaque)</option>
                    <option value="verde">Verde (Operacional)</option>
                    <option value="amarelo">Amarelo (Avisos)</option>
                    <option value="azul">Azul (Geral)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Prazo Geral da Missão</label>
                  <input
                    type="date"
                    value={novaDataFinal}
                    onChange={(e) => setNovaDataFinal(e.target.value)}
                    className="w-full px-2 py-1.5 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Categoria</label>
                  <select
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white border-2 border-[#1E1B2E] text-xs font-bold font-mono focus:outline-none"
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
                            className="text-red-500 hover:text-red-700 cursor-pointer"
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
                  className="px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-bold uppercase hover:bg-stone-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-[#E6007E] text-white text-xs uppercase cursor-pointer"
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
