'use client';

import React, { useState } from 'react';
import { MessageCircle, Plus, CheckCircle2, Vote, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { EnqueteWhatsApp } from '../data/blocoData';

interface WhatsAppPollsProps {
  enquetes: EnqueteWhatsApp[];
  setEnquetes: React.Dispatch<React.SetStateAction<EnqueteWhatsApp[]>>;
  isAdmin: boolean;
}

/**
 * Mural de Enquetes do WhatsApp com espaço aberto para adicionar resultados.
 */
export default function WhatsAppPolls({ enquetes, setEnquetes, isAdmin }: WhatsAppPollsProps) {
  const [modalNova, setModalNova] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [pergunta, setPergunta] = useState('');
  const [resolucao, setResolucao] = useState('');
  const [opcoesTexto, setOpcoesTexto] = useState('Opção A (20 votos)\nOpção B (10 votos)');

  const handleAddEnquete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !pergunta.trim()) return;

    const linhas = opcoesTexto.split('\n').filter(l => l.trim().length > 0);
    let total = 0;
    const parsed = linhas.map(linha => {
      const match = linha.match(/\((\d+)\s*votos?\)/i);
      const v = match ? parseInt(match[1], 10) : 5;
      total += v;
      return {
        rotulo: linha.replace(/\(\d+\s*votos?\)/i, '').trim(),
        votos: v,
        percentual: 0
      };
    });

    const soma = total || 1;
    const opcoesFinais = parsed.map(op => ({
      ...op,
      percentual: Math.round((op.votos / soma) * 100)
    }));

    const nova: EnqueteWhatsApp = {
      id: `enq-${Date.now()}`,
      titulo: titulo.trim(),
      dataEncerramento: new Date().toISOString().split('T')[0],
      totalVotos: soma,
      pergunta: pergunta.trim(),
      opcoes: opcoesFinais,
      resolucaoOficial: resolucao.trim() || undefined
    };

    setEnquetes(prev => [nova, ...prev]);
    setModalNova(false);
    setTitulo('');
    setPergunta('');
    setResolucao('');

    confetti({
      particleCount: 30,
      spread: 50,
      colors: ['#00A868', '#E6007E']
    });
  };

  return (
    <div className="space-y-4">
      {/* Banner Principal com Botão Aberto de Adicionar Resultados */}
      <div className="bg-[#FAF6EC] border-2 border-[#1A181B] p-4 shadow-[3px_3px_0px_#1A181B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black uppercase text-[#1A181B] flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#00A868]" />
            <span>Resultados das Enquetes do WhatsApp</span>
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Decisões e votações diretas do grupo registradas publicamente para toda a comunidade.
          </p>
        </div>

        <button
          onClick={() => setModalNova(true)}
          className="vintage-button px-4 py-2 bg-[#00A868] text-white hover:bg-[#008f58] text-xs uppercase flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Adicionar Resultados da Enquete</span>
        </button>
      </div>

      {/* Grid de Enquetes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enquetes.map((enq) => {
          const vencedora = enq.opcoes.reduce((prev, cur) => (prev.votos > cur.votos ? prev : cur), enq.opcoes[0]);

          return (
            <div key={enq.id} className="vintage-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="stamp stamp-confirmed text-[10px]">Apurada</span>
                  <span className="font-mono text-stone-500 font-bold">{enq.dataEncerramento}</span>
                </div>

                <h3 className="font-black text-base uppercase text-[#1A181B] font-mono leading-tight">
                  {enq.titulo}
                </h3>
                <p className="text-xs text-stone-700 italic mt-1 mb-4 font-serif">
                  "{enq.pergunta}"
                </p>

                {/* Opções da Enquete */}
                <div className="space-y-2.5">
                  {enq.opcoes.map((op, idx) => {
                    const isWinner = op.rotulo === vencedora.rotulo;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono font-bold">
                          <span className={isWinner ? 'text-[#00A868] font-black' : 'text-stone-800'}>
                            {isWinner && '★ '}
                            {op.rotulo}
                          </span>
                          <span>{op.percentual}% ({op.votos}v)</span>
                        </div>
                        <div className="w-full h-3 bg-white border border-[#1A181B]">
                          <div
                            className={`h-full border-r border-[#1A181B] ${isWinner ? 'bg-[#00A868]' : 'bg-[#FBBF24]'}`}
                            style={{ width: `${op.percentual}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Deliberação Oficial */}
              {enq.resolucaoOficial && (
                <div className="mt-4 p-2.5 bg-[#F4EEDF] border-2 border-[#1A181B] border-dashed text-xs">
                  <span className="font-black uppercase text-[#E6007E] block text-[10px] font-mono">
                    Deliberação Oficial Adotada:
                  </span>
                  <p className="text-stone-800 font-bold mt-0.5 font-serif">
                    {enq.resolucaoOficial}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Adicionar Enquete */}
      {modalNova && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6EC] border-4 border-[#1A181B] p-6 max-w-md w-full shadow-[6px_6px_0px_#1A181B]">
            <div className="stamp stamp-confirmed text-xs mb-2">Registro de Votação</div>
            <h3 className="text-base font-black uppercase text-[#1A181B]">
              Adicionar Resultados da Enquete
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 font-serif">
              Insira a pergunta feita no WhatsApp e os votos obtidos para divulgação.
            </p>

            <form onSubmit={handleAddEnquete} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Título da Enquete *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cor dos Adereços dos Sopros"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Pergunta do Grupo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Qual cor vocês preferem nos chapéus?"
                  value={pergunta}
                  onChange={(e) => setPergunta(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-serif focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">
                  Opções e Votos (uma por linha com os votos entre parênteses) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={opcoesTexto}
                  onChange={(e) => setOpcoesTexto(e.target.value)}
                  placeholder={`Verde e Magenta (25 votos)\nDourado e Roxo (10 votos)`}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Resolução / Decisão Adotada</label>
                <input
                  type="text"
                  placeholder="Ex: Confirmado: chapéus em verde e magenta."
                  value={resolucao}
                  onChange={(e) => setResolucao(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNova(false)}
                  className="px-3 py-1.5 border-2 border-[#1A181B] text-xs font-bold uppercase hover:bg-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-[#00A868] text-white text-xs uppercase"
                >
                  Publicar Resultados
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
