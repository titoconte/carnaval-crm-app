'use client';

import React, { useState } from 'react';
import {
  GripVertical,
  ThumbsUp,
  Headphones,
  Plus,
  Music,
  FileText,
  Upload,
  Lock,
  ExternalLink,
  BookOpen,
  Download,
  CheckSquare,
  Square,
  Check,
  Pencil,
  Trash2,
  X,
  ListVideo,
  Archive,
  Layers,
  Video
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import {
  MusicaRepertorio,
  reordenarRepertorio,
  criarSugestaoMusica,
  obterMusicasParaDownload,
  editarMusicaRepertorio,
  removerMusicaRepertorio,
  LinkYoutubeMusica,
  ArquivoAnexoRepertorio,
  ConvencaoMusical,
  CONVENCOES_INICIAIS,
  criarConvencaoMusical,
  editarConvencaoMusical,
  removerConvencaoMusical,
  UsuarioBloco
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
  convencoes?: ConvencaoMusical[];
  setConvencoes?: React.Dispatch<React.SetStateAction<ConvencaoMusical[]>>;
  isAdmin: boolean;
  usuarioAtual?: UsuarioBloco | null;
  isPublico?: boolean;
  onOpenLetras?: () => void;
}

/**
 * Gestão de Repertório Oficial, Convenções Musicais e Sequência do Desfile do Bloco Bicharada.
 * - Sub-Aba 1: Repertório Oficial de Músicas (com filtros: Todas, Confirmada, Em Votação, Arquivadas).
 * - Sub-Aba 2: Convenções Musicais (paradas, viradas de bateria, arranjos de metais, vídeos e partituras).
 * - Músicas arquivadas não entram em votação e não recebem número de desfile (#ordem).
 * - Apenas coordenadores (isAdmin) podem editar músicas, arquivos e convenções.
 */
export default function RepertoireVoting({
  musicas,
  setMusicas,
  convencoes,
  setConvencoes,
  isAdmin,
  usuarioAtual,
  isPublico = false
}: RepertoireVotingProps) {
  // Controle de sub-abas internas: 'repertorio' ou 'convencoes'
  const [subAba, setSubAba] = useState<'repertorio' | 'convencoes'>('repertorio');

  // Estado local para convenções musicais se não passado por props
  const [localConvencoes, setLocalConvencoes] = useState<ConvencaoMusical[]>(CONVENCOES_INICIAIS);
  const listaConvencoes = convencoes ?? localConvencoes;
  const atualizarConvencoes = setConvencoes ?? setLocalConvencoes;

  // Filtro de repertório: 'Todas' | 'Confirmada' | 'Em Votação' | 'Arquivadas'
  const [filter, setFilter] = useState<'Todas' | 'Confirmada' | 'Em Votação' | 'Arquivadas'>('Todas');

  // Filtro de convenções musicais por categoria
  const [filtroConvencao, setFiltroConvencao] = useState<string>('Todas');

  const [votedSongs, setVotedSongs] = useState<Set<string>>(new Set());
  const [modalNovaMusica, setModalNovaMusica] = useState(false);
  const [modalPartitura, setModalPartitura] = useState<MusicaRepertorio | null>(null);
  const [modalYoutubeVersoes, setModalYoutubeVersoes] = useState<MusicaRepertorio | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Estados do formulário de nova música
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoArtista, setNovoArtista] = useState('');
  const [novoRitmo, setNovoRitmo] = useState('Axé / Samba-Reggae');
  const [novoLinksYoutube, setNovoLinksYoutube] = useState<LinkYoutubeMusica[]>([
    { rotulo: 'Versão Principal', url: '' }
  ]);
  const [novosArquivos, setNovosArquivos] = useState<ArquivoAnexoRepertorio[]>([]);
  const [novoTextoPartitura, setNovoTextoPartitura] = useState('');

  // Estados do formulário de edição de música (exclusivo coordenação)
  const [musicaParaEditar, setMusicaParaEditar] = useState<MusicaRepertorio | null>(null);
  const [editTitulo, setEditTitulo] = useState('');
  const [editArtista, setEditArtista] = useState('');
  const [editRitmo, setEditRitmo] = useState('Axé / Samba-Reggae');
  const [editStatus, setEditStatus] = useState<any>('Confirmada');
  const [editLinksYoutube, setEditLinksYoutube] = useState<LinkYoutubeMusica[]>([]);
  const [editArquivos, setEditArquivos] = useState<ArquivoAnexoRepertorio[]>([]);
  const [editTextoPartitura, setEditTextoPartitura] = useState('');

  // Estados do formulário de Convenção Musical (Adição / Edição)
  const [modalNovaConvencao, setModalNovaConvencao] = useState(false);
  const [convencaoParaEditar, setConvencaoParaEditar] = useState<ConvencaoMusical | null>(null);
  const [convTitulo, setConvTitulo] = useState('');
  const [convCategoria, setConvCategoria] = useState('Geral');
  const [convDescricao, setConvDescricao] = useState('');
  const [convVideos, setConvVideos] = useState<{ rotulo?: string; url: string }[]>([
    { rotulo: 'Vídeo da Convenção', url: '' }
  ]);
  const [convDocumentos, setConvDocumentos] = useState<{ nome: string; url?: string }[]>([]);

  // Modal de Download do Caderno de Partituras em PDF
  const [modalCadernoPdf, setModalCadernoPdf] = useState(false);
  const [tipoDownload, setTipoDownload] = useState<'todas' | 'confirmadas' | 'selecionadas'>('confirmadas');
  const [selecionadasIds, setSelecionadasIds] = useState<string[]>([]);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [enviandoBlob, setEnviandoBlob] = useState(false);

  /**
   * Alterna a seleção de uma música específica para o download do caderno em PDF.
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
    if (isPublico) {
      alert('Acesso restrito: faça login como integrante do bloco para baixar partituras.');
      return;
    }

    try {
      setGerandoPdf(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const musicasParaExportar = obterMusicasParaDownload(musicas, tipoDownload, selecionadasIds);

      if (musicasParaExportar.length === 0) {
        alert('Nenhuma música selecionada para gerar o caderno.');
        setGerandoPdf(false);
        return;
      }

      // Capa do Caderno Carnavalesco
      doc.setFillColor(88, 28, 135);
      doc.rect(0, 0, 210, 297, 'F');

      doc.setTextColor(251, 191, 36);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.text('BLOCO BICHARADA • FLORIANÓPOLIS 2027', 105, 70, { align: 'center' });

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text(
        `Caderno Oficial de Partituras & Cifras • Modo: ${tipoDownload.toUpperCase()} (${musicasParaExportar.length} faixas)`,
        105,
        90,
        { align: 'center' }
      );

      doc.setFontSize(11);
      doc.setFont('courier', 'normal');
      doc.text('Repertório carnavais de rua - Arranjos de Metais, Bateria & Harmonia', 105, 110, { align: 'center' });
      doc.text(`Compilado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 120, { align: 'center' });

      // Páginas com partituras de cada música
      musicasParaExportar.forEach((m) => {
        doc.addPage();

        doc.setFillColor(255, 250, 235);
        doc.rect(0, 0, 210, 297, 'F');

        doc.setDrawColor(26, 24, 27);
        doc.setLineWidth(1);
        doc.rect(10, 10, 190, 277);

        doc.setFillColor(230, 0, 126);
        doc.rect(10, 10, 190, 22, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        const ordemTexto = m.statusCuradoria === 'Arquivada' || (m.statusCuradoria as any) === 'Sugerida para Corte'
          ? '[ARQUIVADA]'
          : `FAIXA #${m.ordemDesfile}`;
        doc.text(`${ordemTexto} - ${m.titulo.toUpperCase()}`, 15, 24);

        doc.setFontSize(9);
        doc.setFont('courier', 'bold');
        doc.setTextColor(251, 191, 36);
        doc.text(`RITMO: ${m.ritmo.toUpperCase()}  |  ORIGINAL: ${m.artistaOriginal.toUpperCase()}`, 15, 30);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(88, 28, 135);
        doc.text('CONVENÇÕES, ARRANJOS & GUIA DE METAIS:', 15, 42);

        doc.setFont('courier', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(30, 27, 46);

        const arranjoDesc = m.partituraTexto
          ? m.partituraTexto
          : m.arquivoRepertorio
          ? `Arquivo Anexo de Partitura: ${m.arquivoRepertorio}`
          : 'Convenção padrão da direção musical (Fael): Metais entram na 2ª volta da introdução. Dobra de refrão com surdos de 3ª cortando.';

        const linhasArr = doc.splitTextToSize(arranjoDesc, 180);
        doc.text(linhasArr, 15, 50);

        let yPos = 50 + (linhasArr.length * 5) + 10;

        if (m.youtubeLinks && m.youtubeLinks.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(185, 28, 28);
          doc.text('VÍDEOS DE REFERÊNCIA NO YOUTUBE:', 15, yPos);
          yPos += 5;

          doc.setFont('courier', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(30, 27, 46);
          m.youtubeLinks.forEach((l) => {
            const linha = `• ${l.rotulo || 'Versão'}: ${l.url}`;
            doc.text(doc.splitTextToSize(linha, 180), 15, yPos);
            yPos += 5;
          });
          yPos += 5;
        }

        if (m.letra) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(88, 28, 135);
          doc.text('LETRA DA MÚSICA:', 15, yPos);
          yPos += 6;

          doc.setFont('courier', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(20, 20, 20);

          const linhasLetra = doc.splitTextToSize(m.letra, 180);
          doc.text(linhasLetra, 15, yPos);
        }
      });

      const totalPaginas = doc.getNumberOfPages();
      for (let i = 2; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(
          `Bloco Bicharada Floripa 2027 • Caderno de Partituras • Página ${i} de ${totalPaginas}`,
          105,
          292,
          { align: 'center' }
        );
      }

      doc.save(`Caderno_Partituras_Bicharada_2027_${tipoDownload}.pdf`);

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Falha ao compilar caderno de partituras:', err);
      alert('Não foi possível gerar o caderno em PDF. Verifique se o navegador permite popups de download.');
    } finally {
      setGerandoPdf(false);
      setModalCadernoPdf(false);
    }
  };

  /**
   * Registra voto na música (bloqueado para público e músicas arquivadas).
   */
  const handleVote = (id: string, e: React.MouseEvent) => {
    if (isPublico) {
      alert('Acesso restrito: faça login como Bicho ou Coordenador para votar no repertório.');
      return;
    }

    const alvo = musicas.find(m => m.id === id);
    if (alvo?.statusCuradoria === 'Arquivada' || (alvo?.statusCuradoria as any) === 'Sugerida para Corte') {
      alert('Esta música está arquivada e não participa mais da votação.');
      return;
    }

    if (votedSongs.has(id)) return;

    setMusicas(prev =>
      prev.map(musica =>
        musica.id === id
          ? { ...musica, votosFavoraveis: musica.votosFavoraveis + 1 }
          : musica
      )
    );

    setVotedSongs(prev => new Set(prev).add(id));

    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 25,
      spread: 45,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
      },
      colors: ['#E6007E', '#00A868', '#FBBF24']
    });
  };

  /**
   * Inicia o arraste para reordenar a sequência de músicas do desfile.
   */
  const handleDragStart = (index: number) => {
    if (!isAdmin) return;
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
  };

  /**
   * Finaliza o arraste e recalcula a sequência do desfile.
   */
  const handleDrop = (dropIndex: number) => {
    if (!isAdmin || draggedItemIndex === null || draggedItemIndex === dropIndex) {
      setDraggedItemIndex(null);
      return;
    }
    const novasMusicas = reordenarRepertorio(musicas, draggedItemIndex, dropIndex, isAdmin);
    setMusicas(novasMusicas);
    setDraggedItemIndex(null);
  };

  /**
   * Gerencia upload de múltiplos arquivos locais para repertório ou convenções.
   */
  const handleUploadArquivos = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<ArquivoAnexoRepertorio[]>>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setEnviandoBlob(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const res = await fetch(`/api/blob/upload?filename=${encodeURIComponent(file.name)}`, {
          method: 'POST',
          body: file
        });

        if (res.ok) {
          const data = await res.json();
          setter(prev => [...prev, { nome: file.name, url: data.url, tipo: file.type }]);
        } else {
          setter(prev => [...prev, { nome: file.name, url: URL.createObjectURL(file), tipo: file.type }]);
        }
      } catch {
        setter(prev => [...prev, { nome: file.name, url: URL.createObjectURL(file), tipo: file.type }]);
      }
    }
    setEnviandoBlob(false);
  };

  /**
   * Abre o modal de edição de música exclusivamente para coordenadores.
   */
  const abrirModalEdicao = (musica: MusicaRepertorio) => {
    if (!isAdmin) return;
    setMusicaParaEditar(musica);
    setEditTitulo(musica.titulo);
    setEditArtista(musica.artistaOriginal);
    setEditRitmo(musica.ritmo);
    setEditStatus(musica.statusCuradoria === 'Sugerida para Corte' ? 'Arquivada' : musica.statusCuradoria);

    // Carrega links do YouTube
    const links = musica.youtubeLinks && musica.youtubeLinks.length > 0
      ? musica.youtubeLinks.map(l => ({ ...l }))
      : musica.youtubeUrl
      ? [{ rotulo: 'Vídeo Principal', url: musica.youtubeUrl }]
      : [{ rotulo: 'Versão Principal', url: '' }];
    setEditLinksYoutube(links);

    // Carrega arquivos
    const arqs = musica.arquivos && musica.arquivos.length > 0
      ? musica.arquivos.map(a => ({ ...a }))
      : musica.arquivoRepertorio
      ? [{ nome: musica.arquivoRepertorio, url: musica.partituraUrl }]
      : [];
    setEditArquivos(arqs);

    setEditTextoPartitura(musica.partituraTexto || '');
  };

  /**
   * Salva as alterações da música editada pelo coordenador.
   */
  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !musicaParaEditar || !editTitulo.trim()) return;

    const linksValidos = editLinksYoutube.filter(l => l.url && l.url.trim().length > 0);
    const atualizadas = editarMusicaRepertorio(
      musicas,
      musicaParaEditar.id,
      {
        titulo: editTitulo.trim(),
        artistaOriginal: editArtista.trim() || 'Compositor a confirmar',
        ritmo: editRitmo,
        statusCuradoria: editStatus,
        youtubeLinks: linksValidos,
        youtubeUrl: linksValidos[0]?.url || undefined,
        arquivos: editArquivos,
        arquivoRepertorio: editArquivos[0]?.nome || undefined,
        partituraUrl: editArquivos[0]?.url || undefined,
        partituraTexto: editTextoPartitura.trim() || undefined
      },
      isAdmin
    );

    setMusicas(atualizadas);
    setMusicaParaEditar(null);

    confetti({
      particleCount: 35,
      spread: 50,
      colors: ['#00A868', '#581C87']
    });
  };

  /**
   * Remove uma música do repertório (exclusivo para coordenação).
   */
  const handleExcluirMusica = (id: string) => {
    if (!isAdmin) return;
    if (confirm('Tem certeza que deseja remover esta música do repertório oficial?')) {
      const atualizadas = removerMusicaRepertorio(musicas, id, isAdmin);
      setMusicas(atualizadas);
      setMusicaParaEditar(null);
    }
  };

  /**
   * Submete a sugestão de música com múltiplos links do YouTube e arquivos.
   */
  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim()) return;

    const linksValidos = novoLinksYoutube.filter(l => l.url && l.url.trim().length > 0);

    const nova = criarSugestaoMusica({
      titulo: novoTitulo.trim(),
      artistaOriginal: novoArtista.trim() || 'Compositor a confirmar',
      ritmo: novoRitmo,
      youtubeLinks: linksValidos,
      youtubeUrl: linksValidos[0]?.url,
      arquivos: novosArquivos,
      arquivoRepertorio: novosArquivos[0]?.nome,
      partituraUrl: novosArquivos[0]?.url,
      partituraTexto: novoTextoPartitura.trim() || undefined,
      ordemDesfile: musicas.length + 1
    });

    setMusicas(prev => [...prev, nova]);
    setVotedSongs(prev => new Set(prev).add(nova.id));

    // Reset formulário
    setNovoTitulo('');
    setNovoArtista('');
    setNovoLinksYoutube([{ rotulo: 'Versão Principal', url: '' }]);
    setNovosArquivos([]);
    setNovoTextoPartitura('');
    setModalNovaMusica(false);

    confetti({
      particleCount: 40,
      spread: 60,
      colors: ['#E6007E', '#FBBF24']
    });
  };

  /**
   * Abre o modal para criar uma nova Convenção Musical.
   */
  const abrirNovaConvencao = () => {
    if (!isAdmin) return;
    setConvTitulo('');
    setConvCategoria('Geral');
    setConvDescricao('');
    setConvVideos([{ rotulo: 'Vídeo Demonstrativo', url: '' }]);
    setConvDocumentos([]);
    setModalNovaConvencao(true);
  };

  /**
   * Salva a nova Convenção Musical cadastrada pela coordenação.
   */
  const handleSalvarNovaConvencao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !convTitulo.trim()) return;

    const videosValidos = convVideos.filter(v => v.url && v.url.trim().length > 0);
    const novaConv = criarConvencaoMusical({
      titulo: convTitulo.trim(),
      categoria: convCategoria,
      descricao: convDescricao.trim() || undefined,
      videoUrls: videosValidos,
      documentoUrls: convDocumentos
    });

    atualizarConvencoes(prev => [...prev, novaConv]);
    setModalNovaConvencao(false);

    confetti({
      particleCount: 35,
      spread: 50,
      colors: ['#581C87', '#FBBF24']
    });
  };

  /**
   * Abre o modal para editar uma Convenção Musical existente.
   */
  const abrirEdicaoConvencao = (c: ConvencaoMusical) => {
    if (!isAdmin) return;
    setConvencaoParaEditar(c);
    setConvTitulo(c.titulo);
    setConvCategoria(c.categoria || 'Geral');
    setConvDescricao(c.descricao || '');
    setConvVideos(c.videoUrls && c.videoUrls.length > 0 ? c.videoUrls.map(v => ({ ...v })) : [{ rotulo: 'Vídeo da Convenção', url: '' }]);
    setConvDocumentos(c.documentoUrls && c.documentoUrls.length > 0 ? c.documentoUrls.map(d => ({ ...d })) : []);
  };

  /**
   * Salva as alterações de uma Convenção Musical existente.
   */
  const handleSalvarEdicaoConvencao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !convencaoParaEditar || !convTitulo.trim()) return;

    const videosValidos = convVideos.filter(v => v.url && v.url.trim().length > 0);
    const atualizadas = editarConvencaoMusical(
      listaConvencoes,
      convencaoParaEditar.id,
      {
        titulo: convTitulo.trim(),
        categoria: convCategoria,
        descricao: convDescricao.trim() || undefined,
        videoUrls: videosValidos,
        documentoUrls: convDocumentos
      },
      isAdmin
    );

    atualizarConvencoes(atualizadas);
    setConvencaoParaEditar(null);

    confetti({
      particleCount: 35,
      spread: 50,
      colors: ['#00A868', '#FBBF24']
    });
  };

  /**
   * Remove uma Convenção Musical cadastrada.
   */
  const handleExcluirConvencao = (id: string) => {
    if (!isAdmin) return;
    if (confirm('Tem certeza que deseja remover esta convenção musical?')) {
      const atualizadas = removerConvencaoMusical(listaConvencoes, id, isAdmin);
      atualizarConvencoes(atualizadas);
      setConvencaoParaEditar(null);
    }
  };

  // Filtragem das músicas do repertório
  const musicasFiltradas = filter === 'Todas'
    ? musicas
    : filter === 'Arquivadas'
    ? musicas.filter(m => m.statusCuradoria === 'Arquivada' || (m.statusCuradoria as any) === 'Sugerida para Corte')
    : musicas.filter(m => m.statusCuradoria === filter);

  // Filtragem das convenções musicais
  const convencoesFiltradas = filtroConvencao === 'Todas'
    ? listaConvencoes
    : listaConvencoes.filter(c => c.categoria === filtroConvencao);

  return (
    <div className="space-y-6">
      {/* Navegação de Sub-Abas do Repertório */}
      <div className="flex border-4 border-[#1A181B] bg-stone-100 shadow-[4px_4px_0px_#1A181B] p-1 gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setSubAba('repertorio')}
          className={`flex-1 min-w-[180px] py-2.5 px-4 font-mono font-black text-xs sm:text-sm uppercase flex items-center justify-center gap-2 border-2 border-[#1A181B] transition-all cursor-pointer ${
            subAba === 'repertorio'
              ? 'bg-[#FBBF24] text-[#1A181B] shadow-[2px_2px_0px_#1A181B]'
              : 'bg-white text-stone-700 hover:bg-stone-50'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Repertório Oficial ({musicas.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubAba('convencoes')}
          className={`flex-1 min-w-[180px] py-2.5 px-4 font-mono font-black text-xs sm:text-sm uppercase flex items-center justify-center gap-2 border-2 border-[#1A181B] transition-all cursor-pointer ${
            subAba === 'convencoes'
              ? 'bg-[#581C87] text-[#FBBF24] shadow-[2px_2px_0px_#1A181B]'
              : 'bg-white text-stone-700 hover:bg-stone-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Convenções Musicais ({listaConvencoes.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* SUB-ABA 1: REPERTÓRIO OFICIAL DE MÚSICAS                      */}
      {/* ============================================================== */}
      {subAba === 'repertorio' && (
        <>
          {/* Banner Principal com Ações */}
          <div className="bg-[#FEF08A] border-4 border-[#1A181B] p-4 shadow-[4px_4px_0px_#1A181B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="stamp stamp-urgent text-xs">Setlist do Desfile</span>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-[#1A181B] font-mono mt-1">
                Repertório Carnavalesco
              </h2>
              <p className="text-xs font-mono text-stone-700 mt-1 max-w-xl">
                Acompanhe o setlist oficial, acesse as partituras dos metais e links do YouTube ou sugira novas faixas.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Download do Caderno de Partituras em PDF (Oculto para Público) */}
              {!isPublico && (
                <button
                  type="button"
                  onClick={() => setModalCadernoPdf(true)}
                  className="vintage-button px-3.5 py-2 bg-[#581C87] text-[#FBBF24] hover:bg-[#431464] text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer"
                  title="Download do caderno de letras, cifras e partituras em PDF"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Caderno de Partituras (PDF)</span>
                </button>
              )}

              {!isPublico && (
                <button
                  type="button"
                  onClick={() => setModalNovaMusica(true)}
                  className="vintage-button px-4 py-2 bg-[#E6007E] text-white hover:bg-[#C2006A] text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Sugerir Música</span>
                </button>
              )}
            </div>
          </div>

          {/* Banner de Consulta Pública */}
          {isPublico && (
            <div className="p-3 bg-amber-50 border-2 border-[#1A181B] font-mono text-xs text-amber-900 shadow-[2px_2px_0px_#1A181B] flex items-center justify-between">
              <span>👁️ <strong>Modo Consulta Pública:</strong> Ouça as músicas e variações de ritmos no YouTube. Faça login para votar e acessar partituras restritas.</span>
            </div>
          )}

          {/* Filtros em Estilo Fanzine */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {(['Todas', 'Confirmada', 'Em Votação', 'Arquivadas'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 border-2 border-[#1A181B] font-mono text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#1A181B] cursor-pointer ${
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
            {musicasFiltradas.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 border-2 border-dashed border-stone-300 font-mono text-xs text-stone-500">
                Nenhuma música encontrada nesta categoria ({filter}).
              </div>
            ) : (
              musicasFiltradas.map((musica, index) => {
                const jaVotou = votedSongs.has(musica.id);
                const youtubeLink = musica.youtubeUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(musica.titulo + ' ' + musica.artistaOriginal)}`;
                const isArquivada = musica.statusCuradoria === 'Arquivada' || (musica.statusCuradoria as any) === 'Sugerida para Corte';

                return (
                  <div
                    key={musica.id}
                    draggable={isAdmin && !isArquivada}
                    onDragStart={() => !isArquivada && handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => !isArquivada && handleDrop(index)}
                    className={`vintage-card p-3 sm:p-4 flex items-center gap-3 select-none ${
                      isArquivada ? 'bg-stone-50/90 border-stone-400' : ''
                    } ${draggedItemIndex === index ? 'opacity-30 border-dashed scale-98' : ''}`}
                  >
                    {/* Alça Drag (Exclusivo Administrador e Músicas Ativas) */}
                    {isAdmin ? (
                      isArquivada ? (
                        <div className="p-1 text-stone-300" title="Música arquivada (fora da ordem de desfile)">
                          <Archive className="w-4 h-4 text-stone-400" />
                        </div>
                      ) : (
                        <div 
                          className="cursor-grab active:cursor-grabbing text-stone-600 hover:text-black p-1"
                          title="Coordenação: Arraste para reordenar a sequência"
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>
                      )
                    ) : (
                      <div className="p-1 text-stone-300" title="Ordem definida pela coordenação">
                        {isArquivada ? <Archive className="w-4 h-4 text-stone-400" /> : <Lock className="w-4 h-4" />}
                      </div>
                    )}

                    {/* Número da Ordem ou Ícone de Arquivada */}
                    {isArquivada ? (
                      <div
                        className="w-8 h-8 bg-stone-200 border-2 border-stone-400 text-stone-600 shadow-[2px_2px_0px_#1A181B] flex items-center justify-center font-mono font-bold text-xs shrink-0"
                        title="Música Arquivada (Sem numeração de desfile)"
                      >
                        <Archive className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-[#FBBF24] border-2 border-[#1A181B] shadow-[2px_2px_0px_#1A181B] flex items-center justify-center font-mono font-black text-xs shrink-0">
                        #{musica.ordemDesfile}
                      </div>
                    )}

                    {/* Detalhes da Música */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-mono font-black text-sm sm:text-base truncate ${isArquivada ? 'text-stone-600 line-through' : 'text-[#1A181B]'}`}>
                          {musica.titulo}
                        </h3>
                        <span className={`text-[10px] font-mono font-black px-2 py-0.2 border border-black uppercase ${
                          musica.statusCuradoria === 'Confirmada'
                            ? 'bg-[#BBF7D0] text-[#00A868]'
                            : isArquivada
                            ? 'bg-stone-200 text-stone-700'
                            : 'bg-[#FEF08A] text-[#854D0E]'
                        }`}>
                          {isArquivada ? 'Arquivada' : musica.statusCuradoria}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-600 font-mono mt-0.5 flex-wrap">
                        <span>Original: <strong>{musica.artistaOriginal}</strong></span>
                        <span>•</span>
                        <span className="text-[#E6007E] font-bold">{musica.ritmo}</span>
                        {musica.youtubeLinks && musica.youtubeLinks.length > 1 && (
                          <span className="text-[10px] bg-red-100 text-red-700 px-1 border border-red-300 font-bold">
                            {musica.youtubeLinks.length} opções de ritmo
                          </span>
                        )}
                        {musica.arquivos && musica.arquivos.length > 1 && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-1 border border-purple-300 font-bold">
                            📎 {musica.arquivos.length} partituras/anexos
                          </span>
                        )}
                        {musica.arquivoRepertorio && (!musica.arquivos || musica.arquivos.length <= 1) && (
                          <span className="text-[10px] bg-purple-100 text-purple-800 px-1 border border-purple-300">
                            📎 {musica.arquivoRepertorio}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botões Mídia: Partitura, YouTube e Edição (Coordenação) */}
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
                      {/* Botão Partitura / Arquivos Anexados (Apenas Membros Logados) */}
                      {!isPublico && (
                        <button
                          type="button"
                          onClick={() => setModalPartitura(musica)}
                          className="px-2.5 py-1.5 border-2 border-[#1E1B2E] bg-white hover:bg-amber-50 text-[#1E1B2E] text-xs font-mono font-bold uppercase shadow-[1px_1px_0px_#000] flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                          title="Ver partituras e arquivos anexados"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#581C87]" />
                          <span className="hidden sm:inline">
                            Partituras {musica.arquivos && musica.arquivos.length > 1 ? `(${musica.arquivos.length})` : ''}
                          </span>
                        </button>
                      )}

                      {/* Botão YouTube (1 link direto ou menu de múltiplas versões) */}
                      {musica.youtubeLinks && musica.youtubeLinks.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => setModalYoutubeVersoes(musica)}
                          className="px-2.5 py-1.5 border-2 border-[#1E1B2E] bg-red-50 hover:bg-red-100 text-red-700 text-xs font-mono font-bold uppercase shadow-[1px_1px_0px_#000] flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                          title="Ver versões de ritmos no YouTube"
                        >
                          <YoutubeIcon className="w-3.5 h-3.5 text-red-600" />
                          <span className="hidden sm:inline">YouTube ({musica.youtubeLinks.length})</span>
                        </button>
                      ) : (
                        <a
                          href={musica.youtubeLinks?.[0]?.url || youtubeLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 border-2 border-[#1E1B2E] bg-white hover:bg-red-50 text-red-700 text-xs font-mono font-bold uppercase shadow-[1px_1px_0px_#000] flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5"
                          title="Ouvir no YouTube"
                        >
                          <YoutubeIcon className="w-3.5 h-3.5 text-red-600" />
                          <span className="hidden sm:inline">YouTube</span>
                        </a>
                      )}

                      {/* Áudio Guia Gravado */}
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

                      {/* Botão Editar Música (EXCLUSIVO COORDENAÇÃO) */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => abrirModalEdicao(musica)}
                          className="px-2 py-1.5 border-2 border-[#581C87] bg-purple-100 hover:bg-purple-200 text-[#581C87] text-xs font-mono font-bold uppercase shadow-[1px_1px_0px_#000] flex items-center gap-1 cursor-pointer"
                          title="Editar música, arquivos e links (Coordenação)"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Editar</span>
                        </button>
                      )}
                    </div>

                    {/* Indicador / Botão Votar (Arquivadas não entram para votação) */}
                    {isArquivada ? (
                      <div
                        className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-stone-300 font-mono text-xs font-bold bg-stone-100 text-stone-500 shadow-[1px_1px_0px_#1A181B] shrink-0 select-none"
                        title="Músicas arquivadas não entram em votação"
                      >
                        <Archive className="w-3.5 h-3.5 text-stone-400" />
                        <span>Arquivada</span>
                      </div>
                    ) : isPublico ? (
                      <div
                        className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#1A181B] font-mono text-xs font-black bg-stone-100 text-stone-700 shadow-[2px_2px_0px_#1A181B] shrink-0 cursor-default select-none"
                        title="Apenas integrantes logados podem votar"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-stone-400" />
                        <span>{musica.votosFavoraveis}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleVote(musica.id, e)}
                        disabled={jaVotou}
                        className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#1A181B] font-mono text-xs font-black transition-all shadow-[2px_2px_0px_#1A181B] shrink-0 cursor-pointer ${
                          jaVotou
                            ? 'bg-[#00A868] text-white cursor-default'
                            : 'bg-white hover:bg-[#FBBF24] text-[#1A181B] active:translate-x-0.5 active:translate-y-0.5'
                        }`}
                        title={jaVotou ? 'Você já votou nesta faixa!' : 'Votar a favor desta faixa no desfile'}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${jaVotou ? 'text-white' : 'text-[#E6007E]'}`} />
                        <span>{musica.votosFavoraveis}</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* SUB-ABA 2: CONVENÇÕES MUSICAIS DO BLOCO                       */}
      {/* ============================================================== */}
      {subAba === 'convencoes' && (
        <div className="space-y-4">
          {/* Banner de Convenções Musicais */}
          <div className="bg-[#581C87] border-4 border-[#1A181B] p-4 text-white shadow-[4px_4px_0px_#1A181B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="stamp stamp-gold text-xs">Arranjos & Dinâmica</span>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-[#FBBF24] font-mono mt-1">
                Convenções Musicais
              </h2>
              <p className="text-xs font-mono text-purple-200 mt-1 max-w-xl">
                Paradas, subidas, viradas da bateria, convenções dos metais e marcações rítmicas com tutoriais em vídeo e partituras anexadas.
              </p>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={abrirNovaConvencao}
                className="vintage-button px-4 py-2 bg-[#FBBF24] text-[#1A181B] hover:bg-[#e0ab1f] text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nova Convenção</span>
              </button>
            )}
          </div>

          {/* Banner Público Informativo */}
          {isPublico && (
            <div className="p-3 bg-amber-50 border-2 border-[#1A181B] font-mono text-xs text-amber-900 shadow-[2px_2px_0px_#1A181B]">
              <span>👁️ <strong>Consulta Pública:</strong> Veja as convenções e assista aos vídeos. Documentos e partituras completas requerem login.</span>
            </div>
          )}

          {/* Filtros de Categoria de Convenção */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {['Todas', 'Geral', 'Bateria', 'Metais', 'Harmonia', 'Vozes'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFiltroConvencao(cat)}
                className={`px-3 py-1.5 border-2 border-[#1A181B] font-mono text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#1A181B] cursor-pointer ${
                  filtroConvencao === cat
                    ? 'bg-[#E6007E] text-white'
                    : 'bg-white text-[#1A181B] hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Lista de Cards de Convenções */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {convencoesFiltradas.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white border-2 border-dashed border-stone-300 font-mono text-xs text-stone-500">
                Nenhuma convenção musical cadastrada nesta categoria.
                {isAdmin && ' Clique em "+ Nova Convenção" para cadastrar a primeira!'}
              </div>
            ) : (
              convencoesFiltradas.map((conv) => (
                <div
                  key={conv.id}
                  className="vintage-card p-4 flex flex-col justify-between border-4 border-[#1A181B] bg-white shadow-[4px_4px_0px_#1A181B]"
                >
                  <div>
                    {/* Cabeçalho do Card */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-black uppercase border border-black bg-[#BBF7D0] text-[#00A868]">
                        {conv.categoria || 'Geral'}
                      </span>

                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => abrirEdicaoConvencao(conv)}
                            className="p-1 border border-stone-400 bg-stone-100 hover:bg-purple-100 text-[#581C87] text-xs font-mono font-bold"
                            title="Editar Convenção"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExcluirConvencao(conv.id)}
                            className="p-1 border border-red-300 bg-red-50 hover:bg-red-200 text-red-600 text-xs font-mono font-bold"
                            title="Excluir Convenção"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="font-mono font-black text-base text-[#1A181B] mb-2">
                      {conv.titulo}
                    </h3>

                    {conv.descricao && (
                      <p className="text-xs font-mono text-stone-700 bg-stone-50 border border-stone-200 p-2.5 mb-3 leading-relaxed whitespace-pre-wrap">
                        {conv.descricao}
                      </p>
                    )}
                  </div>

                  {/* Links de Vídeos e Documentos */}
                  <div className="space-y-2 pt-2 border-t-2 border-stone-200">
                    {/* Vídeos do YouTube */}
                    {conv.videoUrls && conv.videoUrls.length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono font-bold text-red-700 uppercase flex items-center gap-1 mb-1">
                          <YoutubeIcon className="w-3 h-3 text-red-600" /> Vídeos de Demonstração:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {conv.videoUrls.map((v, i) => (
                            <a
                              key={i}
                              href={v.url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 font-mono text-[11px] font-bold uppercase flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>{v.rotulo || `Vídeo ${i + 1}`}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documentos & Partituras */}
                    {conv.documentoUrls && conv.documentoUrls.length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#581C87] uppercase flex items-center gap-1 mb-1">
                          <FileText className="w-3 h-3 text-[#581C87]" /> Documentos & Partituras:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {conv.documentoUrls.map((d, i) => (
                            isPublico ? (
                              <span
                                key={i}
                                className="px-2 py-1 bg-stone-100 border border-stone-300 text-stone-500 font-mono text-[11px] flex items-center gap-1"
                                title="Login necessário para baixar"
                              >
                                <Lock className="w-3 h-3 text-stone-400" />
                                <span>{d.nome}</span>
                              </span>
                            ) : (
                              <a
                                key={i}
                                href={d.url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 bg-purple-50 hover:bg-purple-100 border border-[#581C87] text-[#581C87] font-mono text-[11px] font-bold uppercase flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                <span>{d.nome}</span>
                              </a>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: NOVA CONVENÇÃO MUSICAL (EXCLUSIVO COORDENAÇÃO)          */}
      {/* ============================================================== */}
      {modalNovaConvencao && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1A181B] p-6 max-w-lg w-full shadow-[6px_6px_0px_#1A181B] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200">
              <div className="stamp stamp-urgent text-xs">Nova Convenção Musical</div>
              <button
                type="button"
                onClick={() => setModalNovaConvencao(false)}
                className="text-stone-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovaConvencao} className="space-y-4 mt-4 font-mono text-xs">
              <div>
                <label className="block font-black text-[#1A181B] mb-1 uppercase">
                  Título da Convenção *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Paradinha 1 - Refrão com Bateria e Metais"
                  value={convTitulo}
                  onChange={(e) => setConvTitulo(e.target.value)}
                  className="w-full p-2 border-2 border-[#1A181B] font-mono text-xs focus:bg-amber-50"
                />
              </div>

              <div>
                <label className="block font-black text-[#1A181B] mb-1 uppercase">
                  Categoria / Naipe
                </label>
                <select
                  value={convCategoria}
                  onChange={(e) => setConvCategoria(e.target.value)}
                  className="w-full p-2 border-2 border-[#1A181B] font-mono text-xs bg-white"
                >
                  <option value="Geral">Geral & Regência</option>
                  <option value="Bateria">Bateria & Percussão</option>
                  <option value="Metais">Metais & Sopros</option>
                  <option value="Harmonia">Harmonia & Cordas</option>
                  <option value="Vozes">Vozes & Coro</option>
                </select>
              </div>

              <div>
                <label className="block font-black text-[#1A181B] mb-1 uppercase">
                  Descrição / Instrução Técnica
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva a contagem, tempo do breque, retorno dos instrumentos..."
                  value={convDescricao}
                  onChange={(e) => setConvDescricao(e.target.value)}
                  className="w-full p-2 border-2 border-[#1A181B] font-mono text-xs focus:bg-amber-50"
                />
              </div>

              {/* Múltiplos Links de Vídeo */}
              <div className="border-2 border-red-300 p-3 bg-red-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-red-800 uppercase flex items-center gap-1">
                    <YoutubeIcon className="w-3.5 h-3.5 text-red-600" /> Links de Vídeo (YouTube)
                  </span>
                  <button
                    type="button"
                    onClick={() => setConvVideos(prev => [...prev, { rotulo: 'Outro Vídeo', url: '' }])}
                    className="text-[11px] font-bold text-red-700 hover:underline uppercase"
                  >
                    + Adicionar Link
                  </button>
                </div>

                {convVideos.map((vid, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Rótulo (ex: Tutorial)"
                      value={vid.rotulo || ''}
                      onChange={(e) => {
                        const copy = [...convVideos];
                        copy[idx].rotulo = e.target.value;
                        setConvVideos(copy);
                      }}
                      className="w-1/3 p-1.5 border border-stone-400 text-xs bg-white"
                    />
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={vid.url}
                      onChange={(e) => {
                        const copy = [...convVideos];
                        copy[idx].url = e.target.value;
                        setConvVideos(copy);
                      }}
                      className="flex-1 p-1.5 border border-stone-400 text-xs bg-white"
                    />
                    {convVideos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setConvVideos(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Upload de Documentos Anexos */}
              <div className="border-2 border-purple-300 p-3 bg-purple-50/50 space-y-2">
                <span className="font-black text-[#581C87] uppercase flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Anexar Documentos & Partituras
                </span>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleUploadArquivos(e, setConvDocumentos as any)}
                  className="w-full text-xs"
                />
                {convDocumentos.length > 0 && (
                  <div className="space-y-1">
                    {convDocumentos.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-1 bg-white border border-purple-200">
                        <span className="truncate">{doc.nome}</span>
                        <button
                          type="button"
                          onClick={() => setConvDocumentos(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-stone-200">
                <button
                  type="button"
                  onClick={() => setModalNovaConvencao(false)}
                  className="px-4 py-2 border-2 border-stone-400 bg-stone-100 text-stone-700 font-bold uppercase hover:bg-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-5 py-2 bg-[#581C87] text-[#FBBF24] font-black uppercase hover:bg-[#431464] shadow-[2px_2px_0px_#000]"
                >
                  Salvar Convenção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDITAR CONVENÇÃO MUSICAL (EXCLUSIVO COORDENAÇÃO)        */}
      {/* ============================================================== */}
      {convencaoParaEditar && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1A181B] p-6 max-w-lg w-full shadow-[6px_6px_0px_#1A181B] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200">
              <div className="stamp stamp-urgent text-xs">Editar Convenção Musical</div>
              <button
                type="button"
                onClick={() => setConvencaoParaEditar(null)}
                className="text-stone-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarEdicaoConvencao} className="space-y-4 mt-4 font-mono text-xs">
              <div>
                <label className="block font-black text-[#1A181B] mb-1 uppercase">
                  Título da Convenção *
                </label>
                <input
                  type="text"
                  required
                  value={convTitulo}
                  onChange={(e) => setConvTitulo(e.target.value)}
                  className="w-full p-2 border-2 border-[#1A181B] font-mono text-xs focus:bg-amber-50"
                />
              </div>

              <div>
                <label className="block font-black text-[#1A181B] mb-1 uppercase">
                  Categoria / Naipe
                </label>
                <select
                  value={convCategoria}
                  onChange={(e) => setConvCategoria(e.target.value)}
                  className="w-full p-2 border-2 border-[#1A181B] font-mono text-xs bg-white"
                >
                  <option value="Geral">Geral & Regência</option>
                  <option value="Bateria">Bateria & Percussão</option>
                  <option value="Metais">Metais & Sopros</option>
                  <option value="Harmonia">Harmonia & Cordas</option>
                  <option value="Vozes">Vozes & Coro</option>
                </select>
              </div>

              <div>
                <label className="block font-black text-[#1A181B] mb-1 uppercase">
                  Descrição / Instrução Técnica
                </label>
                <textarea
                  rows={3}
                  value={convDescricao}
                  onChange={(e) => setConvDescricao(e.target.value)}
                  className="w-full p-2 border-2 border-[#1A181B] font-mono text-xs focus:bg-amber-50"
                />
              </div>

              {/* Vídeos */}
              <div className="border-2 border-red-300 p-3 bg-red-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-red-800 uppercase flex items-center gap-1">
                    <YoutubeIcon className="w-3.5 h-3.5 text-red-600" /> Links de Vídeo (YouTube)
                  </span>
                  <button
                    type="button"
                    onClick={() => setConvVideos(prev => [...prev, { rotulo: 'Novo Vídeo', url: '' }])}
                    className="text-[11px] font-bold text-red-700 hover:underline uppercase"
                  >
                    + Adicionar Link
                  </button>
                </div>

                {convVideos.map((vid, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Rótulo"
                      value={vid.rotulo || ''}
                      onChange={(e) => {
                        const copy = [...convVideos];
                        copy[idx].rotulo = e.target.value;
                        setConvVideos(copy);
                      }}
                      className="w-1/3 p-1.5 border border-stone-400 text-xs bg-white"
                    />
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={vid.url}
                      onChange={(e) => {
                        const copy = [...convVideos];
                        copy[idx].url = e.target.value;
                        setConvVideos(copy);
                      }}
                      className="flex-1 p-1.5 border border-stone-400 text-xs bg-white"
                    />
                    {convVideos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setConvVideos(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Upload de Documentos */}
              <div className="border-2 border-purple-300 p-3 bg-purple-50/50 space-y-2">
                <span className="font-black text-[#581C87] uppercase flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Documentos & Partituras Anexadas
                </span>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleUploadArquivos(e, setConvDocumentos as any)}
                  className="w-full text-xs"
                />
                {convDocumentos.length > 0 && (
                  <div className="space-y-1">
                    {convDocumentos.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-1 bg-white border border-purple-200">
                        <span className="truncate">{doc.nome}</span>
                        <button
                          type="button"
                          onClick={() => setConvDocumentos(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t-2 border-stone-200">
                <button
                  type="button"
                  onClick={() => handleExcluirConvencao(convencaoParaEditar.id)}
                  className="px-3 py-2 border-2 border-red-500 bg-red-100 text-red-700 font-bold uppercase hover:bg-red-200"
                >
                  Excluir
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConvencaoParaEditar(null)}
                    className="px-4 py-2 border-2 border-stone-400 bg-stone-100 text-stone-700 font-bold uppercase hover:bg-stone-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="vintage-button px-5 py-2 bg-[#00A868] text-white font-black uppercase hover:bg-[#008f58] shadow-[2px_2px_0px_#000]"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: VER PARTITURA E ARQUIVOS (SEM BOTÃO DE CIFRAS)          */}
      {/* ============================================================== */}
      {modalPartitura && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1A181B] p-6 max-w-lg w-full shadow-[6px_6px_0px_#1A181B] max-h-[90vh] overflow-y-auto">
            <div className="stamp stamp-urgent text-xs mb-2">Partitura & Guia de Metais</div>
            <h3 className="text-lg font-black uppercase text-[#1A181B] font-mono">
              {modalPartitura.titulo}
            </h3>
            <p className="text-xs font-mono text-stone-600 mb-4">
              {modalPartitura.artistaOriginal} • Ritmo: {modalPartitura.ritmo}
            </p>

            {/* Lista de Arquivos Anexados para Download */}
            {modalPartitura.arquivos && modalPartitura.arquivos.length > 0 && (
              <div className="mb-4 space-y-2 border-2 border-purple-200 p-3 bg-purple-50">
                <div className="font-mono text-xs font-bold text-[#581C87] uppercase flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>Arquivos Anexados ({modalPartitura.arquivos.length}):</span>
                </div>
                <div className="space-y-1">
                  {modalPartitura.arquivos.map((arq, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-2 border border-purple-200 text-xs font-mono">
                      <span className="truncate max-w-[240px] font-bold text-stone-800">
                        📄 {arq.nome}
                      </span>
                      {arq.url && (
                        <a
                          href={arq.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-[#581C87] text-[#FBBF24] hover:bg-[#431464] text-[11px] font-bold uppercase shadow-[1px_1px_0px_#000]"
                        >
                          Baixar / Abrir
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Partitura e Instruções */}
            <div className="p-3 bg-stone-50 border-2 border-[#1E1B2E] font-mono text-xs text-stone-800 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {modalPartitura.partituraTexto ||
                'Partitura padrão transcrita pela direção musical (Fael). Consulte as convenções musicais do bloco para detalhes de execução.'}
            </div>

            <div className="flex items-center justify-end pt-4 border-t-2 border-stone-200 mt-4">
              <button
                type="button"
                onClick={() => setModalPartitura(null)}
                className="px-4 py-1.5 border-2 border-[#1E1B2E] bg-stone-100 text-stone-900 text-xs font-bold uppercase hover:bg-stone-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: MÚLTIPLAS VERSÕES DE RITMO NO YOUTUBE                  */}
      {/* ============================================================== */}
      {modalYoutubeVersoes && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1A181B] p-6 max-w-md w-full shadow-[6px_6px_0px_#1A181B]">
            <div className="stamp stamp-urgent text-xs mb-2">Opções de Ritmos & Versões</div>
            <h3 className="text-base font-black uppercase text-[#1A181B] font-mono flex items-center gap-2">
              <YoutubeIcon className="w-5 h-5 text-red-600" />
              <span>{modalYoutubeVersoes.titulo}</span>
            </h3>
            <p className="text-xs font-mono text-stone-600 mt-1 mb-4">
              Escolha qual versão e ritmo você deseja ouvir:
            </p>

            <div className="space-y-2 mb-6">
              {modalYoutubeVersoes.youtubeLinks?.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 border-2 border-[#1A181B] bg-red-50 hover:bg-red-100 text-[#1A181B] font-mono text-xs font-bold uppercase transition-all shadow-[2px_2px_0px_#1A181B]"
                >
                  <div className="flex items-center gap-2">
                    <YoutubeIcon className="w-4 h-4 text-red-600" />
                    <span>{link.rotulo || `Opção ${idx + 1}`}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-600" />
                </a>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setModalYoutubeVersoes(null)}
                className="px-4 py-1.5 border-2 border-[#1E1B2E] bg-stone-100 text-stone-900 text-xs font-bold uppercase hover:bg-stone-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: SUGERIR NOVA MÚSICA                                     */}
      {/* ============================================================== */}
      {modalNovaMusica && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1A181B] p-6 max-w-lg w-full shadow-[6px_6px_0px_#1A181B] max-h-[90vh] overflow-y-auto">
            <div className="stamp stamp-urgent text-xs mb-2">Nova Sugestão de Repertório</div>
            <h3 className="text-lg font-black uppercase text-[#1A181B] font-mono mb-4">
              Sugerir Música para Votação
            </h3>

            <form onSubmit={handleAddSong} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#1A181B] uppercase mb-1">
                  Título da Música *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Frevo Mulher, Eva, Avisa Lá..."
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full p-2 border-2 border-[#1A181B] font-mono text-xs focus:bg-amber-50"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#1A181B] uppercase mb-1">
                  Artista / Banda Original *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Banda Banda Eva, Zé Ramalho, Olodum..."
                  value={novoArtista}
                  onChange={(e) => setNovoArtista(e.target.value)}
                  className="w-full p-2 border-2 border-[#1A181B] font-mono text-xs focus:bg-amber-50"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#1A181B] uppercase mb-1">
                  Ritmo Carnavalesco Proposto
                </label>
                <select
                  value={novoRitmo}
                  onChange={(e) => setNovoRitmo(e.target.value)}
                  className="w-full p-2 border-2 border-[#1A181B] font-mono text-xs bg-white"
                >
                  <option value="Axé / Samba-Reggae">Axé / Samba-Reggae</option>
                  <option value="Frevo">Frevo</option>
                  <option value="Marchinha Tradicional">Marchinha Tradicional</option>
                  <option value="Samba-Enredo">Samba-Enredo</option>
                  <option value="Ijexá / Afoxé">Ijexá / Afoxé</option>
                  <option value="Galope / Forró">Galope / Forró Elétrico</option>
                </select>
              </div>

              {/* Links do YouTube */}
              <div className="border-2 border-red-200 p-3 bg-red-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-red-800 uppercase flex items-center gap-1.5">
                    <YoutubeIcon className="w-3.5 h-3.5 text-red-600" />
                    <span>Links do YouTube (Opções de Ritmos/Versões)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setNovoLinksYoutube(prev => [...prev, { rotulo: 'Outra Versão / Ritmo', url: '' }])}
                    className="text-[11px] font-mono font-bold text-red-700 hover:underline uppercase"
                  >
                    + Adicionar Outro Link
                  </button>
                </div>

                {novoLinksYoutube.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Rótulo (ex: Versão Frevo)"
                      value={link.rotulo || ''}
                      onChange={(e) => {
                        const copy = [...novoLinksYoutube];
                        copy[idx].rotulo = e.target.value;
                        setNovoLinksYoutube(copy);
                      }}
                      className="w-1/3 p-1.5 border border-stone-400 font-mono text-xs bg-white"
                    />
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={link.url}
                      onChange={(e) => {
                        const copy = [...novoLinksYoutube];
                        copy[idx].url = e.target.value;
                        setNovoLinksYoutube(copy);
                      }}
                      className="flex-1 p-1.5 border border-stone-400 font-mono text-xs bg-white"
                    />
                    {novoLinksYoutube.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setNovoLinksYoutube(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Upload de Múltiplos Arquivos */}
              <div className="border-2 border-purple-200 p-3 bg-purple-50/50 space-y-2">
                <span className="text-xs font-mono font-bold text-[#581C87] uppercase flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Arquivos de Repertório (Partituras, Cifras, Áudios)</span>
                </span>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleUploadArquivos(e, setNovosArquivos)}
                  className="w-full font-mono text-xs"
                />
                {novosArquivos.length > 0 && (
                  <div className="space-y-1">
                    {novosArquivos.map((arq, idx) => (
                      <div key={idx} className="flex items-center justify-between p-1 bg-white border border-purple-200 text-xs font-mono">
                        <span className="truncate">{arq.nome}</span>
                        <button
                          type="button"
                          onClick={() => setNovosArquivos(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#1A181B] uppercase mb-1">
                  Notas de Arranjo ou Partitura Texto (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Instruções de metais, paradas, breques..."
                  value={novoTextoPartitura}
                  onChange={(e) => setNovoTextoPartitura(e.target.value)}
                  className="w-full p-2 border-2 border-[#1A181B] font-mono text-xs focus:bg-amber-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t-2 border-stone-200">
                <button
                  type="button"
                  onClick={() => setModalNovaMusica(false)}
                  className="px-4 py-2 border-2 border-[#1E1B2E] bg-stone-100 text-stone-800 text-xs font-bold uppercase hover:bg-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-5 py-2 bg-[#E6007E] text-white text-xs font-bold uppercase hover:bg-[#C2006A] shadow-[2px_2px_0px_#000]"
                >
                  Publicar Sugestão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDITAR MÚSICA (EXCLUSIVO COORDENAÇÃO)                   */}
      {/* ============================================================== */}
      {musicaParaEditar && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1A181B] p-6 max-w-lg w-full shadow-[6px_6px_0px_#1A181B] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200">
              <div className="stamp stamp-urgent text-xs">Gestão da Coordenação</div>
              <button
                type="button"
                onClick={() => setMusicaParaEditar(null)}
                className="text-stone-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-base font-black uppercase text-[#1A181B] font-mono mt-2 mb-4 flex items-center gap-2">
              <Pencil className="w-4 h-4 text-[#581C87]" />
              <span>Editar Faixa do Repertório</span>
            </h3>

            <form onSubmit={handleSalvarEdicao} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#1A181B] uppercase mb-1">
                  Título da Música *
                </label>
                <input
                  type="text"
                  required
                  value={editTitulo}
                  onChange={(e) => setEditTitulo(e.target.value)}
                  className="w-full p-2 border-2 border-[#1A181B] font-mono text-xs focus:bg-amber-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#1A181B] uppercase mb-1">
                    Artista / Banda Original
                  </label>
                  <input
                    type="text"
                    value={editArtista}
                    onChange={(e) => setEditArtista(e.target.value)}
                    className="w-full p-2 border-2 border-[#1A181B] font-mono text-xs focus:bg-amber-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#1A181B] uppercase mb-1">
                    Ritmo Carnavalesco
                  </label>
                  <select
                    value={editRitmo}
                    onChange={(e) => setEditRitmo(e.target.value)}
                    className="w-full p-2 border-2 border-[#1A181B] font-mono text-xs bg-white"
                  >
                    <option value="Axé / Samba-Reggae">Axé / Samba-Reggae</option>
                    <option value="Frevo">Frevo</option>
                    <option value="Marchinha Tradicional">Marchinha Tradicional</option>
                    <option value="Samba-Enredo">Samba-Enredo</option>
                    <option value="Ijexá / Afoxé">Ijexá / Afoxé</option>
                    <option value="Galope / Forró">Galope / Forró Elétrico</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#1A181B] uppercase mb-1">
                  Status de Curadoria
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full p-2 border-2 border-[#1A181B] font-mono text-xs bg-white font-bold"
                >
                  <option value="Confirmada">Confirmada (Setlist Oficial)</option>
                  <option value="Em Votação">Em Votação (Aberta a Votos)</option>
                  <option value="Arquivada">Arquivada (Fora da votação e do desfile)</option>
                </select>
              </div>

              {/* Links do YouTube */}
              <div className="border-2 border-red-200 p-3 bg-red-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-red-800 uppercase flex items-center gap-1.5">
                    <YoutubeIcon className="w-3.5 h-3.5 text-red-600" />
                    <span>Links do YouTube</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditLinksYoutube(prev => [...prev, { rotulo: 'Nova Versão', url: '' }])}
                    className="text-[11px] font-mono font-bold text-red-700 hover:underline uppercase"
                  >
                    + Adicionar Link
                  </button>
                </div>

                {editLinksYoutube.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Rótulo"
                      value={link.rotulo || ''}
                      onChange={(e) => {
                        const copy = [...editLinksYoutube];
                        copy[idx].rotulo = e.target.value;
                        setEditLinksYoutube(copy);
                      }}
                      className="w-1/3 p-1.5 border border-stone-400 font-mono text-xs bg-white"
                    />
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={link.url}
                      onChange={(e) => {
                        const copy = [...editLinksYoutube];
                        copy[idx].url = e.target.value;
                        setEditLinksYoutube(copy);
                      }}
                      className="flex-1 p-1.5 border border-stone-400 font-mono text-xs bg-white"
                    />
                    {editLinksYoutube.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setEditLinksYoutube(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Upload de Arquivos */}
              <div className="border-2 border-purple-200 p-3 bg-purple-50/50 space-y-2">
                <span className="text-xs font-mono font-bold text-[#581C87] uppercase flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Anexar Novos Arquivos (Partituras / Cifras)</span>
                </span>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleUploadArquivos(e, setEditArquivos)}
                  className="w-full font-mono text-xs"
                />
                {editArquivos.length > 0 && (
                  <div className="space-y-1">
                    {editArquivos.map((arq, idx) => (
                      <div key={idx} className="flex items-center justify-between p-1 bg-white border border-purple-200 text-xs font-mono">
                        <span className="truncate">{arq.nome}</span>
                        <button
                          type="button"
                          onClick={() => setEditArquivos(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#1A181B] uppercase mb-1">
                  Texto da Partitura & Arranjos
                </label>
                <textarea
                  rows={2}
                  value={editTextoPartitura}
                  onChange={(e) => setEditTextoPartitura(e.target.value)}
                  className="w-full p-2 border-2 border-[#1A181B] font-mono text-xs focus:bg-amber-50"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t-2 border-stone-200">
                <button
                  type="button"
                  onClick={() => handleExcluirMusica(musicaParaEditar.id)}
                  className="px-3.5 py-2 border-2 border-red-600 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold uppercase"
                >
                  Excluir Faixa
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMusicaParaEditar(null)}
                    className="px-3.5 py-2 border-2 border-[#1E1B2E] bg-stone-100 text-stone-800 text-xs font-bold uppercase hover:bg-stone-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="vintage-button px-5 py-2 bg-[#00A868] text-white text-xs font-bold uppercase hover:bg-[#008f58] shadow-[2px_2px_0px_#000]"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DOWNLOAD DO CADERNO DE PARTITURAS EM PDF               */}
      {/* ============================================================== */}
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
                        <span className="font-bold">
                          {m.statusCuradoria === 'Arquivada' ? '[Arquivada]' : `#${m.ordemDesfile}`} {m.titulo}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500">{m.ritmo}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ações do Modal */}
            <div className="mt-auto pt-4 border-t-2 border-stone-200 flex items-center justify-end gap-2">
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
      )}
    </div>
  );
}
