'use client';

import React, { useState } from 'react';
import { Pin, AlertTriangle, Plus, CheckCircle2, UserCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TarefaPostIt } from '../data/blocoData';

interface TasksManagerProps {
  tarefas: TarefaPostIt[];
  setTarefas: React.Dispatch<React.SetStateAction<TarefaPostIt[]>>;
  isAdmin: boolean;
}

/**
 * Mural de Tarefas e Apoio com Post-its nas Cores Vivas Oficiais do Bloco.
 */
export default function TasksManager({ tarefas, setTarefas, isAdmin }: TasksManagerProps) {
  const [filtro, setFiltro] = useState<'todas' | 'orfas' | 'concluidas'>('orfas');
  const [modalAssumir, setModalAssumir] = useState<TarefaPostIt | null>(null);
  const [nomeVoluntario, setNomeVoluntario] = useState('');
  const [modalNovoPostIt, setModalNovoPostIt] = useState(false);

  // Form states
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novaCategoria, setNovaCategoria] = useState<TarefaPostIt['categoria']>('Apoio');
  const [novoResponsavel, setNovoResponsavel] = useState('');
  const [novaCor, setNovaCor] = useState<TarefaPostIt['corPostIt']>('rosa');
  const [novoUrgente, setNovoUrgente] = useState(false);

  const isOrfa = (t: TarefaPostIt) => !t.responsavel || t.responsavel.trim() === '' || t.responsavel.toLowerCase().includes('definir');

  const tarefasFiltradas = tarefas.filter(t => {
    if (filtro === 'orfas') return isOrfa(t) && !t.concluida;
    if (filtro === 'concluidas') return t.concluida;
    return true;
  });

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

  const handleCriarPostIt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim()) return;

    const nova: TarefaPostIt = {
      id: `post-${Date.now()}`,
      titulo: novoTitulo.trim(),
      descricao: novaDescricao.trim(),
      categoria: novaCategoria,
      responsavel: novoResponsavel.trim(),
      corPostIt: novaCor,
      urgente: novoUrgente,
      concluida: false
    };

    setTarefas(prev => [nova, ...prev]);
    setModalNovoPostIt(false);
    setNovoTitulo('');
    setNovaDescricao('');
    setNovoResponsavel('');

    confetti({
      particleCount: 40,
      spread: 60,
      colors: ['#E6007E', '#00D287', '#FBBF24']
    });
  };

  const alternarConcluida = (id: string) => {
    setTarefas(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, concluida: !t.concluida };
      }
      return t;
    }));
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
            Quadro comunitário: veja os pedidos de socorro do bloco ou pregue uma nova missão!
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
          onClick={() => setFiltro('orfas')}
          className={`px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#1E1B2E] ${
            filtro === 'orfas'
              ? 'bg-[#E6007E] text-white'
              : 'bg-white text-[#1E1B2E] hover:bg-pink-50'
          }`}
        >
          🚨 Vagas Abertas (Órfãs) [{tarefas.filter(t => isOrfa(t) && !t.concluida).length}]
        </button>

        <button
          onClick={() => setFiltro('todas')}
          className={`px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#1E1B2E] ${
            filtro === 'todas'
              ? 'bg-[#581C87] text-white'
              : 'bg-white text-[#1E1B2E] hover:bg-purple-50'
          }`}
        >
          Todos os Recados [{tarefas.length}]
        </button>

        <button
          onClick={() => setFiltro('concluidas')}
          className={`px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#1E1B2E] ${
            filtro === 'concluidas'
              ? 'bg-[#00D287] text-[#1E1B2E]'
              : 'bg-white text-[#1E1B2E] hover:bg-emerald-50'
          }`}
        >
          ✔ Missões Cumpridas [{tarefas.filter(t => t.concluida).length}]
        </button>
      </div>

      {/* Quadro de Cortiça Visual com Cores Carnavalescas */}
      <div className="cork-texture p-4 sm:p-6 rounded-2xl min-h-[420px]">
        {tarefasFiltradas.length === 0 ? (
          <div className="bg-white border-2 border-[#1E1B2E] p-8 text-center max-w-sm mx-auto shadow-[4px_4px_0px_#1E1B2E] rotate-[-1deg]">
            <p className="font-mono text-sm font-black uppercase text-[#1E1B2E]">
              Nenhum bilhete pregado nesta seção no momento!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-3">
            {tarefasFiltradas.map((tarefa, idx) => {
              const semDono = isOrfa(tarefa);
              const rotation = idx % 3 === 0 ? '-rotate-1' : idx % 3 === 1 ? 'rotate-1' : 'rotate-[-0.5deg]';

              return (
                <div
                  key={tarefa.id}
                  className={`tape-top relative p-4 transition-transform hover:scale-[1.02] flex flex-col justify-between ${
                    corFundoMap[tarefa.corPostIt]
                  } ${rotation} ${tarefa.concluida ? 'opacity-60 line-through' : ''}`}
                >
                  <div>
                    {/* Carimbos e Cabeçalho do Post-it */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-black/10 px-2 py-0.5 border border-black/30 font-mono">
                        {tarefa.categoria}
                      </span>

                      {tarefa.urgente && (
                        <span className="stamp stamp-urgent text-[10px]">
                          Urgente!
                        </span>
                      )}

                      {semDono && !tarefa.concluida && (
                        <span className="stamp stamp-open text-[10px]">
                          Vaga Aberta
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-base text-[#1E1B2E] leading-tight font-mono">
                      {tarefa.titulo}
                    </h3>

                    <p className="text-xs text-stone-800 mt-2 font-serif leading-relaxed">
                      {tarefa.descricao}
                    </p>
                  </div>

                  {/* Rodapé do Post-it */}
                  <div className="mt-4 pt-3 border-t-2 border-[#1E1B2E]/20 flex items-center justify-between gap-2">
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

                    <div className="flex items-center gap-1.5">
                      {semDono && !tarefa.concluida && (
                        <button
                          onClick={() => setModalAssumir(tarefa)}
                          className="px-2.5 py-1 bg-[#E6007E] text-white hover:bg-[#C2006A] text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                        >
                          Quero Esta Missão!
                        </button>
                      )}

                      <button
                        onClick={() => alternarConcluida(tarefa.id)}
                        className={`p-1 border border-[#1E1B2E] text-xs ${
                          tarefa.concluida ? 'bg-[#00D287] text-[#1E1B2E]' : 'bg-white hover:bg-stone-100'
                        }`}
                        title={tarefa.concluida ? 'Marcar como pendente' : 'Marcar como concluída'}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para Assumir Post-it */}
      {modalAssumir && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-sm w-full shadow-[6px_6px_0px_#1E1B2E]">
            <div className="stamp stamp-open text-xs mb-2">Compromisso Carnavalesco</div>
            <h3 className="text-base font-black uppercase text-[#1E1B2E]">
              Assumir Missão: {modalAssumir.titulo}
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 font-serif">
              Coloque seu nome ou apelido para registrarmos sua responsabilidade no quadro do bloco.
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
                  Carimbar Meu Nome!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Pregar Novo Post-It */}
      {modalNovoPostIt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-md w-full shadow-[6px_6px_0px_#1E1B2E]">
            <div className="stamp stamp-urgent text-xs mb-2">Novo Bilhete de Apoio</div>
            <h3 className="text-base font-black uppercase text-[#1E1B2E]">
              Pregar Demanda no Mural
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 font-serif">
              Deixe sem responsável caso precise que algum folião se voluntarie (tarefa órfã).
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
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Categoria</label>
                  <select
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border-2 border-[#1E1B2E] text-xs font-bold"
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
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Cor do Post-it</label>
                  <select
                    value={novaCor}
                    onChange={(e) => setNovaCor(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border-2 border-[#1E1B2E] text-xs font-bold"
                  >
                    <option value="rosa">Rosa Choque (#E6007E)</option>
                    <option value="verde">Verde Menta (#00D287)</option>
                    <option value="amarelo">Amarelo Dourado (#FBBF24)</option>
                    <option value="azul">Roxo / Lavanda (#6C2BD9)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Responsável (Deixe vazio para Vaga Aberta)
                </label>
                <input
                  type="text"
                  placeholder="Nome de quem vai fazer ou deixe em branco"
                  value={novoResponsavel}
                  onChange={(e) => setNovoResponsavel(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-bold font-mono focus:outline-none"
                />
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

              <div className="flex items-center justify-end gap-2 pt-2">
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
