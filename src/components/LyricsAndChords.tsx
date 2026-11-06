'use client';

import React, { useState } from 'react';
import { FileText, Upload, Copy, Check, Search, Music, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ItemLetraCifra, editarItemLetraCifra, removerItemLetraCifra } from '../data/blocoData';

interface LyricsAndChordsProps {
  items: ItemLetraCifra[];
  setItems: React.Dispatch<React.SetStateAction<ItemLetraCifra[]>>;
  isAdmin: boolean;
  onBackToRepertorio?: () => void;
}

/**
 * Caderno de Letras e Cifras em Estilo Fanzine Impresso.
 */
export default function LyricsAndChords({ items, setItems, isAdmin, onBackToRepertorio }: LyricsAndChordsProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'Todos' | 'Letra' | 'Cifra' | 'Partitura'>('Todos');
  const [modalUpload, setModalUpload] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemLetraCifra | null>(items[0] || null);
  const [copied, setCopied] = useState(false);

  // Form states
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<'Letra' | 'Cifra' | 'Partitura'>('Cifra');
  const [autorUpload, setAutorUpload] = useState('');
  const [conteudoTexto, setConteudoTexto] = useState('');

  // Estados de edição (Exclusivo Coordenação)
  const [modalEditar, setModalEditar] = useState(false);
  const [editTitulo, setEditTitulo] = useState('');
  const [editTipo, setEditTipo] = useState<'Letra' | 'Cifra' | 'Partitura'>('Cifra');
  const [editAutor, setEditAutor] = useState('');
  const [editConteudo, setEditConteudo] = useState('');

  /**
   * Abre o modal de edição do item selecionado exclusivamente para coordenadores.
   */
  const abrirModalEditar = (item: ItemLetraCifra) => {
    if (!isAdmin) return;
    setEditTitulo(item.titulo);
    setEditTipo(item.tipo);
    setEditAutor(item.autorUpload);
    setEditConteudo(item.conteudoTexto || '');
    setModalEditar(true);
  };

  /**
   * Salva as alterações do arquivo ou cifra selecionado.
   */
  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !selectedItem || !editTitulo.trim()) return;

    const atualizados = editarItemLetraCifra(
      items,
      selectedItem.id,
      {
        titulo: editTitulo.trim(),
        tipo: editTipo,
        autorUpload: editAutor.trim() || selectedItem.autorUpload,
        conteudoTexto: editConteudo.trim()
      },
      isAdmin
    );

    setItems(atualizados);
    const atualizado = atualizados.find(i => i.id === selectedItem.id) || null;
    setSelectedItem(atualizado);
    setModalEditar(false);
  };

  /**
   * Remove um item do caderno de letras/cifras (exclusivo para coordenação).
   */
  const handleExcluirItem = (id: string) => {
    if (!isAdmin) return;
    if (confirm('Tem certeza que deseja remover este documento do caderno de letras e cifras?')) {
      const atualizados = removerItemLetraCifra(items, id, isAdmin);
      setItems(atualizados);
      setSelectedItem(atualizados[0] || null);
      setModalEditar(false);
    }
  };

  /**
   * Registra uma nova cifra, letra ou partitura no caderno oficial do bloco.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    const novoItem: ItemLetraCifra = {
      id: `lc-upload-${Date.now()}`,
      titulo: titulo.trim(),
      tipo,
      autorUpload: autorUpload.trim() || 'Integrante do Bloco',
      dataUpload: new Date().toISOString().split('T')[0],
      conteudoTexto: conteudoTexto.trim()
    };

    setItems(prev => [novoItem, ...prev]);
    setSelectedItem(novoItem);
    setModalUpload(false);
    setTitulo('');
    setAutorUpload('');
    setConteudoTexto('');

    confetti({
      particleCount: 35,
      spread: 50,
      colors: ['#00A868', '#581C87']
    });
  };

  /**
   * Copia o texto da cifra ou letra para a área de transferência.
   */
  const copyToClipboard = () => {
    if (selectedItem?.conteudoTexto) {
      navigator.clipboard.writeText(selectedItem.conteudoTexto);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredItems = items.filter(item => {
    const matchSearch = item.titulo.toLowerCase().includes(search.toLowerCase()) ||
                        item.autorUpload.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'Todos' || item.tipo === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-4">
      {/* Banner Principal com Botão de Retorno ao Repertório */}
      <div className="bg-[#FAF6EC] border-2 border-[#1A181B] p-4 shadow-[3px_3px_0px_#1A181B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          {onBackToRepertorio && (
            <button
              onClick={onBackToRepertorio}
              className="inline-flex items-center gap-1 text-xs font-mono font-black uppercase text-[#E6007E] hover:underline mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Repertório</span>
            </button>
          )}
          <h2 className="text-xl font-black uppercase text-[#1A181B] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#581C87]" />
            <span>Caderno de Letras & Cifras</span>
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Acordes, partituras dos metais e letras oficiais transcritas para os ensaios.
          </p>
        </div>

        <button
          onClick={() => setModalUpload(true)}
          className="vintage-button px-4 py-2 bg-[#581C87] text-white hover:bg-[#431464] text-xs uppercase flex items-center gap-1.5"
        >
          <Upload className="w-4 h-4" />
          <span>+ Upload de Cifra / Letra</span>
        </button>
      </div>

      {/* Busca e Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por música..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {(['Todos', 'Cifra', 'Letra', 'Partitura'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 border-2 border-[#1A181B] font-mono text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#1A181B] ${
                filterType === t
                  ? 'bg-[#E6007E] text-white'
                  : 'bg-white text-[#1A181B] hover:bg-stone-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Layout Split: Lista e Visualizador */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Lista */}
        <div className="lg:col-span-5 space-y-2">
          {filteredItems.map((item) => {
            const isSelected = selectedItem?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-3 border-2 border-[#1A181B] cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#FEF08A] shadow-[3px_3px_0px_#1A181B]'
                    : 'bg-white hover:bg-stone-50 shadow-[2px_2px_0px_#1A181B]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="font-black px-1.5 py-0.2 bg-black text-white uppercase">
                    {item.tipo}
                  </span>
                  <span className="text-stone-500">{item.dataUpload}</span>
                </div>
                <h3 className="font-mono font-black text-sm text-[#1A181B] mt-1">
                  {item.titulo}
                </h3>
                <p className="text-[11px] text-stone-600 font-serif">
                  Por: {item.autorUpload}
                </p>
              </div>
            );
          })}
        </div>

        {/* Visualizador Tipo Papel Jornal */}
        <div className="lg:col-span-7 vintage-card p-4 sm:p-5 flex flex-col justify-between min-h-[380px]">
          {selectedItem ? (
            <div>
              <div className="flex items-start justify-between border-b-2 border-[#1A181B] pb-2 mb-3">
                <div>
                  <span className="stamp stamp-confirmed text-[10px]">{selectedItem.tipo}</span>
                  <h3 className="text-base font-black uppercase text-[#1A181B] font-mono mt-1">
                    {selectedItem.titulo}
                  </h3>
                  <p className="text-xs text-stone-500 font-mono">Enviado por {selectedItem.autorUpload}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  {isAdmin && (
                    <button
                      onClick={() => abrirModalEditar(selectedItem)}
                      className="px-2.5 py-1.5 border-2 border-[#581C87] bg-purple-50 hover:bg-purple-100 text-[#581C87] text-xs font-mono font-bold uppercase flex items-center gap-1 shadow-[1px_1px_0px_#000] cursor-pointer"
                      title="Editar documento (Coordenação)"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  )}
                  <button
                    onClick={copyToClipboard}
                    className="vintage-button px-3 py-1.5 bg-white hover:bg-stone-100 text-xs font-mono flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#00A868]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border-2 border-[#1A181B] p-3 font-mono text-xs text-stone-900 whitespace-pre-wrap leading-relaxed max-h-[340px] overflow-y-auto">
                {selectedItem.conteudoTexto || 'Nenhum texto incluído neste documento.'}
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-stone-400 font-mono text-xs">
              Selecione um documento ao lado.
            </div>
          )}
        </div>
      </div>

      {/* Modal Upload */}
      {modalUpload && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6EC] border-4 border-[#1A181B] p-6 max-w-lg w-full shadow-[6px_6px_0px_#1A181B]">
            <div className="stamp stamp-urgent text-xs mb-2">Envio de Partitura / Letra</div>
            <h3 className="text-base font-black uppercase text-[#1A181B]">
              Publicar Cifra ou Arranjo
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 mt-3">
              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Título da Música *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Frevo Mulher - Guia de Metais"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Tipo</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono"
                  >
                    <option value="Cifra">Cifra Harmônica</option>
                    <option value="Letra">Letra</option>
                    <option value="Partitura">Partitura / Convenção</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Seu Nome / Instrumento</label>
                  <input
                    type="text"
                    placeholder="Ex: Fael / Trompete"
                    value={autorUpload}
                    onChange={(e) => setAutorUpload(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">
                  Texto da Cifra / Convenções
                </label>
                <textarea
                  rows={6}
                  placeholder={`Tom: G\n[Intro] G C D7\n\nCante a letra com os acordes...`}
                  value={conteudoTexto}
                  onChange={(e) => setConteudoTexto(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalUpload(false)}
                  className="px-3 py-1.5 border-2 border-[#1A181B] text-xs font-bold uppercase hover:bg-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-[#581C87] text-white text-xs uppercase"
                >
                  Salvar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Editar Cifra / Letra (Exclusivo Coordenação) */}
      {isAdmin && modalEditar && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6EC] border-4 border-[#1A181B] p-6 max-w-lg w-full shadow-[6px_6px_0px_#1A181B] max-h-[90vh] overflow-y-auto">
            <div className="stamp stamp-urgent text-xs mb-2">Coordenação do Bloco</div>
            <h3 className="text-base font-black uppercase text-[#1A181B]">
              Editar Cifra ou Arranjo
            </h3>

            <form onSubmit={handleSalvarEdicao} className="space-y-3 mt-3">
              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Título do Documento *</label>
                <input
                  type="text"
                  required
                  value={editTitulo}
                  onChange={(e) => setEditTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Tipo</label>
                  <select
                    value={editTipo}
                    onChange={(e) => setEditTipo(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono"
                  >
                    <option value="Cifra">Cifra Harmônica</option>
                    <option value="Letra">Letra</option>
                    <option value="Partitura">Partitura / Convenção</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Autor / Responsável</label>
                  <input
                    type="text"
                    value={editAutor}
                    onChange={(e) => setEditAutor(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">
                  Texto da Cifra / Convenções
                </label>
                <textarea
                  rows={8}
                  value={editConteudo}
                  onChange={(e) => setEditConteudo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-300">
                <button
                  type="button"
                  onClick={() => handleExcluirItem(selectedItem.id)}
                  className="px-3 py-1.5 border-2 border-red-600 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-mono font-bold uppercase flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalEditar(false)}
                    className="px-3 py-1.5 border-2 border-[#1A181B] text-xs font-bold uppercase hover:bg-stone-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="vintage-button px-4 py-1.5 bg-[#00A868] text-white text-xs uppercase cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
