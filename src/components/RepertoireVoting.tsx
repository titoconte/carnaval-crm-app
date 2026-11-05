'use client';

import React, { useState } from 'react';
import { GripVertical, ThumbsUp, ArrowUp, ArrowDown, Headphones, Plus, Sparkles, Music } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MusicaRepertorio } from '../data/blocoData';

interface RepertoireVotingProps {
  musicas: MusicaRepertorio[];
  setMusicas: React.Dispatch<React.SetStateAction<MusicaRepertorio[]>>;
  isAdmin: boolean;
}

/**
 * Repertório Oficial em Estilo Fanzine com Drag & Drop e botões touch.
 */
export default function RepertoireVoting({ musicas, setMusicas, isAdmin }: RepertoireVotingProps) {
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [votedSongs, setVotedSongs] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'Todas' | 'Confirmada' | 'Em Votação' | 'Sugerida para Corte'>('Todas');
  const [modalNovaMusica, setModalNovaMusica] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoArtista, setNovoArtista] = useState('');
  const [novoRitmo, setNovoRitmo] = useState('Axé / Samba-Reggae');

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

    const reordered = [...musicas];
    const [movedItem] = reordered.splice(draggedItemIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    const updated = reordered.map((item, idx) => ({
      ...item,
      ordemDesfile: idx + 1
    }));

    setMusicas(updated);
    setDraggedItemIndex(null);
  };

  const moveSong = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= musicas.length) return;

    const reordered = [...musicas];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, movedItem);

    const updated = reordered.map((item, idx) => ({
      ...item,
      ordemDesfile: idx + 1
    }));

    setMusicas(updated);
  };

  const handleVote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (votedSongs.has(id)) return;

    setMusicas(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, votosFavoraveis: m.votosFavoraveis + 1 };
      }
      return m;
    }));

    setVotedSongs(prev => new Set(prev).add(id));

    confetti({
      particleCount: 25,
      spread: 40,
      colors: ['#00A868', '#E6007E']
    });
  };

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim()) return;

    const nova: MusicaRepertorio = {
      id: `mus-user-${Date.now()}`,
      titulo: novoTitulo.trim(),
      artistaOriginal: novoArtista.trim() || 'Compositor a confirmar',
      ritmo: novoRitmo,
      ordemDesfile: musicas.length + 1,
      votosFavoraveis: 1,
      statusCuradoria: 'Em Votação'
    };

    setMusicas(prev => [...prev, nova]);
    setVotedSongs(prev => new Set(prev).add(nova.id));
    setNovoTitulo('');
    setNovoArtista('');
    setModalNovaMusica(false);

    confetti({
      particleCount: 40,
      spread: 60,
      colors: ['#E6007E', '#FBBF24']
    });
  };

  const musicasFiltradas = filter === 'Todas' ? musicas : musicas.filter(m => m.statusCuradoria === filter);

  return (
    <div className="space-y-4">
      {/* Banner Principal */}
      <div className="bg-[#FAF6EC] border-2 border-[#1A181B] p-4 shadow-[3px_3px_0px_#1A181B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black uppercase text-[#1A181B] flex items-center gap-2">
            <Music className="w-5 h-5 text-[#E6007E]" />
            <span>Repertório & Sequência na Avenida</span>
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Arraste os cards para montar o setlist do desfile ou vote nas músicas essenciais.
          </p>
        </div>

        <button
          onClick={() => setModalNovaMusica(true)}
          className="vintage-button px-4 py-2 bg-[#E6007E] text-white hover:bg-[#C2006A] text-xs uppercase flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Sugerir Música</span>
        </button>
      </div>

      {/* Filtros em Estilo Fanzine */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {(['Todas', 'Confirmada', 'Em Votação', 'Sugerida para Corte'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 border-2 border-[#1A181B] font-mono text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#1A181B] ${
              filter === st
                ? 'bg-[#581C87] text-white'
                : 'bg-white text-[#1A181B] hover:bg-stone-100'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Lista Arrastável de Músicas */}
      <div className="space-y-2.5">
        {musicasFiltradas.map((musica, index) => {
          const jaVotou = votedSongs.has(musica.id);

          return (
            <div
              key={musica.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className={`vintage-card p-3 sm:p-4 flex items-center gap-3 select-none ${
                draggedItemIndex === index ? 'opacity-30 border-dashed scale-98' : ''
              }`}
            >
              {/* Alça Drag */}
              <div 
                className="cursor-grab active:cursor-grabbing text-stone-400 hover:text-black p-1"
                title="Arraste para reordenar"
              >
                <GripVertical className="w-5 h-5" />
              </div>

              {/* Ordem */}
              <div className="w-8 h-8 bg-[#FBBF24] border-2 border-[#1A181B] shadow-[2px_2px_0px_#1A181B] flex items-center justify-center font-mono font-black text-xs shrink-0">
                #{musica.ordemDesfile}
              </div>

              {/* Detalhes da Música */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-mono font-black text-sm sm:text-base text-[#1A181B] truncate">
                    {musica.titulo}
                  </h3>
                  <span className={`text-[10px] font-mono font-black px-2 py-0.2 border border-black uppercase ${
                    musica.statusCuradoria === 'Confirmada'
                      ? 'bg-[#BBF7D0] text-[#00A868]'
                      : musica.statusCuradoria === 'Sugerida para Corte'
                      ? 'bg-[#FEE2E2] text-[#DC2626]'
                      : 'bg-[#FEF08A] text-[#854D0E]'
                  }`}>
                    {musica.statusCuradoria}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-stone-600 mt-1">
                  <span>{musica.artistaOriginal}</span>
                  <span>•</span>
                  <span className="font-bold text-[#581C87]">{musica.ritmo}</span>
                </div>
              </div>

              {/* Áudio Guia */}
              {musica.audioGuiaUrl && (
                <a
                  href={musica.audioGuiaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 border border-[#1A181B] bg-white hover:bg-stone-100 text-[#E6007E] shrink-0"
                  title="Ouvir áudio-guia dos sopros"
                >
                  <Headphones className="w-4 h-4" />
                </a>
              )}

              {/* Votar (+1) */}
              <button
                onClick={(e) => handleVote(musica.id, e)}
                disabled={jaVotou}
                className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#1A181B] font-mono text-xs font-black transition-all shrink-0 active:translate-x-0.5 active:translate-y-0.5 ${
                  jaVotou
                    ? 'bg-[#00A868] text-white shadow-[2px_2px_0px_#1A181B]'
                    : 'bg-white hover:bg-yellow-100 text-[#1A181B] shadow-[2px_2px_0px_#1A181B]'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${jaVotou ? 'fill-current' : ''}`} />
                <span>{musica.votosFavoraveis}</span>
              </button>

              {/* Botões Touch Mobile */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => moveSong(index, 'up')}
                  disabled={index === 0}
                  className="p-1 border border-[#1A181B] bg-white hover:bg-stone-100 disabled:opacity-20 text-xs"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveSong(index, 'down')}
                  disabled={index === musicas.length - 1}
                  className="p-1 border border-[#1A181B] bg-white hover:bg-stone-100 disabled:opacity-20 text-xs"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Sugerir Música */}
      {modalNovaMusica && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6EC] border-4 border-[#1A181B] p-6 max-w-md w-full shadow-[6px_6px_0px_#1A181B]">
            <div className="stamp stamp-open text-xs mb-2">Sugestão Aberta</div>
            <h3 className="text-base font-black uppercase text-[#1A181B]">
              Sugerir Música para o Bloco
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 font-serif">
              A faixa entrará em votação para todos os integrantes opinarem.
            </p>

            <form onSubmit={handleAddSong} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Título da Música *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: É d'Oxum"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Artista / Intérprete</label>
                <input
                  type="text"
                  placeholder="Ex: Gerônimo"
                  value={novoArtista}
                  onChange={(e) => setNovoArtista(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Ritmo</label>
                <select
                  value={novoRitmo}
                  onChange={(e) => setNovoRitmo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono"
                >
                  <option value="Axé / Samba-Reggae">Axé / Samba-Reggae</option>
                  <option value="Afoxé">Afoxé (Ijexá)</option>
                  <option value="Frevo">Frevo</option>
                  <option value="Samba-Enredo">Samba-Enredo</option>
                  <option value="Marchinha">Marchinha</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovaMusica(false)}
                  className="px-3 py-1.5 border-2 border-[#1A181B] text-xs font-bold uppercase hover:bg-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-[#E6007E] text-white text-xs uppercase"
                >
                  Incluir no Repertório
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
