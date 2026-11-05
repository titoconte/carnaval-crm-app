'use client';

import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  User, 
  PartyPopper, 
  Database 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UsuarioBloco } from '../data/blocoData';

interface HeaderProps {
  usuarioLogado: UsuarioBloco | null;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  temaTitulo?: string;
  dbConnected?: boolean | null;
  dbSyncing?: boolean;
}

/**
 * Cabeçalho do Bloco Bicharada com as Cores Oficiais e Estilo Fanzine Carnavalesco.
 * - Versão Desktop: Banner completo com contagem regressiva em destaque, logo oficial e autenticação.
 * - Versão Mobile: Painel compacto (~85px) sem sobrecarregar a tela.
 * - Autenticação: Mostra status de Folião Público (com botão Entrar / Login) ou crachá do usuário logado (Bicho ou Coordenador).
 */
export default function Header({
  usuarioLogado,
  onOpenLoginModal,
  onLogout,
  temaTitulo = 'Solta pelos Ares 🪽',
  dbConnected,
  dbSyncing = false
}: HeaderProps) {
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
        {/* Barra superior de status & Acesso Usuários */}
        <div className="w-full flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={dispararConfetes}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FBBF24] text-[#1E1B2E] border-2 border-[#1E1B2E] font-black uppercase text-[11px] shadow-[2px_2px_0px_#1E1B2E] rotate-[-1deg] transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Lançar confete da Bicharada"
            >
              <PartyPopper className="w-3.5 h-3.5 text-[#E6007E]" />
              <span>Florianópolis • 2027</span>
            </button>

            {dbConnected !== undefined && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 border-2 border-[#1E1B2E] font-mono font-bold text-[10px] uppercase shadow-[2px_2px_0px_#1E1B2E] ${
                  dbConnected
                    ? 'bg-[#00D287] text-[#1E1B2E]'
                    : 'bg-stone-200 text-stone-700'
                }`}
                title={
                  dbConnected
                    ? 'Conectado ao Vercel Postgres / Neon em Nuvem'
                    : 'Modo Local (LocalStorage) - Ative POSTGRES_URL para sincronização em nuvem'
                }
              >
                <Database className="w-3 h-3" />
                <span>
                  {dbSyncing
                    ? 'Salvando no Postgres...'
                    : dbConnected
                    ? 'Vercel Postgres Ativo'
                    : 'Modo Local (LocalStorage)'}
                </span>
                {dbConnected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E1B2E] animate-pulse" />
                )}
              </div>
            )}
          </div>

          {/* Autenticação Desktop */}
          {usuarioLogado ? (
            <div className="flex items-center gap-1.5">
              <span className={`px-2.5 py-1 text-xs font-mono font-bold uppercase border-2 border-[#1E1B2E] shadow-[2px_2px_0px_#1E1B2E] flex items-center gap-1.5 ${
                usuarioLogado.perfil === 'coordenador'
                  ? 'bg-[#581C87] text-[#FBBF24]'
                  : 'bg-[#00D287] text-[#1E1B2E]'
              }`}>
                {usuarioLogado.perfil === 'coordenador' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FBBF24]" />
                ) : (
                  <User className="w-3.5 h-3.5 text-[#1E1B2E]" />
                )}
                <span>{usuarioLogado.username}</span>
                <span className="text-[10px] opacity-80">
                  [{usuarioLogado.perfil === 'coordenador' ? 'Coordenação' : 'Bicho'}]
                </span>
              </span>

              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-red-50 text-red-600 border-2 border-[#1E1B2E] text-xs font-black uppercase shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
                title="Sair da conta"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-pink-50 text-[#1E1B2E] border-2 border-[#1E1B2E] text-xs font-black uppercase shadow-[2px_2px_0px_#1E1B2E] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#E6007E]" />
              <span>Entrar / Login</span>
            </button>
          )}
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
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="bg-[#FAF6EC] text-[#1E1B2E] border-2 border-[#1E1B2E] px-3 py-1 shadow-[2px_2px_0px_#1E1B2E] font-mono text-xs flex items-center gap-2">
            <span className="font-bold text-[#E6007E] uppercase">Desfile Oficial:</span>
            <span>08/02/2027 (Segunda de Carnaval)</span>
            <span className="font-bold text-[#581C87]">★</span>
            <span className="font-bold text-[#00A868]">
              {timeLeft.dias} dias, {timeLeft.horas}h {timeLeft.minutos}m
            </span>
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
            {dbConnected !== undefined && (
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border border-black uppercase shadow-[1px_1px_0px_#000] flex items-center gap-1 shrink-0 ${
                  dbConnected ? 'bg-[#00D287] text-[#1E1B2E]' : 'bg-stone-200 text-stone-700'
                }`}
                title={dbConnected ? 'Vercel Postgres Ativo' : 'Modo Local'}
              >
                <Database className="w-2.5 h-2.5" />
                <span>{dbConnected ? 'Postgres' : 'Local'}</span>
              </span>
            )}
          </div>

          {/* Autenticação Mobile */}
          {usuarioLogado ? (
            <div className="flex items-center gap-1 shrink-0">
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#1E1B2E] shadow-[1px_1px_0px_#1E1B2E] truncate max-w-[110px] ${
                usuarioLogado.perfil === 'coordenador'
                  ? 'bg-[#581C87] text-[#FBBF24]'
                  : 'bg-[#00D287] text-[#1E1B2E]'
              }`}>
                {usuarioLogado.username}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="p-1 bg-white text-red-600 border border-[#1E1B2E] shadow-[1px_1px_0px_#1E1B2E] cursor-pointer"
                title="Sair"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="flex items-center gap-1 px-2 py-1 bg-white text-[#1E1B2E] border border-[#1E1B2E] text-[10px] font-black uppercase shadow-[1px_1px_0px_#1E1B2E] cursor-pointer shrink-0 active:translate-y-0.5"
            >
              <LogIn className="w-3 h-3 text-[#E6007E]" />
              <span>Entrar</span>
            </button>
          )}
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
