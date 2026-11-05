'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Calendar, Sparkles, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HeaderProps {
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  openAdminModal: () => void;
  temaTitulo?: string;
}

/**
 * Cabeçalho do Bloco Bicharada com as Cores Oficiais e Estilo Fanzine Carnavalesco.
 * - Versão Desktop: Banner completo com contagem regressiva em destaque e logo oficial.
 * - Versão Mobile: Painel compacto (~85px) para não empurrar os botões e abas para fora da tela.
 */
export default function Header({ isAdmin, setIsAdmin, openAdminModal, temaTitulo = 'Solta pelos Ares 🪽' }: HeaderProps) {
  const [timeLeft, setTimeLeft] = useState<{ dias: number; horas: number; minutos: number }>({ dias: 0, horas: 0, minutos: 0 });

  useEffect(() => {
    const calculateCountdown = () => {
      const targetDate = new Date('2027-02-08T14:30:00-03:00').getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const dias = Math.floor(difference / (1000 * 60 * 60 * 24));
        const horas = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ dias, horas, minutos });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  const dispararConfetes = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.2 },
      colors: ['#E6007E', '#00D287', '#581C87', '#FBBF24']
    });
  };

  return (
    <header className="carnival-banner text-white border-b-4 border-[#1E1B2E] shadow-lg relative overflow-hidden">
      {/* Luzes e Confetes Retrô decorativos no topo */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FBBF24] via-[#00D287] via-[#E6007E] to-[#581C87]" />

      {/* PAINEL DESKTOP & TABLET (sm:flex) */}
      <div className="hidden sm:flex flex-col items-center justify-center py-5 px-4 text-center max-w-4xl mx-auto relative z-10">
        {/* Barra superior de status & Acesso Coordenação */}
        <div className="w-full flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={dispararConfetes}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FBBF24] text-[#1E1B2E] border-2 border-[#1E1B2E] font-black uppercase text-[11px] shadow-[2px_2px_0px_#1E1B2E] rotate-[-1deg] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Lançar confete da Bicharada"
          >
            <PartyPopper className="w-3.5 h-3.5 text-[#E6007E]" />
            <span>Florianópolis • 2027</span>
          </button>

          <button
            type="button"
            onClick={isAdmin ? () => setIsAdmin(false) : openAdminModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 border-2 border-[#1E1B2E] text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#1E1B2E] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${
              isAdmin 
                ? 'bg-[#00D287] text-[#1E1B2E]' 
                : 'bg-white hover:bg-stone-100 text-[#1E1B2E]'
            }`}
          >
            {isAdmin ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{isAdmin ? 'Coordenação [ON]' : 'Acesso Coordenação'}</span>
          </button>
        </div>

        {/* Estandarte / Logo Oficial */}
        <div 
          onClick={dispararConfetes}
          className="cursor-pointer group select-none my-0.5"
        >
          <div className="inline-block px-3 py-0.5 bg-[#FBBF24] text-[#1E1B2E] border-2 border-[#1E1B2E] font-black text-xs uppercase tracking-widest rotate-1 shadow-[2px_2px_0px_#1E1B2E] mb-0.5">
            ★ Bloco Carnavalesco ★
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase font-mono drop-shadow-[3px_3px_0px_#1E1B2E]">
            BICHARADA
          </h1>

          <div className="inline-block mt-0.5 px-4 py-1 bg-[#581C87] text-[#FBBF24] border-2 border-[#1E1B2E] font-black text-sm uppercase tracking-wider rotate-[-1.5deg] shadow-[2px_2px_0px_#1E1B2E] max-w-full truncate">
            {temaTitulo}
          </div>
        </div>

        {/* Bilhete de Contagem Regressiva para 08/02/2027 */}
        <div className="mt-3 bg-white text-[#1E1B2E] border-3 border-[#1E1B2E] p-2.5 max-w-sm w-full shadow-[3px_3px_0px_#1E1B2E] relative rotate-[-0.5deg]">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase text-[#1E1B2E] mb-1">
            <Calendar className="w-3.5 h-3.5 text-[#E6007E]" />
            <span>Desfile Oficial • Segunda, 08 de Fevereiro</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="bg-[#FDF2F8] border-2 border-[#1E1B2E] py-1 shadow-[1px_1px_0px_#1E1B2E]">
              <span className="block text-xl font-black text-[#E6007E]">{timeLeft.dias}</span>
              <span className="text-[10px] font-black uppercase text-stone-700">Dias</span>
            </div>
            <div className="bg-[#FAF5FF] border-2 border-[#1E1B2E] py-1 shadow-[1px_1px_0px_#1E1B2E]">
              <span className="block text-xl font-black text-[#581C87]">{timeLeft.horas}</span>
              <span className="text-[10px] font-black uppercase text-stone-700">Horas</span>
            </div>
            <div className="bg-[#ECFDF5] border-2 border-[#1E1B2E] py-1 shadow-[1px_1px_0px_#1E1B2E]">
              <span className="block text-xl font-black text-[#00A868]">{timeLeft.minutos}</span>
              <span className="text-[10px] font-black uppercase text-stone-700">Min</span>
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL MOBILE COMPACTO (sm:hidden) */}
      <div className="sm:hidden flex flex-col p-2.5 max-w-full mx-auto relative z-10 gap-1.5">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[9px] font-mono font-black bg-[#FBBF24] text-[#1E1B2E] px-1.5 py-0.5 border border-black uppercase shadow-[1px_1px_0px_#000] shrink-0">
              2027
            </span>
            <span className="font-mono text-[11px] font-bold text-white truncate">
              {timeLeft.dias}d {timeLeft.horas}h p/ Desfile
            </span>
          </div>

          <button
            type="button"
            onClick={isAdmin ? () => setIsAdmin(false) : openAdminModal}
            className={`flex items-center gap-1 px-2 py-1 border border-[#1E1B2E] text-[10px] font-black uppercase shadow-[1px_1px_0px_#1E1B2E] cursor-pointer shrink-0 active:translate-y-0.5 ${
              isAdmin 
                ? 'bg-[#00D287] text-[#1E1B2E]' 
                : 'bg-white text-[#1E1B2E]'
            }`}
          >
            {isAdmin ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            <span>{isAdmin ? 'Coord [ON]' : 'Coordenação'}</span>
          </button>
        </div>

        <div onClick={dispararConfetes} className="cursor-pointer flex items-center justify-between gap-2 pt-0.5">
          <h1 className="text-xl font-black tracking-tight text-white uppercase font-mono drop-shadow-[2px_2px_0px_#1E1B2E]">
            ★ BICHARADA ★
          </h1>
          <div className="px-2 py-0.5 bg-[#581C87] text-[#FBBF24] border border-[#1E1B2E] font-black text-[11px] uppercase tracking-wider shadow-[1px_1px_0px_#1E1B2E] truncate max-w-[180px]">
            {temaTitulo}
          </div>
        </div>
      </div>
    </header>
  );
}
