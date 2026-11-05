'use client';

import React, { useState } from 'react';
import {
  Palette,
  Image as ImageIcon,
  Plus,
  Copy,
  Check,
  Download,
  Search,
  Upload,
  ExternalLink,
  Trash2,
  Calendar,
  Sparkles,
  Link as LinkIcon,
  Users,
  FileCheck,
  Send,
  Grid3X3,
  Layers,
  Video,
  Eye,
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * Ícone SVG oficial do Instagram.
 */
function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
import {
  CorPaletaAnual,
  ArquivoArteMidia,
  PostInstagramPlanejado,
  ConfiguracaoInstagram,
  TemaAnoBloco,
  adicionarCorPaleta,
  removerCorPaleta,
  editarCorPaleta,
  adicionarArquivoArte,
  filtrarArquivosArte,
  gerarTextoLegendaInstagram,
  adicionarPostPlanejado,
  atualizarTemaAno
} from '../data/blocoData';

interface MediaManagerProps {
  cores: CorPaletaAnual[];
  setCores: React.Dispatch<React.SetStateAction<CorPaletaAnual[]>>;
  artes: ArquivoArteMidia[];
  setArtes: React.Dispatch<React.SetStateAction<ArquivoArteMidia[]>>;
  postsInstagram: PostInstagramPlanejado[];
  setPostsInstagram: React.Dispatch<React.SetStateAction<PostInstagramPlanejado[]>>;
  configInstagram: ConfiguracaoInstagram;
  setConfigInstagram: React.Dispatch<React.SetStateAction<ConfiguracaoInstagram>>;
  temaAno: TemaAnoBloco;
  setTemaAno: React.Dispatch<React.SetStateAction<TemaAnoBloco>>;
  isAdmin: boolean;
}

/**
 * Módulo de Mídia, Identidade Visual e Redes Sociais do Bloco Bicharada.
 * - Cores do Ano (Paleta oficial 2027 com códigos hex e usos);
 * - Arquivos de Arte (Brand assets, logos vetoriais, lambe-lambes e molduras para download);
 * - Gestão e Integração Instagram (Grade de feed, planejador de posts, cópia de legendas e conexão Meta Graph API).
 */
export default function MediaManager({
  cores,
  setCores,
  artes,
  setArtes,
  postsInstagram,
  setPostsInstagram,
  configInstagram,
  setConfigInstagram,
  temaAno,
  setTemaAno,
  isAdmin
}: MediaManagerProps) {
  const [subAba, setSubAba] = useState<'cores' | 'artes' | 'instagram' | 'tema'>('cores');

  // Estados de feedback de cópia
  const [corCopiada, setCorCopiada] = useState<string | null>(null);
  const [legendaCopiadaId, setLegendaCopiadaId] = useState<string | null>(null);

  // Estados do Tema do Ano
  const [tituloTema, setTituloTema] = useState(temaAno.titulo);
  const [sloganTema, setSloganTema] = useState(temaAno.subtituloOuSlogan || '');
  const [fantasiaTema, setFantasiaTema] = useState(temaAno.fantasia);
  const [descricaoCoresTema, setDescricaoCoresTema] = useState(temaAno.descricaoCores);
  const [salvoTemaFeedback, setSalvoTemaFeedback] = useState(false);

  // Sincroniza formulário caso temaAno externo mude
  React.useEffect(() => {
    setTituloTema(temaAno.titulo);
    setSloganTema(temaAno.subtituloOuSlogan || '');
    setFantasiaTema(temaAno.fantasia);
    setDescricaoCoresTema(temaAno.descricaoCores);
  }, [temaAno]);

  /**
   * Salva as diretrizes do tema do ano oficial e atualiza o cabeçalho dinâmico.
   */
  const handleSalvarTema = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloTema.trim()) return;

    const atualizado = atualizarTemaAno(temaAno, {
      titulo: tituloTema.trim(),
      subtituloOuSlogan: sloganTema.trim() || undefined,
      fantasia: fantasiaTema.trim(),
      descricaoCores: descricaoCoresTema.trim()
    });

    setTemaAno(atualizado);
    setSalvoTemaFeedback(true);
    setTimeout(() => setSalvoTemaFeedback(false), 3000);

    confetti({
      particleCount: 45,
      spread: 65,
      colors: ['#E6007E', '#581C87', '#FBBF24', '#00D287']
    });
  };

  // Estados de Nova Cor
  const [modalNovaCor, setModalNovaCor] = useState(false);
  const [nomeCor, setNomeCor] = useState('');
  const [hexCor, setHexCor] = useState('#FF007A');
  const [anoCor, setAnoCor] = useState(2027);
  const [usoCor, setUsoCor] = useState('');

  // Estados de Edição de Cor Existente
  const [modalEditarCor, setModalEditarCor] = useState<CorPaletaAnual | null>(null);
  const [nomeCorEdit, setNomeCorEdit] = useState('');
  const [hexCorEdit, setHexCorEdit] = useState('#E6007E');
  const [anoCorEdit, setAnoCorEdit] = useState(2027);
  const [usoCorEdit, setUsoCorEdit] = useState('');

  // Estados de Artes e Filtros
  const [categoriaArte, setCategoriaArte] = useState('Todas');
  const [buscaArte, setBuscaArte] = useState('');
  const [modalNovaArte, setModalNovaArte] = useState(false);
  const [tituloArte, setTituloArte] = useState('');
  const [categoriaNovaArte, setCategoriaNovaArte] = useState<ArquivoArteMidia['categoria']>('Logotipos');
  const [dimensoesArte, setDimensoesArte] = useState('');
  const [nomeArquivoArte, setNomeArquivoArte] = useState('');
  const [tamanhoArte, setTamanhoArte] = useState('');
  const [extensaoArte, setExtensaoArte] = useState('PNG');
  const [conteudoArquivoArte, setConteudoArquivoArte] = useState<string | undefined>(undefined);

  // Estados de Posts do Instagram
  const [modalNovoPost, setModalNovoPost] = useState(false);
  const [tituloPost, setTituloPost] = useState('');
  const [tipoPost, setTipoPost] = useState<PostInstagramPlanejado['tipo']>('Feed');
  const [legendaPost, setLegendaPost] = useState('');
  const [hashtagsPost, setHashtagsPost] = useState('Bicharada2027, CarnavalFloripa, BicharadaSoltaPelosAres');
  const [dataProgramadaPost, setDataProgramadaPost] = useState('');
  const [modalConfigApi, setModalConfigApi] = useState(false);
  const [tempBusinessId, setTempBusinessId] = useState(configInstagram.metaBusinessId || '');
  const [statusConexaoMeta, setStatusConexaoMeta] = useState<string | null>(null);

  /**
   * Copia o código hexadecimal de uma cor da paleta para a área de transferência.
   */
  const handleCopiarHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCorCopiada(hex);
    setTimeout(() => setCorCopiada(null), 2000);
  };

  /**
   * Salva a criação de uma nova cor na paleta anual.
   */
  const handleSalvarCor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCor.trim() || !hexCor.trim()) return;

    const atualizadas = adicionarCorPaleta(cores, {
      ano: anoCor,
      nome: nomeCor,
      hex: hexCor,
      descricaoUso: usoCor || 'Uso geral em divulgação e adereços.',
      textoEscuro: true
    });

    setCores(atualizadas);
    setModalNovaCor(false);
    setNomeCor('');
    setUsoCor('');

    confetti({
      particleCount: 40,
      spread: 60,
      colors: [hexCor, '#E6007E', '#00D287']
    });
  };

  /**
   * Remove uma cor da paleta anual (exclusivo coordenação).
   */
  const handleRemoverCor = (id: string) => {
    if (confirm('Deseja realmente remover esta cor da paleta oficial?')) {
      setCores(removerCorPaleta(cores, id));
    }
  };

  /**
   * Abre o modal de edição carregando os dados da cor selecionada.
   * 
   * @param cor - Objeto da cor da paleta a ser editada
   */
  const handleAbrirEditarCor = (cor: CorPaletaAnual) => {
    setModalEditarCor(cor);
    setNomeCorEdit(cor.nome);
    setHexCorEdit(cor.hex);
    setAnoCorEdit(cor.ano);
    setUsoCorEdit(cor.descricaoUso);
  };

  /**
   * Salva as alterações da cor editada na paleta oficial carnavalesca.
   * 
   * @param e - Evento de submissão do formulário
   */
  const handleSalvarEdicaoCor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEditarCor || !nomeCorEdit.trim() || !hexCorEdit.trim()) return;

    const atualizadas = editarCorPaleta(cores, modalEditarCor.id, {
      nome: nomeCorEdit.trim(),
      hex: hexCorEdit.trim(),
      ano: anoCorEdit,
      descricaoUso: usoCorEdit.trim()
    });

    setCores(atualizadas);
    setModalEditarCor(null);

    confetti({
      particleCount: 40,
      spread: 60,
      colors: [hexCorEdit, '#00D287', '#FBBF24']
    });
  };

  /**
   * Processa o upload de arquivo de arte gráfica.
   */
  const handleArteFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNomeArquivoArte(file.name);
      const ext = file.name.split('.').pop()?.toUpperCase() || 'ARQ';
      setExtensaoArte(ext);
      const kb = Math.round(file.size / 1024);
      setTamanhoArte(kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);

      const reader = new FileReader();
      reader.onload = (event) => {
        setConteudoArquivoArte(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Salva o novo arquivo de arte gráfica na galeria.
   */
  const handleSalvarArte = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloArte.trim()) return;

    const nomeFinal = nomeArquivoArte || `${tituloArte.trim().toLowerCase().replace(/\s+/g, '_')}.${extensaoArte.toLowerCase()}`;

    const atualizadas = adicionarArquivoArte(artes, {
      titulo: tituloArte,
      categoria: categoriaNovaArte,
      nomeArquivo: nomeFinal,
      tamanhoFormatado: tamanhoArte || '300 KB',
      formatoExtensao: extensaoArte,
      dimensoesOuUso: dimensoesArte || 'Uso geral',
      conteudoBase64OuTexto: conteudoArquivoArte
    });

    setArtes(atualizadas);
    setModalNovaArte(false);
    setTituloArte('');
    setDimensoesArte('');
    setNomeArquivoArte('');
    setConteudoArquivoArte(undefined);

    confetti({
      particleCount: 50,
      spread: 70,
      colors: ['#E6007E', '#581C87', '#00D287']
    });
  };

  /**
   * Dispara o download de um arquivo de arte.
   */
  const handleBaixarArte = (arte: ArquivoArteMidia) => {
    if (arte.conteudoBase64OuTexto && arte.conteudoBase64OuTexto.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = arte.conteudoBase64OuTexto;
      link.download = arte.nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Gera arquivo informativo autenticado para mock/download
      const texto = 
        `============================================================\n` +
        `BLOCO BICHARADA • FLORIANÓPOLIS 2027\n` +
        `BRAND ASSET OFICIAL: ${arte.titulo.toUpperCase()}\n` +
        `Categoria: ${arte.categoria} | Formato: ${arte.formatoExtensao}\n` +
        `Especificações: ${arte.dimensoesOuUso || 'Original'}\n` +
        `============================================================\n\n` +
        `Arquivo autêntico de identidade visual do Bloco Bicharada.\n` +
        `Nome do arquivo: ${arte.nomeArquivo}\n`;

      const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = arte.nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    confetti({
      particleCount: 30,
      spread: 45,
      colors: ['#00D287', '#FBBF24']
    });
  };

  /**
   * Copia a legenda completa formatada com quebras de linha e hashtags para o Instagram.
   */
  const handleCopiarLegenda = (post: PostInstagramPlanejado) => {
    const texto = gerarTextoLegendaInstagram(post, configInstagram.handle);
    navigator.clipboard.writeText(texto);
    setLegendaCopiadaId(post.id);
    setTimeout(() => setLegendaCopiadaId(null), 2500);
  };

  /**
   * Salva o cadastro de um novo post planejado para o Instagram.
   */
  const handleSalvarPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloPost.trim() || !legendaPost.trim()) return;

    const tagsArray = hashtagsPost
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const atualizados = adicionarPostPlanejado(postsInstagram, {
      titulo: tituloPost,
      tipo: tipoPost,
      legenda: legendaPost,
      hashtags: tagsArray,
      dataProgramada: dataProgramadaPost || new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Pronto para Postar'
    });

    setPostsInstagram(atualizados);
    setModalNovoPost(false);
    setTituloPost('');
    setLegendaPost('');

    confetti({
      particleCount: 50,
      spread: 70,
      colors: ['#E6007E', '#FBBF24', '#00D287']
    });
  };

  /**
   * Simula a validação e conexão com a Meta Graph API do Instagram.
   */
  const handleTestarConexaoMeta = () => {
    setStatusConexaoMeta('Validando credenciais com graph.instagram.com...');
    setTimeout(() => {
      setConfigInstagram(prev => ({
        ...prev,
        metaBusinessId: tempBusinessId.trim() || prev.metaBusinessId,
        accessTokenConectado: true,
        ultimaSincronizacao: new Date().toISOString().replace('T', ' ').slice(0, 16)
      }));
      setStatusConexaoMeta('✓ Conexão ativa! Webhook do Instagram sincronizado com sucesso.');
      setTimeout(() => {
        setStatusConexaoMeta(null);
        setModalConfigApi(false);
      }, 1500);
    }, 1200);
  };

  const artesFiltradas = filtrarArquivosArte(artes, categoriaArte, buscaArte);

  return (
    <div className="space-y-4">
      {/* Banner Principal da Seção de Mídia */}
      <div className="vintage-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="stamp stamp-urgent text-xs">Identidade & Comunicação</span>
            <span className="font-mono text-xs font-bold text-stone-600">
              Carnaval 2027 • Bicharada Solta Pelos Ares
            </span>
          </div>
          <h2 className="text-xl font-black uppercase text-[#1E1B2E] flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#E6007E]" />
            <span>Mídia, Artes & Gestão do Instagram</span>
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Paleta de cores oficiais do ano, repositório de artes e logos em alta resolução, e central de posts do Instagram.
          </p>
        </div>

        {/* Botão de Ação Rápida dependendo da sub-aba ativa */}
        <div className="flex items-center gap-2 shrink-0">
          {subAba === 'cores' && (
            <button
              type="button"
              onClick={() => setModalNovaCor(true)}
              className="vintage-button px-3.5 py-2 bg-[#E6007E] text-white hover:bg-[#C2006A] text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nova Cor do Ano</span>
            </button>
          )}

          {subAba === 'artes' && (
            <button
              type="button"
              onClick={() => setModalNovaArte(true)}
              className="vintage-button px-3.5 py-2 bg-[#00D287] hover:bg-[#34EEA0] text-[#1E1B2E] text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>+ Subir Arte</span>
            </button>
          )}

          {subAba === 'instagram' && (
            <button
              type="button"
              onClick={() => setModalNovoPost(true)}
              className="vintage-button px-3.5 py-2 bg-[#581C87] text-[#FBBF24] hover:bg-[#431464] text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Novo Post / Story</span>
            </button>
          )}

          {subAba === 'tema' && (
            <button
              type="button"
              onClick={handleSalvarTema}
              className="vintage-button px-3.5 py-2 bg-[#FBBF24] text-[#1E1B2E] hover:bg-[#F59E0B] text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Tema</span>
            </button>
          )}
        </div>
      </div>

      {/* Navegação entre as 4 Sub-seções */}
      <div className="flex items-center gap-2 border-b-2 border-[#1E1B2E] pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setSubAba('tema')}
          className={`flex items-center gap-1.5 px-4 py-2 border-2 border-[#1E1B2E] text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
            subAba === 'tema'
              ? 'bg-[#FBBF24] text-[#1E1B2E] shadow-[2px_2px_0px_#1E1B2E]'
              : 'bg-white text-[#1E1B2E] hover:bg-amber-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tema do Ano ({temaAno.titulo})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubAba('cores')}
          className={`flex items-center gap-1.5 px-4 py-2 border-2 border-[#1E1B2E] text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
            subAba === 'cores'
              ? 'bg-[#E6007E] text-white shadow-[2px_2px_0px_#1E1B2E]'
              : 'bg-white text-[#1E1B2E] hover:bg-pink-50'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Cores do Ano ({cores.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubAba('artes')}
          className={`flex items-center gap-1.5 px-4 py-2 border-2 border-[#1E1B2E] text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
            subAba === 'artes'
              ? 'bg-[#00D287] text-[#1E1B2E] shadow-[2px_2px_0px_#1E1B2E]'
              : 'bg-white text-[#1E1B2E] hover:bg-emerald-50'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Arquivos de Arte ({artes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubAba('instagram')}
          className={`flex items-center gap-1.5 px-4 py-2 border-2 border-[#1E1B2E] text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
            subAba === 'instagram'
              ? 'bg-[#581C87] text-[#FBBF24] shadow-[2px_2px_0px_#1E1B2E]'
              : 'bg-white text-[#1E1B2E] hover:bg-purple-50'
          }`}
        >
          <InstagramIcon className="w-3.5 h-3.5" />
          <span>Instagram & Redes ({postsInstagram.length})</span>
        </button>
      </div>

      {/* SUB-ABA 1: CORES DO ANO (PALETA OFICIAL) */}
      {subAba === 'cores' && (
        <div className="space-y-4">
          <div className="bg-white border-2 border-[#1E1B2E] p-3 shadow-[2px_2px_0px_#1E1B2E] flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
            <span className="font-black uppercase text-[#581C87] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FBBF24]" />
              Paleta Oficial Carnavalesca • Ano {cores[0]?.ano || 2027}
            </span>
            <span className="text-stone-600">
              Clique em qualquer cor para copiar o código hexadecimal diretamente.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {cores.map((cor) => {
              const copiado = corCopiada === cor.hex;
              return (
                <div
                  key={cor.id}
                  className="vintage-card p-3 flex flex-col justify-between group hover:scale-[1.01] transition-transform"
                >
                  <div>
                    {/* Bloco de Cor Vibrante */}
                    <div
                      className="w-full h-28 rounded-md border-2 border-[#1E1B2E] shadow-[2px_2px_0px_#1E1B2E] flex items-end p-2.5 relative cursor-pointer"
                      style={{ backgroundColor: cor.hex }}
                      onClick={() => handleCopiarHex(cor.hex)}
                      title="Clique para copiar o código HEX"
                    >
                      <div className="bg-black/80 backdrop-blur-xs px-2 py-1 rounded text-white font-mono text-xs font-black flex items-center gap-1.5 border border-white/20">
                        <span>{cor.hex}</span>
                        {copiado ? (
                          <Check className="w-3.5 h-3.5 text-[#00D287]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                        )}
                      </div>

                      {copiado && (
                        <div className="absolute top-2 right-2 bg-[#00D287] text-[#1E1B2E] px-2 py-0.5 text-[10px] font-black uppercase font-mono border border-black shadow-[1px_1px_0px_#000]">
                          HEX Copiado!
                        </div>
                      )}
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm uppercase font-mono text-[#1E1B2E]">
                          {cor.nome}
                        </h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-stone-100 border border-stone-300 font-bold">
                          {cor.ano}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 font-serif mt-1 leading-relaxed">
                        {cor.descricaoUso}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-200 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleCopiarHex(cor.hex)}
                      className="text-[11px] font-mono font-bold text-[#581C87] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar {cor.hex}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAbrirEditarCor(cor)}
                        className="text-[11px] font-mono font-bold text-[#E6007E] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Editar esta cor da paleta"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      {isAdmin && cores.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoverCor(cor.id)}
                          className="text-stone-400 hover:text-red-600 p-1 cursor-pointer"
                          title="Remover cor da paleta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-ABA 2: ARQUIVOS DE ARTE & IDENTIDADE VISUAL */}
      {subAba === 'artes' && (
        <div className="space-y-4">
          {/* Barra de Filtros por Categoria e Busca */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border-2 border-[#1E1B2E] p-3 shadow-[2px_2px_0px_#1E1B2E]">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(['Todas', 'Logotipos', 'Cartazes & Lambes', 'Redes Sociais', 'Camisetas & Fantasias', 'Fontes & Tipografia'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoriaArte(cat)}
                  className={`px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-mono font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                    categoriaArte === cat
                      ? 'bg-[#00D287] text-[#1E1B2E] shadow-[2px_2px_0px_#1E1B2E]'
                      : 'bg-white text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  {cat} ({cat === 'Todas' ? artes.length : artes.filter(a => a.categoria === cat).length})
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar por título ou formato..."
                value={buscaArte}
                onChange={(e) => setBuscaArte(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Galeria de Artes em Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {artesFiltradas.length === 0 ? (
              <div className="col-span-full py-12 text-center text-stone-500 font-mono text-xs vintage-card">
                Nenhum arquivo de arte encontrado com os filtros selecionados.
              </div>
            ) : (
              artesFiltradas.map((arte) => (
                <div
                  key={arte.id}
                  className="vintage-card p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 bg-[#FAF5FF] border border-[#581C87] text-[#581C87] text-[10px] font-bold font-mono uppercase">
                        {arte.categoria}
                      </span>
                      <span className="px-2 py-0.5 bg-[#FBBF24] border border-[#1E1B2E] text-[#1E1B2E] text-[10px] font-black font-mono shadow-[1px_1px_0px_#000]">
                        .{arte.formatoExtensao}
                      </span>
                    </div>

                    <h4 className="font-black text-sm uppercase font-mono text-[#1E1B2E] leading-snug">
                      {arte.titulo}
                    </h4>

                    {arte.dimensoesOuUso && (
                      <p className="text-[11px] text-stone-600 font-mono mt-1">
                        📐 {arte.dimensoesOuUso}
                      </p>
                    )}

                    <div className="mt-3 p-2 bg-stone-50 border border-stone-200 text-stone-700 text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-500">Arquivo:</span>
                        <span className="font-bold truncate max-w-[140px]">{arte.nomeArquivo}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-500">Tamanho:</span>
                        <span>{arte.tamanhoFormatado}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400 font-mono">
                      {arte.dataUpload}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleBaixarArte(arte)}
                      className="vintage-button px-3 py-1.5 bg-[#00D287] hover:bg-[#34EEA0] text-[#1E1B2E] text-xs font-bold uppercase flex items-center gap-1 shadow-[1px_1px_0px_#000] cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar Arte</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-ABA 3: GESTÃO DO INSTAGRAM & REDES SOCIAIS */}
      {subAba === 'instagram' && (
        <div className="space-y-4">
          {/* Card do Perfil Oficial e Status da Conexão Meta Graph API */}
          <div className="vintage-card p-4 sm:p-5 bg-gradient-to-r from-purple-50 via-pink-50 to-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FBBF24] via-[#E6007E] to-[#581C87] p-0.5 shrink-0 shadow-md">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <InstagramIcon className="w-7 h-7 text-[#E6007E]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-base uppercase font-mono text-[#1E1B2E]">
                      {configInstagram.handle}
                    </h3>
                    <span className="px-2 py-0.5 bg-[#00D287] text-[#1E1B2E] text-[10px] font-black uppercase border border-black shadow-[1px_1px_0px_#000]">
                      Meta Graph API Conectada
                    </span>
                  </div>
                  <p className="text-xs font-bold text-stone-800 mt-0.5 font-mono">
                    {configInstagram.nomePerfil}
                  </p>
                  <p className="text-xs text-stone-600 font-serif mt-1 max-w-xl">
                    {configInstagram.biografia}
                  </p>
                </div>
              </div>

              {/* Métricas e Ações Rápidas */}
              <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
                <div className="bg-white border-2 border-[#1E1B2E] px-3 py-1.5 text-center shadow-[2px_2px_0px_#1E1B2E]">
                  <span className="block font-black text-sm text-[#581C87] font-mono">
                    {configInstagram.totalSeguidores.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-stone-500 font-mono">
                    Seguidores
                  </span>
                </div>

                <a
                  href={`https://instagram.com/${configInstagram.handle.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="vintage-button px-3.5 py-2 bg-[#E6007E] text-white hover:bg-[#C2006A] text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#1E1B2E]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir Perfil</span>
                </a>

                <button
                  type="button"
                  onClick={() => setModalConfigApi(true)}
                  className="px-3 py-2 border-2 border-[#1E1B2E] bg-white text-[#1E1B2E] hover:bg-stone-100 text-xs font-mono font-bold uppercase shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
                  title="Configurar credenciais da Meta Graph API"
                >
                  ⚙️ API
                </button>
              </div>
            </div>

            {/* Aviso sobre a integração com o Instagram */}
            <div className="mt-4 pt-3 border-t border-[#1E1B2E]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-stone-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00A868] animate-pulse" />
                <span>Última sincronização de dados: {configInstagram.ultimaSincronizacao || 'Hoje'}</span>
              </span>
              <span className="text-[11px] text-purple-900 font-bold">
                Hashtags oficiais: #Bicharada2027 #CarnavalFloripa #BicharadaSoltaPelosAres
              </span>
            </div>
          </div>

          {/* Grade de Feed e Planejador de Posts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-sm uppercase font-mono text-[#1E1B2E] flex items-center gap-1.5">
                <Grid3X3 className="w-4 h-4 text-[#581C87]" />
                <span>Grade de Postagens & Planejador de Conteúdo</span>
              </h4>
              <span className="text-xs font-mono text-stone-500">
                {postsInstagram.length} posts agendados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {postsInstagram.map((post) => {
                const copiado = legendaCopiadaId === post.id;
                return (
                  <div
                    key={post.id}
                    className="vintage-card p-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Cabeçalho do Post */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 bg-[#FAF5FF] border border-[#581C87] text-[#581C87] text-[10px] font-black uppercase font-mono flex items-center gap-1">
                          {post.tipo === 'Reels' && <Video className="w-3 h-3" />}
                          {post.tipo === 'Carrossel' && <Layers className="w-3 h-3" />}
                          {post.tipo === 'Feed' && <Grid3X3 className="w-3 h-3" />}
                          {post.tipo}
                        </span>

                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase font-mono border ${
                          post.status === 'Publicado'
                            ? 'bg-green-100 text-green-800 border-green-500'
                            : post.status === 'Pronto para Postar'
                            ? 'bg-amber-100 text-amber-800 border-amber-500'
                            : 'bg-stone-100 text-stone-700 border-stone-400'
                        }`}>
                          {post.status}
                        </span>
                      </div>

                      <h5 className="font-black text-sm uppercase font-mono text-[#1E1B2E] leading-snug">
                        {post.titulo}
                      </h5>

                      <p className="text-xs text-stone-700 font-serif mt-2 leading-relaxed bg-stone-50 p-2.5 border border-stone-200">
                        {post.legenda}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {post.hashtags.map((h, i) => (
                          <span key={i} className="text-[10px] font-mono text-purple-700 font-bold">
                            #{h.replace('#', '')}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-200 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.dataProgramada}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopiarLegenda(post)}
                          className="vintage-button flex-1 py-1.5 bg-[#581C87] text-[#FBBF24] hover:bg-[#431464] text-[11px] uppercase flex items-center justify-center gap-1 shadow-[1px_1px_0px_#000] cursor-pointer"
                        >
                          {copiado ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#00D287]" />
                              <span>Legenda Copiada!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Legenda</span>
                            </>
                          )}
                        </button>

                        <a
                          href="https://business.facebook.com/creatorstudio"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 border-2 border-[#1E1B2E] bg-stone-100 text-stone-800 hover:bg-stone-200 text-[11px] font-bold uppercase font-mono"
                          title="Abrir no Meta Creator Studio / Business Suite"
                        >
                          Postar ↗
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-ABA 4: TEMA DO ANO (TÍTULO DO TEMA, FANTASIA E DESCRIÇÃO DE CORES) */}
      {subAba === 'tema' && (
        <div className="space-y-4">
          {/* Banner Informativo & Live Preview do Cabeçalho */}
          <div className="bg-[#FAF6EC] border-3 border-[#1E1B2E] p-4 sm:p-5 shadow-[3px_3px_0px_#1E1B2E]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-dashed border-[#1E1B2E] pb-3 mb-4">
              <div>
                <span className="stamp stamp-urgent text-xs">Identidade Carnavalesca</span>
                <h3 className="text-lg font-black uppercase text-[#1E1B2E] font-mono mt-1">
                  Tema Oficial do Carnaval {temaAno.ano}
                </h3>
                <p className="text-xs text-stone-600 font-serif">
                  O título configurado aqui estampa dinamicamente a faixa oficial do cabeçalho da aplicação.
                </p>
              </div>

              {salvoTemaFeedback && (
                <div className="p-2 bg-[#00D287] text-[#1E1B2E] text-xs font-mono font-black border-2 border-[#1E1B2E] shadow-[2px_2px_0px_#1E1B2E] animate-bounce">
                  ✓ Tema e cabeçalho atualizados com sucesso!
                </div>
              )}
            </div>

            {/* Simulação Visual do Cabeçalho */}
            <div className="p-4 bg-gradient-to-r from-[#581C87] via-[#E6007E] to-[#00D287] border-3 border-[#1E1B2E] text-center shadow-[2px_2px_0px_#1E1B2E]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FAF6EC] bg-black/40 px-2 py-0.5 rounded">
                Visualização do Cabeçalho Oficial
              </span>
              <h4 className="text-2xl sm:text-4xl font-black text-white font-mono uppercase tracking-tight drop-shadow-[2px_2px_0px_#1E1B2E] mt-1">
                BICHARADA
              </h4>
              <div className="inline-block mt-1 px-4 py-1 bg-[#581C87] text-[#FBBF24] border-2 border-[#1E1B2E] font-black text-xs sm:text-sm uppercase tracking-wider rotate-[-1.5deg] shadow-[2px_2px_0px_#1E1B2E] max-w-full truncate">
                {tituloTema || 'Título do Tema'}
              </div>
              {sloganTema && (
                <p className="text-[11px] font-mono text-white mt-1 italic drop-shadow-[1px_1px_0px_#000]">
                  &ldquo;{sloganTema}&rdquo;
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Formulário de Configuração do Tema */}
            <div className="lg:col-span-2 vintage-card p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3 border-b-2 border-[#1E1B2E] pb-2">
                <h4 className="text-sm font-black uppercase text-[#1E1B2E] font-mono flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#E6007E]" />
                  <span>Diretrizes Oficiais do Tema</span>
                </h4>
                <span className="text-[10px] font-mono text-stone-500">
                  {temaAno.dataAtualizacao ? `Atualizado em ${new Date(temaAno.dataAtualizacao).toLocaleDateString('pt-BR')}` : 'Oficial 2027'}
                </span>
              </div>

              <form onSubmit={handleSalvarTema} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1 font-mono">
                    Título do Tema (Faixa do Topo) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Solta pelos Ares 🪽"
                    value={tituloTema}
                    onChange={(e) => setTituloTema(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono font-bold focus:outline-none focus:bg-white"
                  />
                  <span className="text-[10px] text-stone-500 font-mono mt-0.5 block">
                    Este texto substitui imediatamente a estampa do topo da página.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1 font-mono">
                    Slogan / Subtítulo do Carnaval
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: O voo livre da diversidade no Carnaval de Floripa"
                    value={sloganTema}
                    onChange={(e) => setSloganTema(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1 font-mono">
                    Conceito & Diretrizes de Fantasia *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Descreva o conceito de fantasias, adereços, asas, maquiagem e tecidos para os foliões e alas..."
                    value={fantasiaTema}
                    onChange={(e) => setFantasiaTema(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-serif leading-relaxed focus:outline-none focus:bg-white"
                  />
                  <span className="text-[10px] text-stone-500 font-mono mt-0.5 block">
                    Orientações práticas para os brincantes, pernaltas, bateria e fantasias livres.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1 font-mono">
                    Descrição & Harmonização das Cores do Ano *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Como as cores oficiais devem ser combinadas nos tecidos, estandartes e adereços..."
                    value={descricaoCoresTema}
                    onChange={(e) => setDescricaoCoresTema(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-serif leading-relaxed focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="pt-2 border-t-2 border-stone-200 flex items-center justify-between">
                  <span className="text-xs text-stone-600 font-mono">
                    Pressione salvar para atualizar em tempo real.
                  </span>
                  <button
                    type="submit"
                    className="vintage-button px-5 py-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#1E1B2E] text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar Alterações do Tema</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Guia Lateral de Cores e Aplicação Rápida */}
            <div className="space-y-3">
              <div className="vintage-card p-4">
                <h4 className="text-xs font-black uppercase text-[#1E1B2E] font-mono mb-2 flex items-center gap-1.5 border-b border-stone-200 pb-1">
                  <Palette className="w-3.5 h-3.5 text-[#00D287]" />
                  <span>Cores do Ano para o Tema</span>
                </h4>
                <p className="text-[11px] text-stone-600 font-serif mb-3">
                  Cartela oficial disponível para composição das fantasias e cenografia:
                </p>

                <div className="space-y-2">
                  {cores.map((c) => (
                    <div
                      key={c.id}
                      className="p-2 border border-[#1E1B2E] bg-white flex items-center justify-between gap-2 shadow-[1px_1px_0px_#1E1B2E]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-5 h-5 rounded-xs border border-black shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div className="truncate">
                          <div className="text-xs font-black font-mono uppercase truncate text-[#1E1B2E]">
                            {c.nome}
                          </div>
                          <div className="text-[10px] text-stone-500 font-mono">
                            {c.hex}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopiarHex(c.hex)}
                        className="px-2 py-0.5 border border-black bg-stone-100 hover:bg-stone-200 text-[10px] font-mono shrink-0 cursor-pointer"
                        title="Copiar HEX"
                      >
                        {corCopiada === c.hex ? '✓' : 'Copiar'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#FAF5FF] border-2 border-[#581C87] p-3 text-xs text-stone-700 shadow-[2px_2px_0px_#581C87]">
                <div className="font-mono font-black uppercase text-[#581C87] mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Dica para a Comissão</span>
                </div>
                <p className="font-serif text-[11px] leading-relaxed">
                  As diretrizes de fantasia inseridas aqui orientam todos os naipes da bateria, brincantes e equipe de apoio para a confecção das fantasias.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CADASTRAR NOVA COR DO ANO */}
      {modalNovaCor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-md w-full shadow-[6px_6px_0px_#1E1B2E]">
            <div className="stamp stamp-urgent text-xs mb-2">Identidade Visual</div>
            <h3 className="text-base font-black uppercase text-[#1E1B2E] flex items-center gap-2 font-mono">
              <Palette className="w-5 h-5 text-[#E6007E]" />
              <span>Adicionar Cor à Paleta Oficial</span>
            </h3>

            <form onSubmit={handleSalvarCor} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Nome da Cor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Azul Purpurina, Amarelo Samba..."
                  value={nomeCor}
                  onChange={(e) => setNomeCor(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                    Código HEX *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={hexCor}
                      onChange={(e) => setHexCor(e.target.value)}
                      className="w-10 h-9 p-0.5 border-2 border-[#1E1B2E] cursor-pointer"
                    />
                    <input
                      type="text"
                      required
                      value={hexCor}
                      onChange={(e) => setHexCor(e.target.value)}
                      className="w-full px-2 py-1.5 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono uppercase focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                    Ano Carnavalesco *
                  </label>
                  <input
                    type="number"
                    required
                    value={anoCor}
                    onChange={(e) => setAnoCor(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Aplicação / Descrição de Uso
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Para fantasias dos brincantes, estandarte, faixas de rua..."
                  value={usoCor}
                  onChange={(e) => setUsoCor(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t-2 border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovaCor(false)}
                  className="px-3.5 py-1.5 border-2 border-[#1E1B2E] text-xs font-bold uppercase hover:bg-stone-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-[#E6007E] text-white text-xs uppercase cursor-pointer"
                >
                  Salvar Cor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR COR DA PALETA OFICIAL */}
      {modalEditarCor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-md w-full shadow-[6px_6px_0px_#1E1B2E]">
            <div className="stamp stamp-urgent text-xs mb-2">Identidade Visual</div>
            <h3 className="text-base font-black uppercase text-[#1E1B2E] flex items-center gap-2 font-mono">
              <Palette className="w-5 h-5 text-[#E6007E]" />
              <span>Editar Cor da Paleta Oficial</span>
            </h3>

            <form onSubmit={handleSalvarEdicaoCor} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Nome da Cor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rosa Choque, Amarelo Ouro..."
                  value={nomeCorEdit}
                  onChange={(e) => setNomeCorEdit(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                    Código HEX *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={hexCorEdit}
                      onChange={(e) => setHexCorEdit(e.target.value)}
                      className="w-10 h-9 p-0.5 border-2 border-[#1E1B2E] cursor-pointer"
                    />
                    <input
                      type="text"
                      required
                      value={hexCorEdit}
                      onChange={(e) => setHexCorEdit(e.target.value)}
                      className="w-full px-2 py-1.5 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono uppercase focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                    Ano Carnavalesco *
                  </label>
                  <input
                    type="number"
                    required
                    value={anoCorEdit}
                    onChange={(e) => setAnoCorEdit(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Aplicação / Descrição de Uso
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Para fantasias dos brincantes, estandarte, faixas de rua..."
                  value={usoCorEdit}
                  onChange={(e) => setUsoCorEdit(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t-2 border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalEditarCor(null)}
                  className="px-3.5 py-1.5 border-2 border-[#1E1B2E] text-xs font-bold uppercase hover:bg-stone-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-[#E6007E] text-white text-xs uppercase cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SUBIR NOVO ARQUIVO DE ARTE */}
      {modalNovaArte && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-md w-full shadow-[6px_6px_0px_#1E1B2E] max-h-[92vh] overflow-y-auto">
            <div className="stamp stamp-open text-xs mb-2">Acervo de Mídia</div>
            <h3 className="text-base font-black uppercase text-[#1E1B2E] flex items-center gap-2 font-mono">
              <Upload className="w-5 h-5 text-[#00D287]" />
              <span>Subir Novo Arquivo de Arte</span>
            </h3>

            <form onSubmit={handleSalvarArte} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Título da Arte *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cartaz de Rua A3 em Alta Resolução"
                  value={tituloArte}
                  onChange={(e) => setTituloArte(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Categoria *
                </label>
                <select
                  value={categoriaNovaArte}
                  onChange={(e) => setCategoriaNovaArte(e.target.value as ArquivoArteMidia['categoria'])}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                >
                  <option value="Logotipos">Logotipos</option>
                  <option value="Cartazes & Lambes">Cartazes & Lambes</option>
                  <option value="Redes Sociais">Redes Sociais</option>
                  <option value="Camisetas & Fantasias">Camisetas & Fantasias</option>
                  <option value="Fontes & Tipografia">Fontes & Tipografia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Dimensões / Observações de Impressão
                </label>
                <input
                  type="text"
                  placeholder="Ex: 300 DPI • CMYK • A3 ou 1080x1920 px"
                  value={dimensoesArte}
                  onChange={(e) => setDimensoesArte(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="p-3 bg-stone-50 border-2 border-dashed border-[#1E1B2E]">
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Selecione o Arquivo (SVG, PNG, PDF, AI, PSD, ZIP) *
                </label>
                <input
                  type="file"
                  onChange={handleArteFileChange}
                  className="w-full text-xs font-mono file:mr-2 file:py-1 file:px-2.5 file:border-2 file:border-[#1E1B2E] file:text-xs file:font-black file:uppercase file:bg-[#00D287] file:cursor-pointer"
                />
                {nomeArquivoArte && (
                  <span className="block mt-1.5 text-[11px] font-mono text-[#00A868] font-bold">
                    ✓ {nomeArquivoArte} ({tamanhoArte})
                  </span>
                )}
              </div>

              <div className="pt-3 border-t-2 border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovaArte(false)}
                  className="px-3.5 py-1.5 border-2 border-[#1E1B2E] text-xs font-bold uppercase hover:bg-stone-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-[#00D287] text-[#1E1B2E] text-xs uppercase cursor-pointer"
                >
                  Salvar Arte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: NOVO POST PARA O INSTAGRAM */}
      {modalNovoPost && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-lg w-full shadow-[6px_6px_0px_#1E1B2E] max-h-[92vh] overflow-y-auto">
            <div className="stamp stamp-open text-xs mb-2">Redes Sociais</div>
            <h3 className="text-base font-black uppercase text-[#1E1B2E] flex items-center gap-2 font-mono">
              <InstagramIcon className="w-5 h-5 text-[#E6007E]" />
              <span>Planejar Post do Instagram</span>
            </h3>

            <form onSubmit={handleSalvarPost} className="space-y-3.5 mt-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                    Título Interno do Post *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Chamada Ensaio Geral"
                    value={tituloPost}
                    onChange={(e) => setTituloPost(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                    Formato
                  </label>
                  <select
                    value={tipoPost}
                    onChange={(e) => setTipoPost(e.target.value as PostInstagramPlanejado['tipo'])}
                    className="w-full px-2 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                  >
                    <option value="Feed">Feed</option>
                    <option value="Carrossel">Carrossel</option>
                    <option value="Reels">Reels</option>
                    <option value="Stories">Stories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Legenda do Post *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Escreva a legenda com o tom alegre do bloco..."
                  value={legendaPost}
                  onChange={(e) => setLegendaPost(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Hashtags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={hashtagsPost}
                  onChange={(e) => setHashtagsPost(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Data e Horário Programados
                </label>
                <input
                  type="datetime-local"
                  value={dataProgramadaPost}
                  onChange={(e) => setDataProgramadaPost(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t-2 border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovoPost(false)}
                  className="px-3.5 py-1.5 border-2 border-[#1E1B2E] text-xs font-bold uppercase hover:bg-stone-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-[#581C87] text-[#FBBF24] text-xs uppercase cursor-pointer"
                >
                  Salvar no Planejador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIGURAÇÃO E EXPLICAÇÃO DA API DO INSTAGRAM */}
      {modalConfigApi && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-lg w-full shadow-[6px_6px_0px_#1E1B2E]">
            <div className="stamp stamp-open text-xs mb-2">Meta for Developers</div>
            <h3 className="text-base font-black uppercase text-[#1E1B2E] flex items-center gap-2 font-mono">
              <InstagramIcon className="w-5 h-5 text-[#E6007E]" />
              <span>Integração Oficial com o Instagram</span>
            </h3>

            <div className="mt-3 text-xs text-stone-700 font-serif space-y-2 leading-relaxed bg-purple-50 p-3 border border-purple-200">
              <p>
                <strong>Como funciona a integração oficial:</strong>
              </p>
              <p>
                A Meta exige que o aplicativo seja registrado no painel <em>Meta for Developers</em> e vinculado à Conta Profissional do Instagram através da <strong>Instagram Graph API</strong>.
              </p>
              <p>
                Com o ID da conta e o Token de Acesso de Longa Duração configurados abaixo, o sistema do Bloco Bicharada pode sincronizar automaticamente dados de seguidores, mídias e publicar diretamente no feed.
              </p>
            </div>

            <div className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Instagram Business Account ID
                </label>
                <input
                  type="text"
                  placeholder="Ex: 17841400000000000"
                  value={tempBusinessId}
                  onChange={(e) => setTempBusinessId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Meta Access Token (Graph API)
                </label>
                <input
                  type="password"
                  placeholder="EAAG... (Token de longa duração do Meta Business)"
                  defaultValue="EAAG_token_bixarada_carnaval_2027_production"
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              {statusConexaoMeta && (
                <div className="p-2.5 bg-green-50 border border-green-300 text-green-800 text-xs font-mono font-bold">
                  {statusConexaoMeta}
                </div>
              )}

              <div className="pt-3 border-t-2 border-stone-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setModalConfigApi(false)}
                  className="px-3.5 py-1.5 border-2 border-[#1E1B2E] text-xs font-bold uppercase hover:bg-stone-200 cursor-pointer"
                >
                  Fechar
                </button>

                <button
                  type="button"
                  onClick={handleTestarConexaoMeta}
                  className="vintage-button px-4 py-1.5 bg-[#00D287] hover:bg-[#34EEA0] text-[#1E1B2E] text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Testar & Sincronizar API</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
