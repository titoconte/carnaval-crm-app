'use client';

import React, { useState } from 'react';
import { Users, UserPlus, Search } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Integrante } from '../data/blocoData';

interface RosterViewProps {
  integrantes: Integrante[];
  setIntegrantes: React.Dispatch<React.SetStateAction<Integrante[]>>;
}

/**
 * Elenco e Naipes com a Identidade Visual Oficial do Bloco Bicharada.
 */
export default function RosterView({ integrantes, setIntegrantes }: RosterViewProps) {
  const [subTab, setSubTab] = useState<'musica' | 'cortejo'>('musica');
  const [search, setSearch] = useState('');
  const [modalNovo, setModalNovo] = useState(false);

  // Form states
  const [nome, setNome] = useState('');
  const [grandeGrupo, setGrandeGrupo] = useState<Integrante['grandeGrupo']>('Bateria');
  const [instrumentoOuFuncao, setInstrumentoOuFuncao] = useState('Caixa');
  const [observacao, setObservacao] = useState('');

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

  const gruposMusicais: Integrante['grandeGrupo'][] = ['Bateria', 'Sopros', 'Vozes', 'Outros Instrumentos'];
  const gruposCortejo: Integrante['grandeGrupo'][] = ['Brincantes & Dança', 'Organização & Apoio'];

  const gruposAtivos = subTab === 'musica' ? gruposMusicais : gruposCortejo;

  const filtrados = integrantes.filter(m => {
    const matchGrupo = gruposAtivos.includes(m.grandeGrupo);
    const matchBusca = m.nome.toLowerCase().includes(search.toLowerCase()) ||
                       m.instrumentoOuFuncao.toLowerCase().includes(search.toLowerCase());
    return matchGrupo && matchBusca;
  });

  const getGrupoTheme = (grupo: Integrante['grandeGrupo']) => {
    switch (grupo) {
      case 'Bateria':
        return { badge: 'bg-[#E6007E] text-white', border: 'border-[#E6007E]', tag: 'bg-[#FDF2F8] text-[#E6007E]' };
      case 'Sopros':
        return { badge: 'bg-[#00D287] text-[#1E1B2E]', border: 'border-[#00D287]', tag: 'bg-[#ECFDF5] text-[#00A868]' };
      case 'Vozes':
        return { badge: 'bg-[#FBBF24] text-[#1E1B2E]', border: 'border-[#FBBF24]', tag: 'bg-[#FEFCE8] text-[#B45309]' };
      case 'Outros Instrumentos':
        return { badge: 'bg-[#581C87] text-[#FBBF24]', border: 'border-[#581C87]', tag: 'bg-[#FAF5FF] text-[#581C87]' };
      case 'Brincantes & Dança':
        return { badge: 'bg-[#E6007E] text-white', border: 'border-[#E6007E]', tag: 'bg-[#FDF2F8] text-[#E6007E]' };
      default:
        return { badge: 'bg-[#00D287] text-[#1E1B2E]', border: 'border-[#00D287]', tag: 'bg-[#ECFDF5] text-[#00A868]' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Botão Adicionar */}
      <div className="vintage-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black uppercase text-[#1E1B2E] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#E6007E]" />
            <span>Elenco Oficial & Naipes da Bicharada</span>
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Quadro geral de ritmistas, metais, vozes, pernaltas e coordenação.
          </p>
        </div>

        <button
          onClick={() => setModalNovo(true)}
          className="vintage-button px-4 py-2 bg-[#00D287] text-[#1E1B2E] hover:bg-[#34EEA0] text-xs uppercase flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Adicionar Pessoa ao Elenco</span>
        </button>
      </div>

      {/* Sub-Abas: Naipes Musicais vs Cortejo & Gestão */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#1E1B2E] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('musica')}
            className={`px-4 py-2 border-2 border-[#1E1B2E] text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#1E1B2E] ${
              subTab === 'musica'
                ? 'bg-[#E6007E] text-white'
                : 'bg-white text-[#1E1B2E] hover:bg-pink-50'
            }`}
          >
            🎵 Naipes Musicais (Bateria, Sopros, Vozes & Harmonia)
          </button>

          <button
            onClick={() => setSubTab('cortejo')}
            className={`px-4 py-2 border-2 border-[#1E1B2E] text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#1E1B2E] ${
              subTab === 'cortejo'
                ? 'bg-[#581C87] text-[#FBBF24]'
                : 'bg-white text-[#1E1B2E] hover:bg-purple-50'
            }`}
          >
            🎭 Cortejo & Gestão (Brincantes, Dança, Apoio & Org)
          </button>
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-500" />
          <input
            type="text"
            placeholder="Buscar por nome ou naipe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
          />
        </div>
      </div>

      {/* Exibição dos Grandes Grupos e seus Instrumentos */}
      <div className="space-y-4">
        {gruposAtivos.map((grupo) => {
          const membrosDoGrupo = filtrados.filter(m => m.grandeGrupo === grupo);
          if (membrosDoGrupo.length === 0 && search) return null;

          const theme = getGrupoTheme(grupo);

          const instrumentosMap = membrosDoGrupo.reduce((acc, m) => {
            if (!acc[m.instrumentoOuFuncao]) acc[m.instrumentoOuFuncao] = [];
            acc[m.instrumentoOuFuncao].push(m);
            return acc;
          }, {} as Record<string, Integrante[]>);

          return (
            <div key={grupo} className={`vintage-card p-4 sm:p-5 border-l-8 ${theme.border}`}>
              <div className="flex items-center justify-between border-b-2 border-[#1E1B2E] pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 border border-black font-black uppercase text-xs font-mono shadow-[1px_1px_0px_#000] ${theme.badge}`}>
                    {grupo}
                  </span>
                </div>
                <span className="font-mono text-xs font-black px-2 py-0.5 bg-[#FBBF24] border border-black shadow-[1px_1px_0px_#000]">
                  {membrosDoGrupo.length} bichos
                </span>
              </div>

              {/* Instrumentos */}
              <div className="space-y-3">
                {Object.entries(instrumentosMap).map(([inst, membros]) => (
                  <div key={inst} className="bg-stone-50/80 border border-[#1E1B2E] p-3 shadow-[2px_2px_0px_#1E1B2E]">
                    <h4 className="text-xs font-black uppercase text-[#1E1B2E] border-b border-stone-300 pb-1 mb-2 font-mono flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#E6007E]" />
                        {inst}
                      </span>
                      <span className="text-stone-500 font-normal">({membros.length})</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {membros.map((m) => (
                        <div
                          key={m.id}
                          className="p-1.5 bg-white border border-black/30 flex items-center gap-1.5 text-xs font-bold font-mono shadow-xs hover:border-[#E6007E]"
                        >
                          <span className="w-5 h-5 bg-[#E6007E] text-white text-[10px] font-black flex items-center justify-center shrink-0 border border-black">
                            {m.nome.charAt(0)}
                          </span>
                          <span className="truncate">{m.nome}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Adicionar Integrante */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-md w-full shadow-[6px_6px_0px_#1E1B2E]">
            <div className="stamp stamp-confirmed text-xs mb-2">Ficha de Inscrição</div>
            <h3 className="text-base font-black uppercase text-[#1E1B2E]">
              Adicionar Pessoa ao Elenco
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 font-serif">
              Insira os dados do integrante e seu respectivo instrumento ou função.
            </p>

            <form onSubmit={handleAddIntegrante} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Nome Completo / Apelido *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlinhos do Trompete"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-bold font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Grande Grupo *</label>
                <select
                  value={grandeGrupo}
                  onChange={(e) => setGrandeGrupo(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-bold font-mono"
                >
                  <option value="Bateria">Bateria (Percussão)</option>
                  <option value="Sopros">Sopros (Metais)</option>
                  <option value="Vozes">Vozes & Canto</option>
                  <option value="Outros Instrumentos">Outros Instrumentos (Harmonia/Cordas)</option>
                  <option value="Brincantes & Dança">Brincantes, Pernaltas & Dança</option>
                  <option value="Organização & Apoio">Organização & Apoio Operacional</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Instrumento / Função Específica *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Caixa, Surdo, Trompete, Pernalta, Corda..."
                  value={instrumentoOuFuncao}
                  onChange={(e) => setInstrumentoOuFuncao(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-bold font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Observações (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Tem instrumento próprio, ou xequerê..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-bold uppercase hover:bg-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-[#00D287] text-[#1E1B2E] text-xs uppercase"
                >
                  Salvar no Elenco
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
