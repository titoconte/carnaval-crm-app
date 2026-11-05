'use client';

import React, { useState } from 'react';
import {
  GripVertical,
  ThumbsUp,
  ArrowUp,
  ArrowDown,
  Headphones,
  Plus,
  Sparkles,
  Music,
  FileText,
  Upload,
  Lock,
  ExternalLink,
  BookOpen,
  Download,
  CheckSquare,
  Square,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import {
  MusicaRepertorio,
  reordenarRepertorio,
  criarSugestaoMusica,
  obterMusicasParaDownload
} from '../data/blocoData';

/**
 * Ícone SVG oficial do YouTube.
 */
function YoutubeIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

interface RepertoireVotingProps {
  musicas: MusicaRepertorio[];
  setMusicas: React.Dispatch<React.SetStateAction<MusicaRepertorio[]>>;
  isAdmin: boolean;
  onOpenLetras?: () => void;
}

/**
 * Gestão de Repertório Oficial e Sequência do Desfile do Bloco Bicharada.
 * Regras:
 * - Apenas a coordenação (isAdmin = true) pode alterar a ordem das músicas no cortejo.
 * - Todos os foliões visualizam botões diretos de Partitura e YouTube.
 * - Sugestão de música permite anexo de upload de arquivo e link do YouTube.
 */
export default function RepertoireVoting({
  musicas,
  setMusicas,
  isAdmin,
  onOpenLetras
}: RepertoireVotingProps) {
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [votedSongs, setVotedSongs] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'Todas' | 'Confirmada' | 'Em Votação' | 'Sugerida para Corte'>('Todas');

  // Modal Sugerir Música
  const [modalNovaMusica, setModalNovaMusica] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoArtista, setNovoArtista] = useState('');
  const [novoRitmo, setNovoRitmo] = useState('Axé / Samba-Reggae');
  const [novoYoutube, setNovoYoutube] = useState('');
  const [novoArquivoNome, setNovoArquivoNome] = useState('');
  const [novoArquivoUrl, setNovoArquivoUrl] = useState('');
  const [enviandoBlob, setEnviandoBlob] = useState(false);
  const [novoTextoPartitura, setNovoTextoPartitura] = useState('');

  // Modal de Leitura de Partitura
  const [modalPartitura, setModalPartitura] = useState<MusicaRepertorio | null>(null);

  // Modal de Download do Caderno de Partituras em PDF
  const [modalCadernoPdf, setModalCadernoPdf] = useState(false);
  const [tipoDownload, setTipoDownload] = useState<'todas' | 'confirmadas' | 'selecionadas'>('confirmadas');
  const [selecionadasIds, setSelecionadasIds] = useState<string[]>([]);
  const [gerandoPdf, setGerandoPdf] = useState(false);

  /**
   * Alterna a seleção de uma música específica para o download do caderno em PDF.
   * 
   * @param id - Identificador da música
   */
  const toggleSelecaoMusica = (id: string) => {
    setSelecionadasIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  /**
   * Compila e faz o download das partituras e cifras selecionadas em um arquivo PDF estruturado.
   */
  const handleDownloadPdf = () => {
    setGerandoPdf(true);
    try {
      const idsPadrao = selecionadasIds.length > 0
        ? selecionadasIds
        : musicas.filter(m => m.statusCuradoria === 'Confirmada').map(m => m.id);

      const musicasParaExportar = obterMusicasParaDownload(musicas, tipoDownload, idsPadrao);

      if (musicasParaExportar.length === 0) {
        alert('Nenhuma música selecionada para gerar o caderno.');
        setGerandoPdf(false);
        return;
      }

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Capa do Caderno Carnavalesco
      doc.setFillColor(88, 28, 135); // Roxo #581C87
      doc.rect(0, 0, 210, 38, 'F');

      doc.setTextColor(251, 191, 36); // Ouro #FBBF24
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('BLOCO BICHARADA • FLORIPA 2027', 15, 18);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Caderno Oficial de Partituras & Cifras • Modo: ${tipoDownload.toUpperCase()} (${musicasParaExportar.length} faixas)`,
        15,
        28
      );

      let y = 48;

      musicasParaExportar.forEach(musica => {
        // Verifica quebra de página
        if (y > 230) {
          doc.addPage();
          y = 20;
        }

        // Cabeçalho da música
        doc.setFillColor(243, 244, 246);
        doc.rect(15, y, 180, 10, 'F');
        doc.setDrawColor(30, 27, 46);
        doc.setLineWidth(0.3);
        doc.rect(15, y, 180, 10, 'S');

        doc.setTextColor(230, 0, 126); // Rosa #E6007E
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`#${musica.ordemDesfile} - ${musica.titulo.toUpperCase()}`, 18, y + 7);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(70, 70, 70);
        doc.text(
          `Ritmo: ${musica.ritmo} | Artista Original: ${musica.artistaOriginal} | Curadoria: ${musica.statusCuradoria}`,
          18,
          y + 15
        );

        y += 20;

        // Conteúdo da Partitura / Cifra / Arranjo
        const conteudoPartitura =
          musica.partituraTexto ||
          (musica.arquivoRepertorio
            ? `Arquivo anexado: ${musica.arquivoRepertorio}\nConsulte o arquivo na pasta de partituras da bateria.`
            : 'Arranjo padrão de bateria e metais da Bicharada.');

        doc.setFont('courier', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(20, 20, 20);

        const linhas = doc.splitTextToSize(conteudoPartitura, 175);
        if (y + linhas.length * 4.5 > 275) {
          doc.addPage();
          y = 20;
        }

        doc.text(linhas, 18, y);
        y += linhas.length * 4.5 + 12;
      });

      // Numeração de páginas no rodapé
      const totalPaginas = doc.getNumberOfPages();
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(130, 130, 130);
        doc.text(
          `Bloco Bicharada Floripa 2027 • Caderno de Partituras • Página ${i} de ${totalPaginas}`,
          15,
          290
        );
      }

      doc.save(`Caderno_Partituras_Bicharada_2027_${tipoDownload}.pdf`);

      confetti({
        particleCount: 50,
        spread: 70,
        colors: ['#581C87', '#FBBF24', '#00D287']
      });

      setModalCadernoPdf(false);
    } catch (err) {
      console.error('Erro ao compilar o PDF:', err);
      alert('Houve um problema ao compilar o PDF.');
    } finally {
      setGerandoPdf(false);
    }
  };

  /**
   * Inicia o arrasto de um card se o usuário for coordenador.
   */
  const handleDragStart = (index: number) => {
    if (!isAdmin) return;
    setDraggedItemIndex(index);
  };

  /**
   * Permite o evento de dragover apenas para coordenadores.
   */
  const handleDragOver = (e: React.DragEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
  };

  /**
   * Executa a reordenação das músicas ao soltar o card, restrito à coordenação.
   */
  const handleDrop = (targetIndex: number) => {
    if (!isAdmin || draggedItemIndex === null || draggedItemIndex === targetIndex) return;

    const reordenadas = reordenarRepertorio(musicas, draggedItemIndex, targetIndex, isAdmin);
    setMusicas(reordenadas);
    setDraggedItemIndex(null);
  };

  /**
   * Move uma música uma posição para cima ou para baixo (exclusivo para coordenação).
   */
  const moveSong = (index: number, direction: 'up' | 'down') => {
    if (!isAdmin) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= musicas.length) return;

    const reordenadas = reordenarRepertorio(musicas, index, targetIndex, isAdmin);
    setMusicas(reordenadas);
  };

  /**
   * Registra o voto de um folião para apoiar uma música na avenida.
   */
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

  /**
   * Captura o upload de arquivo de repertório (partitura/cifra) do dispositivo do usuário
   * e faz o upload em tempo real para o Vercel Blob Storage.
   */
  const handleArquivoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNovoArquivoNome(file.name);
      setEnviandoBlob(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('pasta', 'partituras');

      fetch('/api/blob/upload', {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data.sucesso && data.url) {
            setNovoArquivoUrl(data.url);
          }
        })
        .catch(err => {
          console.warn('Falha no upload do Blob, mantendo arquivo local:', err);
        })
        .finally(() => setEnviandoBlob(false));
    }
  };

  /**
   * Submete a sugestão de música com YouTube e upload de repertório.
   */
  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim()) return;

    const nova = criarSugestaoMusica({
      titulo: novoTitulo.trim(),
      artistaOriginal: novoArtista.trim() || 'Compositor a confirmar',
      ritmo: novoRitmo,
      youtubeUrl: novoYoutube.trim() || undefined,
      arquivoRepertorio: novoArquivoNome || undefined,
      partituraUrl: novoArquivoUrl || undefined,
      partituraTexto: novoTextoPartitura.trim() || undefined,
      ordemDesfile: musicas.length + 1
    });

    setMusicas(prev => [...prev, nova]);
    setVotedSongs(prev => new Set(prev).add(nova.id));

    // Reset formulário
    setNovoTitulo('');
    setNovoArtista('');
    setNovoYoutube('');
    setNovoArquivoNome('');
    setNovoArquivoUrl('');
    setNovoTextoPartitura('');
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
      {/* Banner Principal com Atalho para Letras & Cifras */}
      <div className="bg-[#FAF6EC] border-2 border-[#1A181B] p-4 shadow-[3px_3px_0px_#1A181B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="stamp stamp-open text-xs">Setlist 2027</span>
            {!isAdmin && (
              <span className="font-mono text-[11px] text-stone-600 flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#E6007E]" />
                Ordem editada exclusivamente pela Coordenação
              </span>
            )}
            {isAdmin && (
              <span className="font-mono text-[11px] font-bold text-[#00A868] flex items-center gap-1">
                ★ Modo Coordenação: Arraste para definir a ordem
              </span>
            )}
          </div>
          <h2 className="text-xl font-black uppercase text-[#1A181B] flex items-center gap-2">
            <Music className="w-5 h-5 text-[#E6007E]" />
            <span>Repertório & Sequência na Avenida</span>
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Acompanhe o setlist oficial, acesse as partituras dos metais e links do YouTube ou sugira novas faixas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de Download do Caderno de Partituras em PDF */}
          <button
            onClick={() => setModalCadernoPdf(true)}
            className="vintage-button px-3.5 py-2 bg-[#581C87] text-[#FBBF24] hover:bg-[#431464] text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000]"
            title="Download do caderno de letras, cifras e partituras em PDF"
          >
            <BookOpen className="w-4 h-4" />
            <span>Caderno de Letras & Cifras (PDF)</span>
          </button>

          <button
            onClick={() => setModalNovaMusica(true)}
            className="vintage-button px-4 py-2 bg-[#E6007E] text-white hover:bg-[#C2006A] text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Sugerir Música</span>
          </button>
        </div>
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

      {/* Lista de Músicas com Ordem e Mídias */}
      <div className="space-y-2.5">
        {musicasFiltradas.map((musica, index) => {
          const jaVotou = votedSongs.has(musica.id);
          const youtubeLink = musica.youtubeUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(musica.titulo + ' ' + musica.artistaOriginal)}`;

          return (
            <div
              key={musica.id}
              draggable={isAdmin}
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className={`vintage-card p-3 sm:p-4 flex items-center gap-3 select-none ${
                draggedItemIndex === index ? 'opacity-30 border-dashed scale-98' : ''
              }`}
            >
              {/* Alça Drag (Exclusivo Administrador) */}
              {isAdmin ? (
                <div 
                  className="cursor-grab active:cursor-grabbing text-stone-600 hover:text-black p-1"
                  title="Coordenação: Arraste para reordenar a sequência"
                >
                  <GripVertical className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-1 text-stone-300" title="Ordem definida pela coordenação">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              {/* Número da Ordem */}
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
                  {musica.arquivoRepertorio && (
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-1 border border-purple-300">
                      📎 {musica.arquivoRepertorio}
                    </span>
                  )}
                </div>
              </div>

              {/* Botões Mídia para Todos os Usuários: Partitura e YouTube */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Botão Partitura */}
                <button
                  onClick={() => setModalPartitura(musica)}
                  className="px-2.5 py-1.5 border-2 border-[#1E1B2E] bg-white hover:bg-amber-50 text-[#1E1B2E] text-xs font-mono font-bold uppercase shadow-[1px_1px_0px_#000] flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5"
                  title="Ver partitura / arranjo dos metais"
                >
                  <FileText className="w-3.5 h-3.5 text-[#581C87]" />
                  <span className="hidden sm:inline">Partitura</span>
                </button>

                {/* Botão YouTube */}
                <a
                  href={youtubeLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 border-2 border-[#1E1B2E] bg-white hover:bg-red-50 text-red-700 text-xs font-mono font-bold uppercase shadow-[1px_1px_0px_#000] flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5"
                  title="Ouvir no YouTube"
                >
                  <YoutubeIcon className="w-3.5 h-3.5 text-red-600" />
                  <span className="hidden sm:inline">YouTube</span>
                </a>

                {/* Áudio Guia (se disponível) */}
                {musica.audioGuiaUrl && (
                  <a
                    href={musica.audioGuiaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 border-2 border-[#1E1B2E] bg-white hover:bg-stone-100 text-[#E6007E] shadow-[1px_1px_0px_#000]"
                    title="Ouvir contra-canto gravado"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Botão Votar */}
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

              {/* Botões Touch de Reordenação (Exclusivo Administrador) */}
              {isAdmin && (
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => moveSong(index, 'up')}
                    disabled={index === 0}
                    className="p-1 border border-[#1A181B] bg-white hover:bg-stone-100 disabled:opacity-20 text-xs"
                    title="Subir posição"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveSong(index, 'down')}
                    disabled={index === musicas.length - 1}
                    className="p-1 border border-[#1A181B] bg-white hover:bg-stone-100 disabled:opacity-20 text-xs"
                    title="Descer posição"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Sugerir Música com YouTube e Upload de Repertório */}
      {modalNovaMusica && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6EC] border-4 border-[#1A181B] p-6 max-w-md w-full shadow-[6px_6px_0px_#1A181B] max-h-[90vh] overflow-y-auto">
            <div className="stamp stamp-open text-xs mb-2">Curadoria Coletiva</div>
            <h3 className="text-base font-black uppercase text-[#1A181B] font-mono">
              Sugerir Música para o Cortejo
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 font-serif">
              Indique uma música, inclua o link do YouTube e anexe partituras ou guias musicais.
            </p>

            <form onSubmit={handleAddSong} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Título da Música *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Frevo Mulher / Faraó"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Compositor / Artista Original</label>
                <input
                  type="text"
                  placeholder="Ex: Zé Ramalho / Margareth Menezes"
                  value={novoArtista}
                  onChange={(e) => setNovoArtista(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Ritmo Carnavalesco</label>
                <select
                  value={novoRitmo}
                  onChange={(e) => setNovoRitmo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono"
                >
                  <option value="Axé / Samba-Reggae">Axé / Samba-Reggae</option>
                  <option value="Afoxé / Ijexá">Afoxé / Ijexá</option>
                  <option value="Frevo">Frevo</option>
                  <option value="Marchinha Tradicional">Marchinha Tradicional</option>
                  <option value="Maracatu">Maracatu</option>
                  <option value="Samba de Enredo">Samba de Enredo</option>
                </select>
              </div>

              {/* Link do YouTube */}
              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1 flex items-center gap-1.5">
                  <YoutubeIcon className="w-3.5 h-3.5 text-red-600" />
                  <span>Link da Música no YouTube</span>
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={novoYoutube}
                  onChange={(e) => setNovoYoutube(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                />
              </div>

              {/* Upload de Repertório / Partitura */}
              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#581C87]" />
                  <span>Upload de Repertório (Partitura / Cifra / Guia)</span>
                </label>
                <input
                  type="file"
                  onChange={handleArquivoUpload}
                  className="w-full text-xs font-mono file:mr-2 file:py-1 file:px-3 file:border-2 file:border-black file:bg-[#FBBF24] file:font-black file:uppercase file:text-[10px]"
                />
                {novoArquivoNome && (
                  <span className="text-[11px] font-mono text-[#00A868] mt-1 block">
                    ✓ Arquivo: {novoArquivoNome} {enviandoBlob ? '(Subindo para o Vercel Blob...)' : '(Pronto)'}
                  </span>
                )}
              </div>

              {/* Anotações de Partitura / Cifra em texto */}
              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">
                  Anotações da Partitura / Tom (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Tom Em, sopros entram após o refrão com 4 tempos..."
                  value={novoTextoPartitura}
                  onChange={(e) => setNovoTextoPartitura(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border-2 border-[#1A181B] text-xs font-serif focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-300">
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
                  Enviar Sugestão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualizador de Partitura / Arranjo */}
      {modalPartitura && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1A181B] p-6 max-w-lg w-full shadow-[6px_6px_0px_#1A181B]">
            <div className="stamp stamp-open text-xs mb-2">Partitura & Arranjo Oficial</div>
            <h3 className="text-base font-black uppercase text-[#1A181B] font-mono flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#581C87]" />
              <span>{modalPartitura.titulo} — {modalPartitura.artistaOriginal}</span>
            </h3>
            <div className="mt-3 p-3 bg-stone-50 border-2 border-[#1A181B] font-mono text-xs space-y-2">
              <div className="flex justify-between border-b border-stone-200 pb-1">
                <span>Ritmo: <strong>{modalPartitura.ritmo}</strong></span>
                <span>Ordem no Desfile: <strong>#{modalPartitura.ordemDesfile}</strong></span>
              </div>
              <div className="py-2">
                <span className="font-bold text-[#581C87] block text-[11px] uppercase mb-1">Guia de Arranjo dos Sopros & Bateria:</span>
                <p className="font-serif text-stone-800 whitespace-pre-wrap leading-relaxed">
                  {modalPartitura.partituraTexto ||
                    'Partitura padrão transcrita pela direção musical (Fael). Consulte também o Caderno de Letras & Cifras para detalhes completos.'}
                </p>
              </div>
              {modalPartitura.partituraUrl && (
                <div className="pt-2 border-t border-stone-200">
                  <a
                    href={modalPartitura.partituraUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="vintage-button px-3 py-1.5 bg-[#00D287] text-[#1E1B2E] text-xs uppercase flex items-center gap-1 inline-flex shadow-[1px_1px_0px_#000]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Baixar / Abrir Arquivo Completo da Partitura</span>
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              {onOpenLetras && (
                <button
                  type="button"
                  onClick={() => {
                    setModalPartitura(null);
                    onOpenLetras();
                  }}
                  className="px-3 py-1.5 border-2 border-[#581C87] bg-purple-50 text-[#581C87] text-xs font-mono font-bold uppercase hover:bg-purple-100"
                >
                  Abrir Caderno de Cifras
                </button>
              )}
              <button
                type="button"
                onClick={() => setModalPartitura(null)}
                className="px-4 py-1.5 border-2 border-[#1E1B2E] bg-stone-100 text-stone-900 text-xs font-bold uppercase hover:bg-stone-200 ml-auto"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Popup: Download do Caderno de Partituras em PDF */}
      {modalCadernoPdf && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1A181B] p-6 max-w-lg w-full shadow-[6px_6px_0px_#1A181B] max-h-[90vh] flex flex-col">
            <div className="stamp stamp-open text-xs mb-2">Exportação do Repertório</div>
            <h3 className="text-base font-black uppercase text-[#1A181B] font-mono flex items-center gap-2">
              <Download className="w-5 h-5 text-[#E6007E]" />
              <span>Baixar Caderno de Partituras em PDF</span>
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 font-serif">
              Escolha quais músicas e partituras você deseja compilar no PDF oficial para ensaios e desfile da Bicharada.
            </p>

            {/* Opções de Seleção */}
            <div className="space-y-2 mb-4">
              <label
                onClick={() => setTipoDownload('confirmadas')}
                className={`flex items-center justify-between p-3 border-2 cursor-pointer transition-all ${
                  tipoDownload === 'confirmadas'
                    ? 'border-[#00A868] bg-green-50 shadow-[2px_2px_0px_#00A868]'
                    : 'border-stone-300 hover:border-stone-500 bg-white'
                }`}
              >
                <div>
                  <div className="font-bold text-xs uppercase text-[#1E1B2E] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00A868]" />
                    <span>Apenas Músicas Confirmadas</span>
                  </div>
                  <p className="text-[11px] text-stone-600 font-mono mt-0.5">
                    Gera o PDF somente com as músicas aprovadas para a avenida ({musicas.filter(m => m.statusCuradoria === 'Confirmada').length} faixas).
                  </p>
                </div>
                <input
                  type="radio"
                  name="tipoDownload"
                  checked={tipoDownload === 'confirmadas'}
                  onChange={() => setTipoDownload('confirmadas')}
                  className="accent-[#00A868] w-4 h-4"
                />
              </label>

              <label
                onClick={() => setTipoDownload('todas')}
                className={`flex items-center justify-between p-3 border-2 cursor-pointer transition-all ${
                  tipoDownload === 'todas'
                    ? 'border-[#581C87] bg-purple-50 shadow-[2px_2px_0px_#581C87]'
                    : 'border-stone-300 hover:border-stone-500 bg-white'
                }`}
              >
                <div>
                  <div className="font-bold text-xs uppercase text-[#1E1B2E] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#581C87]" />
                    <span>Baixar Tudo (Setlist Completo)</span>
                  </div>
                  <p className="text-[11px] text-stone-600 font-mono mt-0.5">
                    Inclui todas as faixas cadastradas no sistema ({musicas.length} faixas).
                  </p>
                </div>
                <input
                  type="radio"
                  name="tipoDownload"
                  checked={tipoDownload === 'todas'}
                  onChange={() => setTipoDownload('todas')}
                  className="accent-[#581C87] w-4 h-4"
                />
              </label>

              <label
                onClick={() => setTipoDownload('selecionadas')}
                className={`flex items-center justify-between p-3 border-2 cursor-pointer transition-all ${
                  tipoDownload === 'selecionadas'
                    ? 'border-[#E6007E] bg-pink-50 shadow-[2px_2px_0px_#E6007E]'
                    : 'border-stone-300 hover:border-stone-500 bg-white'
                }`}
              >
                <div>
                  <div className="font-bold text-xs uppercase text-[#1E1B2E] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E6007E]" />
                    <span>Seleção Personalizada de Músicas</span>
                  </div>
                  <p className="text-[11px] text-stone-600 font-mono mt-0.5">
                    Marque individualmente as faixas que deseja incluir no arquivo.
                  </p>
                </div>
                <input
                  type="radio"
                  name="tipoDownload"
                  checked={tipoDownload === 'selecionadas'}
                  onChange={() => setTipoDownload('selecionadas')}
                  className="accent-[#E6007E] w-4 h-4"
                />
              </label>
            </div>

            {/* Lista com Checkboxes se o modo for Seleção Personalizada */}
            {tipoDownload === 'selecionadas' && (
              <div className="flex-1 overflow-y-auto border-2 border-stone-300 p-2 mb-4 max-h-48 space-y-1.5 bg-stone-50 text-xs font-mono">
                {musicas.map(m => {
                  const marcada = selecionadasIds.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleSelecaoMusica(m.id)}
                      className={`flex items-center justify-between p-2 border cursor-pointer transition-colors ${
                        marcada ? 'bg-pink-100 border-[#E6007E]' : 'bg-white border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {marcada ? (
                          <CheckSquare className="w-4 h-4 text-[#E6007E]" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400" />
                        )}
                        <span className="font-bold">#{m.ordemDesfile} {m.titulo}</span>
                      </div>
                      <span className="text-[10px] text-stone-500">{m.ritmo}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ações do Modal */}
            <div className="mt-auto pt-4 border-t-2 border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              {onOpenLetras && (
                <button
                  type="button"
                  onClick={() => {
                    setModalCadernoPdf(false);
                    onOpenLetras();
                  }}
                  className="px-3 py-2 border-2 border-[#581C87] text-[#581C87] text-xs font-mono font-bold uppercase hover:bg-purple-50 text-center"
                >
                  Ver Cifras na Tela
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setModalCadernoPdf(false)}
                  className="px-3.5 py-2 border-2 border-[#1E1B2E] bg-stone-100 text-stone-800 text-xs font-bold uppercase hover:bg-stone-200"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={gerandoPdf}
                  className="vintage-button px-4 py-2 bg-[#00A868] text-white hover:bg-[#008f58] text-xs font-bold uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000]"
                >
                  <Download className="w-4 h-4" />
                  <span>{gerandoPdf ? 'Gerando PDF...' : 'Baixar Arquivo PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
