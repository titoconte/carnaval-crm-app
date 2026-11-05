'use client';

import React, { useState } from 'react';
import { 
  FolderDown, 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Tag, 
  Upload, 
  X, 
  Check, 
  Calendar,
  Sparkles,
  Paperclip
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  DocumentoBloco, 
  filtrarDocumentos, 
  adicionarNovoDocumento, 
  extrairTodasTagsDocumentos 
} from '../data/blocoData';

interface DocumentsManagerProps {
  documentos: DocumentoBloco[];
  setDocumentos: React.Dispatch<React.SetStateAction<DocumentoBloco[]>>;
  isAdmin: boolean;
}

/**
 * Gestão de Documentos Oficiais do Bloco Bicharada.
 * Permite visualizar documentos em tabela baixável, filtrar por tags,
 * e adicionar novos documentos com upload de arquivo e criação dinâmica de tags.
 */
export default function DocumentsManager({
  documentos,
  setDocumentos,
  isAdmin
}: DocumentsManagerProps) {
  const [busca, setBusca] = useState('');
  const [tagSelecionada, setTagSelecionada] = useState('Todas');
  const [modalNovoDoc, setModalNovoDoc] = useState(false);

  // Estados do formulário de novo documento
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [tagsSelecionadas, setTagsSelecionadas] = useState<string[]>(['Oficial']);
  const [novaTagInput, setNovaTagInput] = useState('');
  const [arquivoNome, setArquivoNome] = useState('');
  const [arquivoTamanho, setArquivoTamanho] = useState('');
  const [arquivoTipo, setArquivoTipo] = useState('');
  const [arquivoConteudo, setArquivoConteudo] = useState<string | undefined>(undefined);

  const todasAsTags = extrairTodasTagsDocumentos(documentos);
  const documentosFiltrados = filtrarDocumentos(documentos, tagSelecionada, busca);

  /**
   * Adiciona uma tag existente à seleção do novo documento.
   */
  const toggleTagExistente = (tag: string) => {
    setTagsSelecionadas(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  /**
   * Cria uma nova tag e a adiciona diretamente à seleção do documento atual.
   */
  const handleCriarNovaTag = (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    const tagLimpa = novaTagInput.trim();
    if (!tagLimpa) return;

    if (!tagsSelecionadas.includes(tagLimpa)) {
      setTagsSelecionadas(prev => [...prev, tagLimpa]);
    }
    setNovaTagInput('');
  };

  /**
   * Remove uma tag da lista selecionada no cadastro.
   */
  const handleRemoverTag = (tagParaRemover: string) => {
    setTagsSelecionadas(prev => prev.filter(t => t !== tagParaRemover));
  };

  /**
   * Captura o arquivo anexado pelo usuário via input de arquivo.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArquivoNome(file.name);
      const kb = Math.round(file.size / 1024);
      setArquivoTamanho(kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);
      setArquivoTipo(file.type || 'application/octet-stream');

      const reader = new FileReader();
      reader.onload = (event) => {
        setArquivoConteudo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Salva o novo documento e fecha o modal.
   */
  const handleSalvarDocumento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim()) {
      alert('Por favor, informe o título do documento.');
      return;
    }

    const nomeFinal = arquivoNome.trim() || `${novoTitulo.trim().toLowerCase().replace(/\s+/g, '_')}.pdf`;
    const tamanhoFinal = arquivoTamanho || '150 KB';

    const atualizados = adicionarNovoDocumento(documentos, {
      titulo: novoTitulo,
      descricao: novaDescricao,
      tags: tagsSelecionadas.length > 0 ? tagsSelecionadas : ['Geral'],
      nomeArquivo: nomeFinal,
      tamanhoFormatado: tamanhoFinal,
      tipoArquivo: arquivoTipo,
      conteudoBase64OuTexto: arquivoConteudo
    });

    setDocumentos(atualizados);
    setModalNovoDoc(false);

    // Limpa os estados do modal
    setNovoTitulo('');
    setNovaDescricao('');
    setTagsSelecionadas(['Oficial']);
    setNovaTagInput('');
    setArquivoNome('');
    setArquivoTamanho('');
    setArquivoTipo('');
    setArquivoConteudo(undefined);

    confetti({
      particleCount: 50,
      spread: 70,
      colors: ['#00D287', '#581C87', '#FBBF24']
    });
  };

  /**
   * Dispara o download real do documento no navegador do usuário.
   */
  const handleBaixarDocumento = (doc: DocumentoBloco) => {
    try {
      const urlRemota = doc.urlDownload || doc.conteudoBase64OuTexto;
      if (urlRemota && (urlRemota.startsWith('http://') || urlRemota.startsWith('https://'))) {
        window.open(urlRemota, '_blank');
        return;
      }

      if (doc.conteudoBase64OuTexto && doc.conteudoBase64OuTexto.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = doc.conteudoBase64OuTexto;
        link.download = doc.nomeArquivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } else {
        // Gera um arquivo de texto formatado como documento oficial representativo
        const conteudo = 
          `============================================================\n` +
          `BLOCO BICHARADA • FLORIANÓPOLIS 2027\n` +
          `DOCUMENTO OFICIAL: ${doc.titulo.toUpperCase()}\n` +
          `Data de Publicação: ${doc.dataUpload}\n` +
          `Tags: ${doc.tags.join(', ')}\n` +
          `============================================================\n\n` +
          `Descrição:\n${doc.descricao || 'Documento administrativo da coordenação do bloco.'}\n\n` +
          `Arquivo original de referência: ${doc.nomeArquivo} (${doc.tamanhoFormatado || 'Oficial'})\n` +
          `Autenticado pela Coordenação do Bloco Carnavalesco Bicharada.\n`;

        const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.nomeArquivo.endsWith('.pdf') ? doc.nomeArquivo.replace('.pdf', '.txt') : doc.nomeArquivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      confetti({
        particleCount: 30,
        spread: 50,
        colors: ['#00A868', '#E6007E']
      });
    } catch (err) {
      console.error('Erro ao baixar documento:', err);
      alert('Não foi possível realizar o download.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner Superior da Seção de Documentos */}
      <div className="vintage-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="stamp stamp-open text-xs">Acervo Comunitário</span>
            <span className="font-mono text-xs font-bold text-stone-600">
              {documentos.length} documentos oficiais
            </span>
          </div>
          <h2 className="text-xl font-black uppercase text-[#1E1B2E] flex items-center gap-2">
            <FolderDown className="w-5 h-5 text-[#E6007E]" />
            <span>Documentos & Arquivos do Bloco</span>
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Estatuto, editais, alvarás da prefeitura e prestações de contas disponíveis para download de toda a comunidade.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalNovoDoc(true)}
          className="vintage-button px-4 py-2 bg-[#00D287] hover:bg-[#34EEA0] text-[#1E1B2E] text-xs font-black uppercase flex items-center gap-1.5 shrink-0 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Adicionar Documento</span>
        </button>
      </div>

      {/* Barra de Filtros por Tags e Campo de Busca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border-2 border-[#1E1B2E] p-3 shadow-[2px_2px_0px_#1E1B2E]">
        {/* Carimbos de Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            onClick={() => setTagSelecionada('Todas')}
            className={`px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-mono font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
              tagSelecionada === 'Todas'
                ? 'bg-[#581C87] text-[#FBBF24] shadow-[2px_2px_0px_#1E1B2E]'
                : 'bg-white text-stone-800 hover:bg-stone-100'
            }`}
          >
            Todas as Tags ({documentos.length})
          </button>

          {todasAsTags.map(tag => {
            const count = documentos.filter(d => d.tags.includes(tag)).length;
            const ativa = tagSelecionada === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setTagSelecionada(tag)}
                className={`px-2.5 py-1.5 border-2 border-[#1E1B2E] text-xs font-mono font-black uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  ativa
                    ? 'bg-[#E6007E] text-white shadow-[2px_2px_0px_#1E1B2E]'
                    : 'bg-white text-stone-800 hover:bg-pink-50'
                }`}
              >
                <Tag className="w-3 h-3" />
                <span>{tag}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Input de Busca Textual */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por título, tag ou arquivo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
          />
        </div>
      </div>

      {/* Tabela de Documentos Baixáveis (Desktop) e Lista de Cards (Mobile) */}
      <div className="vintage-card p-3 sm:p-4">
        {documentosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-stone-500 font-mono text-xs">
            Nenhum documento encontrado com os filtros e busca informados.
          </div>
        ) : (
          <>
            {/* VERSÃO MOBILE: Cards em Lista com Botão de Baixar em Destaque */}
            <div className="md:hidden space-y-3">
              {documentosFiltrados.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-stone-50 border-2 border-[#1E1B2E] shadow-[2px_2px_0px_#1E1B2E] space-y-2.5"
                >
                  <div className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-[#581C87] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-mono font-black text-sm text-[#1E1B2E] leading-tight">
                        {doc.titulo}
                      </h4>
                      {doc.descricao && (
                        <p className="text-xs text-stone-600 font-serif mt-1">
                          {doc.descricao}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map(t => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 bg-[#FAF5FF] border border-[#581C87] text-[#581C87] text-[10px] font-bold font-mono"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Informações de Arquivo e Data */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-600 bg-white p-2 border border-stone-200">
                    <div className="flex items-center gap-1.5 truncate">
                      <Paperclip className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <span className="font-bold truncate">{doc.nomeArquivo}</span>
                      <span className="text-stone-400">({doc.tamanhoFormatado || 'PDF'})</span>
                    </div>
                    <span className="shrink-0 text-stone-400">{doc.dataUpload}</span>
                  </div>

                  {/* Botão Baixar Documento */}
                  <button
                    type="button"
                    onClick={() => handleBaixarDocumento(doc)}
                    className="w-full vintage-button py-2.5 px-3 bg-[#00D287] hover:bg-[#34EEA0] text-[#1E1B2E] text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer min-h-[44px]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Documento</span>
                  </button>
                </div>
              ))}
            </div>

            {/* VERSÃO DESKTOP: Tabela Tradicional */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono min-w-[650px]">
                <thead>
                  <tr className="border-b-2 border-[#1E1B2E] bg-stone-100 text-[#1E1B2E]">
                    <th className="p-2.5 font-black uppercase">Título do Documento & Descrição</th>
                    <th className="p-2.5 font-black uppercase">Tags</th>
                    <th className="p-2.5 font-black uppercase">Arquivo & Tamanho</th>
                    <th className="p-2.5 font-black uppercase">Data de Envio</th>
                    <th className="p-2.5 font-black uppercase text-center">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {documentosFiltrados.map((doc) => (
                    <tr
                      key={doc.id}
                      className="border-b border-stone-200 hover:bg-pink-50/40 transition-colors"
                    >
                      <td className="p-2.5 max-w-xs">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-[#581C87] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-stone-900 block leading-tight">
                              {doc.titulo}
                            </span>
                            {doc.descricao && (
                              <span className="text-[11px] text-stone-600 font-serif block mt-0.5 line-clamp-2">
                                {doc.descricao}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-2.5">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {doc.tags.map(t => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 bg-[#FAF5FF] border border-[#581C87] text-[#581C87] text-[10px] font-bold"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-stone-500" />
                          <div>
                            <span className="font-bold text-stone-800 block text-[11px]">
                              {doc.nomeArquivo}
                            </span>
                            <span className="text-[10px] text-stone-500">
                              {doc.tamanhoFormatado || 'PDF'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-2.5 whitespace-nowrap text-stone-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>{doc.dataUpload}</span>
                        </div>
                      </td>

                      <td className="p-2.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleBaixarDocumento(doc)}
                          className="vintage-button px-3 py-1.5 bg-[#00D287] hover:bg-[#34EEA0] text-[#1E1B2E] text-[11px] font-black uppercase flex items-center gap-1 mx-auto shadow-[1px_1px_0px_#000] cursor-pointer"
                          title="Baixar arquivo deste documento"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Baixar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal Adicionar Novo Documento */}
      {modalNovoDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-lg w-full shadow-[6px_6px_0px_#1E1B2E] max-h-[92vh] overflow-y-auto">
            <div className="stamp stamp-open text-xs mb-2">Novo Arquivo Comunitário</div>
            <h3 className="text-base font-black uppercase text-[#1E1B2E] flex items-center gap-2">
              <FolderDown className="w-5 h-5 text-[#E6007E]" />
              <span>Adicionar Documento ao Bloco</span>
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 font-serif">
              Cadastre novos arquivos, crie tags personalizadas e disponibilize o documento para download.
            </p>

            <form onSubmit={handleSalvarDocumento} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Título do Documento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Regulamento de Convivência dos Ensaios"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Descrição / Finalidade (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Explique resumidamente do que se trata o documento..."
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              {/* Upload de Arquivo */}
              <div className="p-3 bg-stone-50 border-2 border-dashed border-[#1E1B2E]">
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1.5 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-[#E6007E]" />
                  <span>Subir Arquivo (PDF, Imagem, Planilha ou Texto)</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-xs font-mono file:mr-3 file:py-1 file:px-2.5 file:border-2 file:border-[#1E1B2E] file:text-xs file:font-black file:uppercase file:bg-[#FBBF24] file:cursor-pointer"
                />
                {arquivoNome && (
                  <div className="mt-2 text-[11px] font-mono font-bold text-[#00A868] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Arquivo selecionado: {arquivoNome} ({arquivoTamanho})</span>
                  </div>
                )}
              </div>

              {/* Seção de Tags: Escolha e Criação de Novas Tags */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase text-[#1E1B2E]">
                  Tags do Documento
                </label>

                {/* Tags Selecionadas */}
                <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 bg-purple-50/50 border border-purple-200">
                  {tagsSelecionadas.length === 0 ? (
                    <span className="text-[11px] text-stone-400 italic">Nenhuma tag selecionada ainda</span>
                  ) : (
                    tagsSelecionadas.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-[#581C87] text-[#FBBF24] text-xs font-mono font-bold flex items-center gap-1 shadow-[1px_1px_0px_#000]"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoverTag(tag)}
                          className="hover:text-white cursor-pointer ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Sugestões de Tags Existentes */}
                <div>
                  <span className="text-[10px] font-bold text-stone-600 uppercase block mb-1">
                    Clique para adicionar tags existentes:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {todasAsTags.map(tag => {
                      const selecionada = tagsSelecionadas.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTagExistente(tag)}
                          className={`px-2 py-0.5 text-[11px] font-mono border cursor-pointer transition-all ${
                            selecionada
                              ? 'bg-[#E6007E] text-white border-black font-bold'
                              : 'bg-white text-stone-700 border-stone-300 hover:border-black'
                          }`}
                        >
                          {selecionada ? '✓ ' : '+ '}#{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Criar Nova Tag */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Criar nova tag personalizada..."
                    value={novaTagInput}
                    onChange={(e) => setNovaTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCriarNovaTag(e);
                      }
                    }}
                    className="flex-1 px-3 py-1 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCriarNovaTag}
                    className="vintage-button px-3 py-1 bg-[#FBBF24] text-[#1E1B2E] text-xs uppercase shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
                  >
                    + Criar Tag
                  </button>
                </div>
              </div>

              {/* Botões de Ação do Modal */}
              <div className="pt-4 border-t-2 border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovoDoc(false)}
                  className="px-3.5 py-1.5 border-2 border-[#1E1B2E] bg-stone-100 text-stone-800 text-xs font-bold uppercase hover:bg-stone-200 cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-[#00D287] hover:bg-[#34EEA0] text-[#1E1B2E] text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Salvar Documento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
