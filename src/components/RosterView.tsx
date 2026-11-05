'use client';

import React, { useState } from 'react';
import { Users, UserPlus, Search, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Integrante,
  MACROCATEGORIAS_ELENCO,
  agruparElencoPorMacrocategoria
} from '../data/blocoData';

interface RosterViewProps {
  integrantes: Integrante[];
  setIntegrantes: React.Dispatch<React.SetStateAction<Integrante[]>>;
}

/**
 * Visualização do Elenco e Naipes em Colunas de Macrocategorias.
 * As macrocategorias ficam organizadas lado a lado em colunas
 * e as funções/instrumentos e integrantes distribuídos em linhas verticais.
 */
export default function RosterView({ integrantes, setIntegrantes }: RosterViewProps) {
  const [search, setSearch] = useState('');
  const [modalNovo, setModalNovo] = useState(false);

  // Form states para adição rápida de novos integrantes
  const [nome, setNome] = useState('');
  const [grandeGrupo, setGrandeGrupo] = useState<Integrante['grandeGrupo']>('Bateria');
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

  return (
    <div className="space-y-4">
      {/* Top Banner & Botão Adicionar */}
      <div className="vintage-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="stamp stamp-open text-xs">Quadro Oficial 2027</span>
            <span className="font-mono text-xs font-bold text-stone-600">
              Total: {integrantes.length} bichos cadastrados
            </span>
          </div>
          <h2 className="text-xl font-black uppercase text-[#1E1B2E] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#E6007E]" />
            <span>Elenco por Macrocategorias & Naipes</span>
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Macrocategorias distribuídas em colunas, com naipes e integrantes organizados em linhas verticais.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
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
            onClick={() => setModalNovo(true)}
            className="vintage-button px-3.5 py-2 bg-[#00D287] text-[#1E1B2E] hover:bg-[#34EEA0] text-xs uppercase flex items-center gap-1.5 shrink-0 shadow-[2px_2px_0px_#1E1B2E]"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">+ Novo Integrante</span>
          </button>
        </div>
      </div>

      {/* DISPOSIÇÃO EM COLUNAS DE MACROCATEGORIAS COM LINHAS VERTICAIS INTERNAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-start">
        {MACROCATEGORIAS_ELENCO.map((macro) => {
          const dadosColuna = colunasData[macro];
          const theme = getGrupoTheme(macro);
          const instrumentosEntries = Object.entries(dadosColuna.instrumentos);

          return (
            <div
              key={macro}
              className={`vintage-card flex flex-col bg-white border-t-8 ${theme.border} min-h-[380px] p-2.5`}
            >
              {/* Cabeçalho da Coluna de Macrocategoria */}
              <div className={`p-2 border-2 border-[#1E1B2E] ${theme.bgHeader} mb-2 shadow-[2px_2px_0px_#1E1B2E]`}>
                <div className="flex items-center justify-between gap-1">
                  <span className={`px-2 py-0.5 border border-black font-black uppercase text-[11px] font-mono shadow-[1px_1px_0px_#000] truncate ${theme.badge}`}>
                    {macro}
                  </span>
                  <span className="font-mono text-[11px] font-black px-1.5 py-0.5 bg-[#FBBF24] border border-black shadow-[1px_1px_0px_#000] shrink-0">
                    {dadosColuna.total}
                  </span>
                </div>
              </div>

              {/* Linhas de Instrumentos/Funções dentro da Coluna */}
              {instrumentosEntries.length === 0 ? (
                <div className="text-center py-6 text-stone-400 font-mono text-[11px] italic">
                  Nenhum integrante {search ? 'encontrado' : 'nesta ala'}
                </div>
              ) : (
                <div className="space-y-2.5 flex-1">
                  {instrumentosEntries.map(([inst, membros]) => (
                    <div
                      key={inst}
                      className="bg-stone-50 border border-[#1E1B2E] p-2 shadow-[1px_1px_0px_#1E1B2E]"
                    >
                      {/* Linha do Instrumento */}
                      <div className="flex items-center justify-between border-b border-stone-200 pb-1 mb-1.5 text-[11px] font-mono font-black uppercase text-[#1E1B2E]">
                        <span className="truncate">{inst}</span>
                        <span className="text-stone-500 font-normal shrink-0">({membros.length})</span>
                      </div>

                      {/* Linhas de Integrantes */}
                      <div className="space-y-1">
                        {membros.map((m) => (
                          <div
                            key={m.id}
                            className="p-1 bg-white border border-black/20 flex items-center gap-1.5 text-xs font-mono shadow-2xs hover:border-[#E6007E] transition-colors"
                          >
                            <span className="w-4 h-4 bg-[#E6007E] text-white text-[9px] font-black flex items-center justify-center shrink-0 border border-black">
                              {m.nome.charAt(0)}
                            </span>
                            <span className="truncate font-bold text-stone-900 text-[11px]">
                              {m.nome}
                            </span>
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
                  onChange={(e) => setGrandeGrupo(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono font-bold"
                >
                  {MACROCATEGORIAS_ELENCO.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Instrumento / Função *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Caixa, Surdo, Trompete, Pernalta, Produção..."
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
    </div>
  );
}
