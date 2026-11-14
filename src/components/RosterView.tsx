'use client';

import React, { useState } from 'react';
import { Users, UserPlus, UserMinus, Search, Trash2, Edit2, Music, Theater, ClipboardList } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Integrante,
  GrandeGrupoElenco,
  SetorElenco,
  SETORES_ELENCO,
  CATEGORIAS_POR_SETOR,
  MACROCATEGORIAS_ELENCO,
  agruparElencoPorMacrocategoria,
  obterSetorDoGrupo,
  removerIntegranteElenco,
  atualizarIntegranteElenco,
  podeEditarIntegranteElenco
} from '../data/blocoData';

interface RosterViewProps {
  integrantes: Integrante[];
  setIntegrantes: React.Dispatch<React.SetStateAction<Integrante[]>>;
  isAdmin?: boolean;
}

/**
 * Visualização do Elenco e Naipes em 3 Abas:
 * 1. Música (Bateria, Sopros, Vozes, Outros Instrumentos)
 * 2. Performance (Brincantes, Pernaltas, Dança e Carro Alegórico)
 * 3. Organização (Organização, Apoio e Produção)
 * 
 * Permite a inserção e a edição de integrantes para todos os usuários do bloco,
 * mantendo apenas a deleção restrita aos coordenadores (isAdmin).
 */
export default function RosterView({ integrantes, setIntegrantes, isAdmin = false }: RosterViewProps) {
  const podeEditar = podeEditarIntegranteElenco(isAdmin ? 'coordenador' : 'bicho');
  const [search, setSearch] = useState('');
  const [setorAtivo, setSetorAtivo] = useState<SetorElenco>('Música');
  const [modalNovo, setModalNovo] = useState(false);
  const [modalRemover, setModalRemover] = useState(false);
  const [integranteParaRemoverId, setIntegranteParaRemoverId] = useState<string>('');

  // Estados para edição de integrante existente (disponível para todos os usuários)
  const [modalEditar, setModalEditar] = useState(false);
  const [integranteEmEdicao, setIntegranteEmEdicao] = useState<Integrante | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editGrandeGrupo, setEditGrandeGrupo] = useState<GrandeGrupoElenco>('Bateria');
  const [editInstrumentoOuFuncao, setEditInstrumentoOuFuncao] = useState('');
  const [editObservacao, setEditObservacao] = useState('');
  const [editAtivo, setEditAtivo] = useState(true);

  // Form states para adição rápida de novos integrantes
  const [nome, setNome] = useState('');
  const [grandeGrupo, setGrandeGrupo] = useState<GrandeGrupoElenco>('Bateria');
  const [instrumentoOuFuncao, setInstrumentoOuFuncao] = useState('Caixa');
  const [observacao, setObservacao] = useState('');

  /**
   * Adiciona um novo folião diretamente à lista do elenco oficial.
   */
  const handleAddIntegrante = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !instrumentoOuFuncao.trim()) return;

    const novo: Integrante = {
      id: `int-${Date.now()}`,
      nome: nome.trim(),
      grandeGrupo,
      instrumentoOuFuncao: instrumentoOuFuncao.trim(),
      observacao: observacao.trim() || undefined,
      ativo: true
    };

    setIntegrantes(prev => [novo, ...prev]);
    setSetorAtivo(obterSetorDoGrupo(grandeGrupo));
    setModalNovo(false);
    setNome('');
    setObservacao('');

    confetti({
      particleCount: 40,
      spread: 60,
      colors: ['#00D287', '#E6007E', '#FBBF24']
    });
  };

  /**
   * Remove um integrante do elenco oficial com pedido de confirmação.
   * 
   * @param id - Identificador do integrante a ser excluído
   */
  const handleRemoverIntegrante = (id: string) => {
    const alvo = integrantes.find(i => i.id === id);
    if (!alvo) return;

    const confirmou = window.confirm(
      `Tem certeza que deseja remover "${alvo.nome}" (${alvo.grandeGrupo} - ${alvo.instrumentoOuFuncao}) do elenco?`
    );
    if (!confirmou) return;

    setIntegrantes(prev => removerIntegranteElenco(prev, id));
    if (modalRemover) {
      setModalRemover(false);
    }
  };

  /**
   * Abre o modal de edição preenchendo os dados do integrante selecionado.
   * 
   * @param integrante - Integrante do elenco a ser editado
   */
  const abrirModalEditar = (integrante: Integrante) => {
    setIntegranteEmEdicao(integrante);
    setEditNome(integrante.nome);
    setEditGrandeGrupo(integrante.grandeGrupo);
    setEditInstrumentoOuFuncao(integrante.instrumentoOuFuncao);
    setEditObservacao(integrante.observacao || '');
    setEditAtivo(integrante.ativo !== false);
    setModalEditar(true);
  };

  /**
   * Atualiza a seleção do integrante a editar a partir do dropdown do modal.
   * 
   * @param id - Identificador do integrante escolhido no menu
   */
  const handleSelecionarIntegranteParaEdicao = (id: string) => {
    const alvo = integrantes.find(i => i.id === id);
    if (alvo) {
      abrirModalEditar(alvo);
    }
  };

  /**
   * Salva as alterações efetuadas pelo usuário nos dados do integrante do elenco.
   */
  const handleSalvarEdicaoIntegrante = (e: React.FormEvent) => {
    e.preventDefault();
    if (!integranteEmEdicao || !editNome.trim() || !editInstrumentoOuFuncao.trim()) return;

    const atualizado: Integrante = {
      ...integranteEmEdicao,
      nome: editNome.trim(),
      grandeGrupo: editGrandeGrupo,
      instrumentoOuFuncao: editInstrumentoOuFuncao.trim(),
      observacao: editObservacao.trim() || undefined,
      ativo: editAtivo
    };

    setIntegrantes(prev => atualizarIntegranteElenco(prev, atualizado));
    setSetorAtivo(obterSetorDoGrupo(editGrandeGrupo));
    setModalEditar(false);
    setIntegranteEmEdicao(null);

    confetti({
      particleCount: 40,
      spread: 60,
      colors: ['#00D287', '#E6007E', '#FBBF24']
    });
  };

  /**
   * Retorna os estilos visuais de destaque de cada macrocategoria.
   */
  const getGrupoTheme = (grupo: Integrante['grandeGrupo']) => {
    switch (grupo) {
      case 'Bateria':
        return {
          badge: 'bg-[#E6007E] text-white',
          border: 'border-[#E6007E]',
          bgHeader: 'bg-[#FDF2F8]',
          tag: 'text-[#E6007E]'
        };
      case 'Sopros':
        return {
          badge: 'bg-[#00D287] text-[#1E1B2E]',
          border: 'border-[#00D287]',
          bgHeader: 'bg-[#ECFDF5]',
          tag: 'text-[#00A868]'
        };
      case 'Vozes':
        return {
          badge: 'bg-[#FBBF24] text-[#1E1B2E]',
          border: 'border-[#FBBF24]',
          bgHeader: 'bg-[#FEFCE8]',
          tag: 'text-[#B45309]'
        };
      case 'Outros Instrumentos':
        return {
          badge: 'bg-[#581C87] text-[#FBBF24]',
          border: 'border-[#581C87]',
          bgHeader: 'bg-[#FAF5FF]',
          tag: 'text-[#581C87]'
        };
      case 'Brincantes & Dança':
        return {
          badge: 'bg-[#E6007E] text-white',
          border: 'border-[#E6007E]',
          bgHeader: 'bg-[#FDF2F8]',
          tag: 'text-[#E6007E]'
        };
      case 'Carro Alegórico':
        return {
          badge: 'bg-[#FF6B00] text-white',
          border: 'border-[#FF6B00]',
          bgHeader: 'bg-[#FFF7ED]',
          tag: 'text-[#C2410C]'
        };
      case 'Organização & Apoio':
        return {
          badge: 'bg-[#00D287] text-[#1E1B2E]',
          border: 'border-[#00D287]',
          bgHeader: 'bg-[#ECFDF5]',
          tag: 'text-[#00A868]'
        };
      default:
        return {
          badge: 'bg-[#1E1B2E] text-white',
          border: 'border-[#1E1B2E]',
          bgHeader: 'bg-stone-100',
          tag: 'text-[#1E1B2E]'
        };
    }
  };

  /**
   * Retorna o ícone correspondente ao setor.
   */
  const getSetorIcon = (setor: SetorElenco) => {
    switch (setor) {
      case 'Música':
        return <Music className="w-4 h-4" />;
      case 'Performance':
        return <Theater className="w-4 h-4" />;
      case 'Organização':
        return <ClipboardList className="w-4 h-4" />;
    }
  };

  // Filtra integrantes por busca textual
  const filtrados = integrantes.filter(m => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return m.nome.toLowerCase().includes(s) ||
           m.instrumentoOuFuncao.toLowerCase().includes(s) ||
           m.grandeGrupo.toLowerCase().includes(s);
  });

  // Agrupa os integrantes filtrados nas colunas de macrocategorias
  const colunasData = agruparElencoPorMacrocategoria(filtrados);

  // Macrocategorias da aba ativa
  const categoriasAbaAtiva = CATEGORIAS_POR_SETOR[setorAtivo] || [];

  // Contagem por setor
  const contagemPorSetor: Record<SetorElenco, number> = {
    'Música': integrantes.filter(i => obterSetorDoGrupo(i.grandeGrupo) === 'Música').length,
    'Performance': integrantes.filter(i => obterSetorDoGrupo(i.grandeGrupo) === 'Performance').length,
    'Organização': integrantes.filter(i => obterSetorDoGrupo(i.grandeGrupo) === 'Organização').length
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Botões de Ação */}
      <div className="vintage-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="stamp stamp-open text-xs">Quadro Oficial 2027</span>
            <span className="font-mono text-xs font-bold text-stone-600">
              Total: {integrantes.length} bichos cadastrados
            </span>
          </div>
          <h2 className="text-xl font-black uppercase text-[#1E1B2E] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#E6007E]" />
            <span>Elenco por Setores & Naipes</span>
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Organizado em 3 abas essenciais: Música, Performance (brincantes, pernaltas, dança, carro alegórico) e Organização.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-500" />
            <input
              type="text"
              placeholder="Buscar por nome ou naipe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
            />
          </div>

          <button
            onClick={() => {
              // Ajusta o grupo padrão de acordo com o setor ativo
              setGrandeGrupo(CATEGORIAS_POR_SETOR[setorAtivo][0]);
              setModalNovo(true);
            }}
            className="vintage-button px-3.5 py-2 bg-[#00D287] text-[#1E1B2E] hover:bg-[#34EEA0] text-xs uppercase flex items-center gap-1.5 shrink-0 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">+ Novo Integrante</span>
          </button>

          {/* Botão para Todos os Usuários: Editar Integrante */}
          {podeEditar && integrantes.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const primeiro = integrantes[0];
                if (primeiro) abrirModalEditar(primeiro);
              }}
              className="vintage-button px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-[#1E1B2E] text-xs font-black uppercase flex items-center gap-1.5 shrink-0 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
              title="Editar dados de participante do elenco"
            >
              <Edit2 className="w-4 h-4 text-amber-700" />
              <span>Editar Integrante</span>
            </button>
          )}

          {/* Botão para Coordenadores: Remover Integrante */}
          {isAdmin && integrantes.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setIntegranteParaRemoverId(integrantes[0]?.id || '');
                setModalRemover(true);
              }}
              className="vintage-button px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-700 border-2 border-[#1E1B2E] text-xs font-black uppercase flex items-center gap-1.5 shrink-0 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
              title="Exclusivo Coordenadores: Remover integrante do elenco"
            >
              <UserMinus className="w-4 h-4 text-red-600" />
              <span>Remover Integrante</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 ABAS DO ELENCO: MÚSICA, PERFORMANCE, ORGANIZAÇÃO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {SETORES_ELENCO.map((setor) => {
          const isAtivo = setorAtivo === setor.id;
          const totalNoSetor = contagemPorSetor[setor.id];

          return (
            <button
              key={setor.id}
              onClick={() => setSetorAtivo(setor.id)}
              className={`p-3 border-3 border-[#1E1B2E] text-left transition-all flex items-center justify-between gap-2 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer ${
                isAtivo
                  ? 'bg-[#1E1B2E] text-white shadow-[4px_4px_0px_#E6007E] -translate-y-0.5'
                  : 'bg-white hover:bg-stone-50 text-[#1E1B2E]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl shrink-0">{setor.emoji}</span>
                <div className="truncate">
                  <div className="font-mono font-black text-sm uppercase flex items-center gap-1.5 truncate">
                    {setor.rotulo}
                  </div>
                  <div className={`text-[10px] truncate font-serif ${isAtivo ? 'text-stone-300' : 'text-stone-500'}`}>
                    {setor.descricao}
                  </div>
                </div>
              </div>
              <span
                className={`font-mono text-xs font-black px-2 py-0.5 border border-black shrink-0 shadow-[1px_1px_0px_#000] ${
                  isAtivo ? 'bg-[#00D287] text-[#1E1B2E]' : 'bg-[#FBBF24] text-[#1E1B2E]'
                }`}
              >
                {totalNoSetor}
              </span>
            </button>
          );
        })}
      </div>

      {/* DISPOSIÇÃO EM COLUNAS DE MACROCATEGORIAS DA ABA ATIVA */}
      <div
        className={`grid gap-3 items-start ${
          setorAtivo === 'Música'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            : setorAtivo === 'Performance'
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-1 max-w-2xl'
        }`}
      >
        {categoriasAbaAtiva.map((macro) => {
          const dadosColuna = colunasData[macro] || { categoria: macro, total: 0, instrumentos: {} };
          const theme = getGrupoTheme(macro);
          const instrumentosEntries = Object.entries(dadosColuna.instrumentos);

          return (
            <div
              key={macro}
              className={`vintage-card flex flex-col bg-white border-t-8 ${theme.border} min-h-[380px] p-3`}
            >
              {/* Cabeçalho da Coluna de Macrocategoria */}
              <div className={`p-2.5 border-2 border-[#1E1B2E] ${theme.bgHeader} mb-2 shadow-[2px_2px_0px_#1E1B2E]`}>
                <div className="flex items-center justify-between gap-1">
                  <span className={`px-2 py-0.5 border border-black font-black uppercase text-xs font-mono shadow-[1px_1px_0px_#000] truncate ${theme.badge}`}>
                    {macro}
                  </span>
                  <span className="font-mono text-xs font-black px-2 py-0.5 bg-[#FBBF24] border border-black shadow-[1px_1px_0px_#000] shrink-0">
                    {dadosColuna.total}
                  </span>
                </div>
              </div>

              {/* Linhas de Instrumentos/Funções dentro da Coluna */}
              {instrumentosEntries.length === 0 ? (
                <div className="text-center py-8 text-stone-400 font-mono text-xs italic">
                  Nenhum integrante {search ? 'encontrado' : 'nesta categoria'}
                </div>
              ) : (
                <div className="space-y-2.5 flex-1">
                  {instrumentosEntries.map(([inst, membros]) => (
                    <div
                      key={inst}
                      className="bg-stone-50 border-2 border-[#1E1B2E] p-2.5 shadow-[1px_1px_0px_#1E1B2E]"
                    >
                      {/* Linha do Instrumento */}
                      <div className="flex items-center justify-between border-b border-stone-200 pb-1 mb-2 text-xs font-mono font-black uppercase text-[#1E1B2E]">
                        <span className="truncate">{inst}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 border border-black bg-stone-200">
                          {membros.length}
                        </span>
                      </div>

                      {/* Lista Vertical de Integrantes */}
                      <div className="space-y-1.5">
                        {membros.map((m) => (
                          <div
                            key={m.id}
                            className="p-1.5 bg-white border border-black/30 flex items-center justify-between gap-1.5 text-xs font-mono shadow-2xs hover:border-[#E6007E] transition-colors"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-5 h-5 bg-[#E6007E] text-white text-[10px] font-black flex items-center justify-center shrink-0 border border-black">
                                {m.nome.charAt(0)}
                              </span>
                              <span className={`truncate font-bold text-xs ${m.ativo === false ? 'text-stone-400 line-through' : 'text-stone-900'}`}>
                                {m.nome}
                              </span>
                              {m.ativo === false && (
                                <span className="text-[9px] font-mono px-1 py-0.2 bg-stone-200 text-stone-600 border border-stone-400 uppercase">
                                  Inativo
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {m.observacao && (
                                <span className="text-[10px] text-stone-500 truncate max-w-[100px] font-sans italic" title={m.observacao}>
                                  {m.observacao}
                                </span>
                              )}
                              <div className="flex items-center gap-0.5">
                                {podeEditar && (
                                  <button
                                    type="button"
                                    onClick={() => abrirModalEditar(m)}
                                    title={`Editar ${m.nome}`}
                                    className="text-stone-400 hover:text-amber-600 p-0.5 transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {isAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoverIntegrante(m.id)}
                                    title={`Remover ${m.nome}`}
                                    className="text-stone-400 hover:text-red-600 p-0.5 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal para Adicionar Pessoa ao Elenco */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6EC] border-4 border-[#1A181B] p-6 max-w-md w-full shadow-[6px_6px_0px_#1A181B]">
            <div className="stamp stamp-open text-xs mb-2">Novo Bicho no Elenco</div>
            <h3 className="text-base font-black uppercase text-[#1A181B] font-mono">
              Cadastrar Integrante
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 font-serif">
              Insira o nome, a macrocategoria e o instrumento ou função do novo folião.
            </p>

            <form onSubmit={handleAddIntegrante} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mariana Silveira"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Macrocategoria (Coluna) *</label>
                <select
                  value={grandeGrupo}
                  onChange={(e) => setGrandeGrupo(e.target.value as GrandeGrupoElenco)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono font-bold"
                >
                  <optgroup label="🎺 Setor Música">
                    <option value="Bateria">Bateria</option>
                    <option value="Sopros">Sopros</option>
                    <option value="Vozes">Vozes</option>
                    <option value="Outros Instrumentos">Outros Instrumentos / Harmonia</option>
                  </optgroup>
                  <optgroup label="🎭 Setor Performance">
                    <option value="Brincantes & Dança">Brincantes & Dança (Pernaltas, Brincantes, Dançarinos)</option>
                    <option value="Carro Alegórico">Carro Alegórico & Kombi Sonora</option>
                  </optgroup>
                  <optgroup label="📋 Setor Organização">
                    <option value="Organização & Apoio">Organização, Produção & Apoio</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Instrumento / Função *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Caixa, Surdo, Trompete, Pernalta, Cenógrafo, Produção..."
                  value={instrumentoOuFuncao}
                  onChange={(e) => setInstrumentoOuFuncao(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Observações (opcional)</label>
                <input
                  type="text"
                  placeholder="Disponibilidade, instrumento próprio, etc."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-300">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-3 py-1.5 border-2 border-[#1A181B] text-xs font-bold uppercase hover:bg-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-[#00D287] text-[#1E1B2E] text-xs uppercase"
                >
                  Salvar Integrante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Remover Integrante com Dropdown (Exclusivo Coordenadores) */}
      {isAdmin && modalRemover && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6EC] border-4 border-[#1A181B] p-6 max-w-md w-full shadow-[6px_6px_0px_#1A181B]">
            <div className="stamp stamp-closed text-xs mb-2">Apenas Coordenadores</div>
            <h3 className="text-base font-black uppercase text-[#1A181B] font-mono mb-2 flex items-center gap-2">
              <UserMinus className="w-5 h-5 text-red-600" />
              <span>Remover Integrante do Elenco</span>
            </h3>
            <p className="text-xs text-stone-600 mb-4 font-mono">
              Selecione o participante no menu abaixo para retirá-lo do elenco oficial:
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                  Selecione o Integrante *
                </label>
                <select
                  value={integranteParaRemoverId}
                  onChange={(e) => setIntegranteParaRemoverId(e.target.value)}
                  className="w-full p-2 border-2 border-[#1A181B] bg-white font-mono text-xs focus:bg-amber-50 focus:outline-hidden"
                >
                  {[...integrantes]
                    .sort((a, b) => a.nome.localeCompare(b.nome))
                    .map((int) => (
                      <option key={int.id} value={int.id}>
                        {int.nome} — {int.grandeGrupo} ({int.instrumentoOuFuncao})
                      </option>
                    ))}
                </select>
              </div>

              {integranteParaRemoverId && (
                <div className="p-3 bg-red-50 border border-red-300 text-xs text-red-800 font-mono">
                  <strong>Atenção:</strong> Será solicitada uma confirmação antes de excluir o participante do elenco.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-300">
                <button
                  type="button"
                  onClick={() => setModalRemover(false)}
                  className="px-3 py-1.5 border-2 border-[#1A181B] text-xs font-bold uppercase hover:bg-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoverIntegrante(integranteParaRemoverId)}
                  disabled={!integranteParaRemoverId}
                  className="px-4 py-1.5 bg-red-600 text-white font-mono text-xs font-bold uppercase hover:bg-red-700 border-2 border-[#1A181B] shadow-[2px_2px_0px_#1A181B] disabled:opacity-50 cursor-pointer"
                >
                  Remover Integrante
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Editar Integrante (Disponível para Todos os Usuários) */}
      {podeEditar && modalEditar && integranteEmEdicao && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6EC] border-4 border-[#1A181B] p-6 max-w-md w-full shadow-[6px_6px_0px_#1A181B] max-h-[90vh] overflow-y-auto">
            <div className="stamp stamp-open text-xs mb-2">Edição de Cadastro</div>
            <h3 className="text-base font-black uppercase text-[#1A181B] font-mono mb-1 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-amber-600" />
              <span>Editar Integrante do Elenco</span>
            </h3>
            <p className="text-xs text-stone-600 mb-4 font-serif">
              Atualize as informações de cadastro, naipe ou instrumento deste participante.
            </p>

            <form onSubmit={handleSalvarEdicaoIntegrante} className="space-y-3">
              {/* Seletor rápido de integrante se quiser alternar */}
              {integrantes.length > 1 && (
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                    Selecionar Outro Integrante
                  </label>
                  <select
                    value={integranteEmEdicao.id}
                    onChange={(e) => handleSelecionarIntegranteParaEdicao(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-100 border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                  >
                    {[...integrantes]
                      .sort((a, b) => a.nome.localeCompare(b.nome))
                      .map((int) => (
                        <option key={int.id} value={int.id}>
                          {int.nome} — {int.grandeGrupo} ({int.instrumentoOuFuncao})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do integrante"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Macrocategoria (Coluna) *</label>
                <select
                  value={editGrandeGrupo}
                  onChange={(e) => setEditGrandeGrupo(e.target.value as GrandeGrupoElenco)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono font-bold"
                >
                  <optgroup label="🎺 Setor Música">
                    <option value="Bateria">Bateria</option>
                    <option value="Sopros">Sopros</option>
                    <option value="Vozes">Vozes</option>
                    <option value="Outros Instrumentos">Outros Instrumentos / Harmonia</option>
                  </optgroup>
                  <optgroup label="🎭 Setor Performance">
                    <option value="Brincantes & Dança">Brincantes & Dança (Pernaltas, Brincantes, Dançarinos)</option>
                    <option value="Carro Alegórico">Carro Alegórico & Kombi Sonora</option>
                  </optgroup>
                  <optgroup label="📋 Setor Organização">
                    <option value="Organização & Apoio">Organização, Produção & Apoio</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Instrumento / Função *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Caixa, Surdo, Trompete, Pernalta, Cenógrafo, Produção..."
                  value={editInstrumentoOuFuncao}
                  onChange={(e) => setEditInstrumentoOuFuncao(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Observações (opcional)</label>
                <input
                  type="text"
                  placeholder="Disponibilidade, instrumento próprio, etc."
                  value={editObservacao}
                  onChange={(e) => setEditObservacao(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="p-2.5 bg-stone-100 border border-stone-300">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-bold text-[#1A181B]">
                  <input
                    type="checkbox"
                    checked={editAtivo}
                    onChange={(e) => setEditAtivo(e.target.checked)}
                    className="w-4 h-4 accent-[#00D287]"
                  />
                  <span>Integrante ativo e confirmado no Carnaval 2027</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-300">
                <button
                  type="button"
                  onClick={() => {
                    setModalEditar(false);
                    setIntegranteEmEdicao(null);
                  }}
                  className="px-3 py-1.5 border-2 border-[#1A181B] text-xs font-bold uppercase hover:bg-stone-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-amber-400 hover:bg-amber-500 text-[#1E1B2E] text-xs uppercase font-black cursor-pointer shadow-[2px_2px_0px_#1E1B2E]"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
