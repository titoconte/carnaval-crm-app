'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Calendar, Sparkles, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HeaderProps {
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  openAdminModal: () => void;
}

/**
 * Cabeçalho do Bloco Bicharada com as Cores Oficiais e Estilo Fanzine Carnavalesco.
 * Reproduz o contraste vibrante de Rosa Choque (#E6007E), Verde Menta (#00D287),
 * Roxo Estandarte (#581C87) e Dourado Glitter (#FBBF24).
 */
export default function Header({ isAdmin, setIsAdmin, openAdminModal }: HeaderProps) {
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
      particleCount: 60,
      spread: 70,
      origin: { y: 0.2 },
      colors: ['#E6007E', '#00D287', '#FBBF24', '#581C87']
    });
  };

  return (
    <header className="carnival-banner border-b-4 border-[#1E1B2E] py-6 px-4 text-white relative shadow-lg overflow-hidden">
      {/* Elementos lúdicos de fundo */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#00D287]/20 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
        
        {/* Barra superior de status e botão de coordenação */}
        <div className="w-full flex items-center justify-between mb-3 text-xs">
          <button
            onClick={dispararConfetes}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#FBBF24] text-[#1E1B2E] border-2 border-[#1E1B2E] font-black uppercase text-[11px] shadow-[2px_2px_0px_#1E1B2E] rotate-[-1deg] transition-all hover:scale-105 active:scale-95"
            title="Lançar confete da Bicharada"
          >
            <PartyPopper className="w-3.5 h-3.5 text-[#E6007E]" />
            <span>Florianópolis • 2027</span>
          </button>

          <button
            onClick={isAdmin ? () => setIsAdmin(false) : openAdminModal}
            className={`flex items-center gap-1.5 px-3 py-1 border-2 border-[#1E1B2E] text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#1E1B2E] active:translate-x-0.5 active:translate-y-0.5 ${
              isAdmin 
                ? 'bg-[#00D287] text-[#1E1B2E]' 
                : 'bg-white hover:bg-stone-100 text-[#1E1B2E]'
            }`}
          >
            {isAdmin ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{isAdmin ? 'Modo Coordenação [ON]' : 'Acesso Coordenação'}</span>
          </button>
        </div>

        {/* Estandarte / Logo Oficial */}
        <div 
          onClick={dispararConfetes}
          className="cursor-pointer group select-none my-1"
        >
          <div className="inline-block px-3.5 py-0.5 bg-[#FBBF24] text-[#1E1B2E] border-2 border-[#1E1B2E] font-black text-xs uppercase tracking-widest rotate-1 shadow-[2px_2px_0px_#1E1B2E] mb-1">
            ★ Bloco Carnavalesco ★
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase font-mono drop-shadow-[3px_3px_0px_#1E1B2E]">
            BICHARADA
          </h1>

          <div className="inline-block mt-1 px-4 py-1 bg-[#581C87] text-[#FBBF24] border-2 border-[#1E1B2E] font-black text-xs sm:text-sm uppercase tracking-wider rotate-[-1.5deg] shadow-[3px_3px_0px_#1E1B2E]">
            Solta pelos Ares 🪽
          </div>
        </div>

        {/* Bilhete de Contagem Regressiva para 08/02/2027 */}
        <div className="mt-4 bg-white text-[#1E1B2E] border-3 border-[#1E1B2E] p-3 max-w-sm w-full shadow-[4px_4px_0px_#1E1B2E] relative rotate-[-0.5deg]">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase text-[#1E1B2E] mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#E6007E]" />
            <span>Desfile Oficial • Segunda, 08 de Fevereiro</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="bg-[#FDF2F8] border-2 border-[#1E1B2E] py-1 shadow-[2px_2px_0px_#1E1B2E]">
              <span className="block text-xl font-black text-[#E6007E]">{timeLeft.dias}</span>
              <span className="text-[10px] font-black uppercase text-stone-700">Dias</span>
            </div>
            <div className="bg-[#FAF5FF] border-2 border-[#1E1B2E] py-1 shadow-[2px_2px_0px_#1E1B2E]">
              <span className="block text-xl font-black text-[#581C87]">{timeLeft.horas}</span>
              <span className="text-[10px] font-black uppercase text-stone-700">Horas</span>
            </div>
            <div className="bg-[#ECFDF5] border-2 border-[#1E1B2E] py-1 shadow-[2px_2px_0px_#1E1B2E]">
              <span className="block text-xl font-black text-[#00A868]">{timeLeft.minutos}</span>
              <span className="text-[10px] font-black uppercase text-stone-700">Min</span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
