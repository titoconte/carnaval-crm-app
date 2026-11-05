'use client';

import React, { useState } from 'react';
import { Gift, Sparkles, Check, Copy, MessageSquare, ShoppingBag, Search } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BilheteRifa } from '../data/blocoData';

interface RaffleAppProps {
  bilhetes: BilheteRifa[];
  setBilhetes: React.Dispatch<React.SetStateAction<BilheteRifa[]>>;
  isAdmin: boolean;
}

/**
 * Aplicativo de Venda 100% Online da Rifa com as Cores Oficiais da Bicharada.
 */
export default function RaffleApp({ bilhetes, setBilhetes, isAdmin }: RaffleAppProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [faixaAtiva, setFaixaAtiva] = useState<number>(1);
  const [buscaNumero, setBuscaNumero] = useState('');
  const [nomeComprador, setNomeComprador] = useState('');
  const [whatsComprador, setWhatsComprador] = useState('');
  const [modalCheckout, setModalCheckout] = useState(false);
  const [copiadoPix, setCopiadoPix] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | 'Disponível' | 'Reservado' | 'Pago'>('Todos');

  const VALOR_BILHETE = 10.0;
  const CHAVE_PIX = 'apoio@bicharada.org';
  const TELEFONE_REGINA = '5548999999999';

  const totalPagos = bilhetes.filter(b => b.status === 'Pago').length;
  const totalReservados = bilhetes.filter(b => b.status === 'Reservado').length;
  const totalDisponiveis = bilhetes.filter(b => b.status === 'Disponível').length;
  const valorTotalArrecadado = totalPagos * VALOR_BILHETE;
  const metaTotal = 500 * VALOR_BILHETE;

  const toggleSelectNumber = (num: number) => {
    const bilhete = bilhetes.find(b => b.numero === num);
    if (!bilhete || bilhete.status === 'Pago') return;

    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(prev => prev.filter(n => n !== num));
    } else {
      setSelectedNumbers(prev => [...prev, num]);
    }
  };

  const handleAbrirCheckout = () => {
    if (selectedNumbers.length === 0) return;
    setModalCheckout(true);
  };

  const copiarPix = () => {
    navigator.clipboard.writeText(CHAVE_PIX);
    setCopiadoPix(true);
    setTimeout(() => setCopiadoPix(false), 2000);
  };

  const handleFinalizarReserva = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeComprador.trim() || !whatsComprador.trim() || selectedNumbers.length === 0) return;

    const dataAtual = new Date().toISOString().split('T')[0];

    setBilhetes(prev => prev.map(b => {
      if (selectedNumbers.includes(b.numero)) {
        return {
          ...b,
          status: 'Reservado',
          compradorNome: nomeComprador.trim(),
          compradorWhats: whatsComprador.trim(),
          dataReserva: dataAtual
        };
      }
      return b;
    }));

    const textoNumeros = selectedNumbers.map(n => `#${String(n).padStart(3, '0')}`).join(', ');
    const totalPagar = (selectedNumbers.length * VALOR_BILHETE).toFixed(2);
    
    const mensagemWhatsapp = encodeURIComponent(
      `🦁 *RIFA DO BLOCO BICHARADA 2027* 🪽\n\n` +
      `Oi Regina! Acabei de reservar meus bilhetes da sorte no aplicativo:\n\n` +
      `👤 *Nome:* ${nomeComprador.trim()}\n` +
      `📱 *WhatsApp:* ${whatsComprador.trim()}\n` +
      `🎟️ *Números Escolhidos:* ${textoNumeros}\n` +
      `💰 *Valor Total:* R$ ${totalPagar}\n\n` +
      `Estou enviando o comprovante do Pix em anexo logo abaixo!`
    );

    const linkWhatsapp = `https://wa.me/${TELEFONE_REGINA}?text=${mensagemWhatsapp}`;

    confetti({
      particleCount: 50,
      spread: 70,
      colors: ['#00D287', '#E6007E', '#FBBF24']
    });

    window.open(linkWhatsapp, '_blank');

    setModalCheckout(false);
    setSelectedNumbers([]);
    setNomeComprador('');
    setWhatsComprador('');
  };

  const alternarStatusCoord = (num: number) => {
    if (!isAdmin) return;
    setBilhetes(prev => prev.map(b => {
      if (b.numero === num) {
        const prox = b.status === 'Disponível' ? 'Reservado' : b.status === 'Reservado' ? 'Pago' : 'Disponível';
        return { ...b, status: prox };
      }
      return b;
    }));
  };

  const inicioFaixa = (faixaAtiva - 1) * 100 + 1;
  const fimFaixa = faixaAtiva * 100;

  const bilhetesExibidos = bilhetes.filter(b => {
    if (buscaNumero.trim()) {
      return String(b.numero).includes(buscaNumero.trim());
    }
    const naFaixa = b.numero >= inicioFaixa && b.numero <= fimFaixa;
    const noStatus = filtroStatus === 'Todos' || b.status === filtroStatus;
    return naFaixa && noStatus;
  });

  return (
    <div className="space-y-4">
      {/* Banner da Rifa nas Cores Oficiais */}
      <div className="vintage-card p-5 border-l-8 border-[#00D287]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="stamp stamp-urgent text-xs">Venda 100% Online</span>
              <span className="font-mono text-xs font-bold text-stone-600">Coordenação: Regina</span>
            </div>
            <h2 className="text-2xl font-black uppercase text-[#1E1B2E] font-mono leading-tight">
              Grande Rifa Carnavalesca 2027 🎟️
            </h2>
            <p className="text-xs text-stone-700 mt-1 max-w-lg font-serif">
              Escolha seus números da sorte abaixo. Cada bilhete custa apenas <strong>R$ 10,00</strong> e todo o dinheiro arrecadado banca a Kombi Cora, o som e as bebidas do nosso desfile!
            </p>
          </div>

          {/* Card Pix */}
          <div className="bg-[#FAF5FF] border-2 border-[#581C87] p-3 shadow-[3px_3px_0px_#581C87] text-xs font-mono shrink-0">
            <span className="font-black text-[#581C87] block text-[10px] uppercase">Chave Pix Oficial:</span>
            <div className="flex items-center gap-2 mt-1">
              <code className="bg-white px-2 py-1 font-bold text-stone-900 border border-[#581C87]">
                {CHAVE_PIX}
              </code>
              <button
                onClick={copiarPix}
                className="p-1 bg-[#581C87] text-[#FBBF24] hover:bg-[#431464] border border-black shadow-[1px_1px_0px_#000]"
                title="Copiar Pix"
              >
                {copiadoPix ? <Check className="w-3.5 h-3.5 text-[#00D287]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Termômetro da Rifa */}
        <div className="mt-4 pt-3 border-t-2 border-stone-200">
          <div className="flex items-center justify-between text-xs font-mono font-black mb-1">
            <span>Arrecadado: R$ {valorTotalArrecadado.toFixed(2).replace('.', ',')} ({totalPagos} pagos)</span>
            <span className="text-[#E6007E] font-black">{Math.round((valorTotalArrecadado / metaTotal) * 100)}% da Meta</span>
          </div>

          <div className="w-full h-4 bg-white border-2 border-[#1E1B2E] shadow-[2px_2px_0px_#1E1B2E]">
            <div
              className="h-full bg-gradient-to-r from-[#FBBF24] via-[#E6007E] to-[#00D287] border-r border-[#1E1B2E] transition-all duration-700"
              style={{ width: `${(valorTotalArrecadado / metaTotal) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Prêmios Oficiais da Rifa */}
      <div className="vintage-card p-4">
        <h3 className="font-black text-xs uppercase tracking-wider text-[#581C87] font-mono mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
          <span>Prêmios que Serão Sorteados:</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-serif">
          <div className="p-2.5 bg-[#FEFCE8] border-2 border-[#FBBF24] text-[#1E1B2E] font-bold shadow-[2px_2px_0px_#FBBF24]">
            🥇 1º Prêmio: Cesta Artesanal Carnavalesca + Kit Cervejas Especiais
          </div>
          <div className="p-2.5 bg-[#FDF2F8] border-2 border-[#E6007E] text-[#1E1B2E] font-bold shadow-[2px_2px_0px_#E6007E]">
            🥈 2º Prêmio: Par de Óculos & Adereço Exclusivo Bicharada
          </div>
          <div className="p-2.5 bg-[#ECFDF5] border-2 border-[#00D287] text-[#1E1B2E] font-bold shadow-[2px_2px_0px_#00D287]">
            🥉 3º Prêmio: Camiseta Oficial 2027 + Copo Tiracolo
          </div>
        </div>
      </div>

      {/* Navegação da Cartela de Bilhetes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#1E1B2E] pb-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar font-mono text-xs">
          {[1, 2, 3, 4, 5].map((f) => (
            <button
              key={f}
              onClick={() => {
                setFaixaAtiva(f);
                setBuscaNumero('');
              }}
              className={`px-3 py-1.5 border-2 border-[#1E1B2E] font-black uppercase shadow-[2px_2px_0px_#1E1B2E] transition-all ${
                faixaAtiva === f && !buscaNumero
                  ? 'bg-[#E6007E] text-white'
                  : 'bg-white text-stone-800 hover:bg-stone-100'
              }`}
            >
              {String((f - 1) * 100 + 1).padStart(3, '0')} - {String(f * 100).padStart(3, '0')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-48">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="number"
            placeholder="Buscar número..."
            value={buscaNumero}
            onChange={(e) => setBuscaNumero(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
          />
        </div>
      </div>

      {/* Legenda de Cores */}
      <div className="flex items-center gap-3 text-[11px] font-mono font-bold flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-3.5 h-3.5 bg-white border border-[#1E1B2E] inline-block shadow-[1px_1px_0px_#000]" /> Disponível ({totalDisponiveis})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3.5 h-3.5 bg-[#FBBF24] border border-[#1E1B2E] inline-block shadow-[1px_1px_0px_#000]" /> Reservado ({totalReservados})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3.5 h-3.5 bg-[#E6007E] border border-[#1E1B2E] inline-block shadow-[1px_1px_0px_#000]" /> Pago ({totalPagos})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3.5 h-3.5 bg-[#00D287] border border-[#1E1B2E] inline-block shadow-[1px_1px_0px_#000]" /> Selecionado ({selectedNumbers.length})
        </span>
      </div>

      {/* Grade Interativa de 100 Números por Faixa */}
      <div className="vintage-card p-4">
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {bilhetesExibidos.map((bilhete) => {
            const isSelected = selectedNumbers.includes(bilhete.numero);
            const isPago = bilhete.status === 'Pago';
            const isReservado = bilhete.status === 'Reservado';

            return (
              <button
                key={bilhete.numero}
                onClick={() => toggleSelectNumber(bilhete.numero)}
                onDoubleClick={() => alternarStatusCoord(bilhete.numero)}
                disabled={isPago}
                className={`py-2 px-1 border-2 border-[#1E1B2E] text-xs font-mono font-black transition-all flex flex-col items-center justify-center relative ${
                  isSelected
                    ? 'bg-[#00D287] text-[#1E1B2E] shadow-[3px_3px_0px_#1E1B2E] scale-105 z-10'
                    : isPago
                    ? 'bg-[#FDF2F8] text-[#E6007E] border-[#E6007E] opacity-70 line-through cursor-not-allowed'
                    : isReservado
                    ? 'bg-[#FEFCE8] text-[#B45309] border-[#FBBF24] shadow-[2px_2px_0px_#FBBF24]'
                    : 'bg-white hover:bg-pink-50 text-[#1E1B2E] shadow-[2px_2px_0px_#1E1B2E] active:translate-x-0.5 active:translate-y-0.5'
                }`}
                title={
                  isPago ? `Bilhete #${bilhete.numero} pago por ${bilhete.compradorNome || 'Folião'}` :
                  isReservado ? `Bilhete #${bilhete.numero} reservado por ${bilhete.compradorNome || 'Folião'}` :
                  `Clique para escolher o bilhete #${bilhete.numero}`
                }
              >
                <span>#{String(bilhete.numero).padStart(3, '0')}</span>
                {isPago && <span className="text-[8px] uppercase font-black text-[#E6007E]">Pago</span>}
                {isReservado && !isSelected && <span className="text-[8px] uppercase font-bold text-[#B45309]">Res.</span>}
                {isSelected && <span className="text-[8px] uppercase font-black">Quero</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Barra Flutuante de Checkout */}
      {selectedNumbers.length > 0 && (
        <div className="sticky bottom-4 z-40 bg-white border-4 border-[#1E1B2E] p-4 shadow-[6px_6px_0px_#1E1B2E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div>
            <span className="font-mono text-xs font-black uppercase text-[#E6007E] block">
              🎟️ {selectedNumbers.length} {selectedNumbers.length === 1 ? 'número selecionado' : 'números selecionados'}
            </span>
            <p className="font-black text-sm text-[#1E1B2E] font-mono">
              Total: R$ {(selectedNumbers.length * VALOR_BILHETE).toFixed(2).replace('.', ',')}
              <span className="text-stone-500 text-xs font-normal ml-2">
                ({selectedNumbers.map(n => `#${String(n).padStart(3, '0')}`).join(', ')})
              </span>
            </p>
          </div>

          <button
            onClick={handleAbrirCheckout}
            className="vintage-button px-5 py-2.5 bg-[#00D287] text-[#1E1B2E] hover:bg-[#34EEA0] text-xs uppercase flex items-center gap-2 shadow-[3px_3px_0px_#1E1B2E]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Reservar & Pagar via Pix</span>
          </button>
        </div>
      )}

      {/* Modal de Finalização Pix */}
      {modalCheckout && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-md w-full shadow-[6px_6px_0px_#1E1B2E] max-h-[90vh] overflow-y-auto">
            <div className="stamp stamp-urgent text-xs mb-2">Checkout Rápido</div>
            <h3 className="text-lg font-black uppercase text-[#1E1B2E] font-mono">
              Finalizar Reserva da Rifa
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-3 font-serif">
              Insira seus dados para gerarmos o comprovante que será enviado direto no WhatsApp da Regina.
            </p>

            <div className="bg-[#FAF5FF] border-2 border-[#581C87] p-3 shadow-[2px_2px_0px_#581C87] mb-3 text-xs font-mono space-y-1">
              <div className="flex justify-between font-bold">
                <span>Números Escolhidos:</span>
                <span className="text-[#E6007E]">
                  {selectedNumbers.map(n => `#${String(n).padStart(3, '0')}`).join(', ')}
                </span>
              </div>
              <div className="flex justify-between font-black text-sm pt-1 border-t border-purple-200">
                <span>Total a Pagar via Pix:</span>
                <span className="text-[#00A868]">
                  R$ {(selectedNumbers.length * VALOR_BILHETE).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <div className="bg-[#FEFCE8] border-2 border-[#FBBF24] p-3 mb-4 text-xs font-mono text-center">
              <span className="font-bold block text-stone-600 text-[11px] mb-1">CHAVE PIX DO BLOCO:</span>
              <div className="flex items-center justify-center gap-2">
                <strong className="text-stone-900 bg-white px-2 py-0.5 border border-stone-300">
                  {CHAVE_PIX}
                </strong>
                <button
                  type="button"
                  onClick={copiarPix}
                  className="px-2 py-1 bg-[#1E1B2E] text-white text-[11px] font-bold uppercase"
                >
                  {copiadoPix ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <form onSubmit={handleFinalizarReserva} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Seu Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mariana Silveira"
                  value={nomeComprador}
                  onChange={(e) => setNomeComprador(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Seu WhatsApp (com DDD) *</label>
                <input
                  type="tel"
                  required
                  placeholder="(48) 99999-9999"
                  value={whatsComprador}
                  onChange={(e) => setWhatsComprador(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalCheckout(false)}
                  className="px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-bold uppercase hover:bg-stone-200"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-2 bg-[#00D287] text-[#1E1B2E] text-xs uppercase flex items-center gap-1.5 shadow-[3px_3px_0px_#1E1B2E]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enviar Comprovante no WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
