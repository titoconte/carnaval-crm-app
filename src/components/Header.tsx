'use client';

import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  User, 
  Database
} from 'lucide-react';
import { UsuarioBloco } from '../data/blocoData';

interface HeaderProps {
  usuarioLogado: UsuarioBloco | null;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  temaTitulo?: string;
  temaSubtitulo?: string;
  dbConnected?: boolean | null;
  dbSyncing?: boolean;
  onSync?: () => void;
}

/**
 * Cabeçalho do Bloco Bicharada com as Cores Oficiais e Estilo Fanzine Carnavalesco.
 * - Versão Desktop: Banner completo com contagem regressiva em destaque, logo oficial e autenticação.
 * - Versão Mobile: Painel compacto (~85px) sem sobrecarregar a tela.
 * - Autenticação: Mostra status de Folião Público (com botão Entrar / Login) ou crachá do usuário logado (Bicho ou Coordenador).
 * - Sincronização: Indicador de status do Vercel Postgres / LocalStorage.
 */
export default function Header({
  usuarioLogado,
  onOpenLoginModal,
  onLogout,
  temaTitulo = 'Solta pelos Ares 🪽',
  temaSubtitulo,
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

  return (
    <header className="carnival-banner text-white border-b-4 border-[#1E1B2E] shadow-lg relative overflow-hidden">
      {/* ------------------------------------------------------------- */}
      {/* DESKTOP BANNER (> 768px)                                      */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden md:flex flex-col items-center justify-center p-4 max-w-7xl mx-auto relative z-10">
        
        {/* Barra superior de status & Acesso Usuários */}
        <div className="w-full flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {dbConnected !== undefined && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 border-2 border-[#1E1B2E] font-mono text-[11px] font-bold shadow-[2px_2px_0px_#1E1B2E] ${
                  dbConnected
                    ? 'bg-[#00D287] text-[#1E1B2E]'
                    : 'bg-[#FEF08A] text-[#854D0E]'
                }`}
                title={
                  dbConnected
                    ? 'Sincronizado em tempo real com Vercel Postgres (Neon)'
                    : 'Operando localmente (armazenamento do navegador). Dados persistem localmente.'
                }
              >
                <Database className="w-3.5 h-3.5" />
                <span>
                  {dbConnected ? 'Vercel Postgres Conectado' : 'Modo Offline (Local)'}
                </span>
                {dbSyncing && (
                  <span className="w-2 h-2 rounded-full bg-[#E6007E] animate-ping ml-1" />
                )}
              </div>
            )}
          </div>

          {/* Autenticação Desktop */}
          <div className="flex items-center gap-2">
            {usuarioLogado ? (
              <div className="flex items-center gap-2 bg-white text-[#1E1B2E] px-3 py-1 border-2 border-[#1E1B2E] shadow-[2px_2px_0px_#1E1B2E]">
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  {usuarioLogado.perfil === 'coordenador' ? (
                    <span className="flex items-center gap-1 text-[#E6007E] font-black uppercase">
                      <ShieldCheck className="w-4 h-4" /> Coordenação:
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[#581C87] font-black uppercase">
                      <User className="w-4 h-4" /> Bicho:
                    </span>
                  )}
                  <strong className="font-bold">{usuarioLogado.username}</strong>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  className="ml-2 pl-2 border-l border-stone-300 text-stone-500 hover:text-[#E6007E] transition-colors p-1"
                  title="Sair do Sistema"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#00D287] text-[#1E1B2E] border-2 border-[#1E1B2E] font-black uppercase text-xs shadow-[2px_2px_0px_#1E1B2E] hover:bg-[#00b875] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                title="Fazer Login como Integrante ou Coordenação"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar (Login)</span>
              </button>
            )}
          </div>
        </div>

        {/* Título e Estilo Fanzine Carnavalesco */}
        <div className="relative inline-block mt-1">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[3px_3px_0px_#1E1B2E] flex items-center justify-center gap-3">
            <span className="text-[#00D287]">Bloco</span>
            <span className="text-[#E6007E]">Bicharada</span>
          </h1>
          <p className="text-sm font-mono tracking-widest text-[#FBBF24] font-bold text-center mt-1">
            {temaTitulo}
            {temaSubtitulo && (
              <span className="text-white/90 text-xs block font-normal tracking-normal mt-0.5">
                {temaSubtitulo}
              </span>
            )}
          </p>
        </div>

        {/* Contagem Regressiva Carnavalesca */}
        <div className="mt-3 flex items-center gap-2 bg-[#1E1B2E] px-4 py-2 border-2 border-white shadow-[3px_3px_0px_#E6007E]">
          <span className="text-[11px] font-mono text-stone-300 font-bold uppercase tracking-wider">
            Desfile 2027:
          </span>
          <div className="flex items-center gap-2 font-mono font-black text-sm">
            <span className="bg-[#E6007E] text-white px-2 py-0.5 shadow-[1px_1px_0px_#000]">
              {timeLeft.dias}D
            </span>
            <span className="text-[#FBBF24]">:</span>
            <span className="bg-[#00D287] text-[#1E1B2E] px-2 py-0.5 shadow-[1px_1px_0px_#000]">
              {timeLeft.horas}H
            </span>
            <span className="text-[#FBBF24]">:</span>
            <span className="bg-[#581C87] text-white px-2 py-0.5 shadow-[1px_1px_0px_#000]">
              {timeLeft.minutos}M
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE COMPACT HEADER (<= 768px)                              */}
      {/* Limite de altura ~85px conforme padrão estabelecido           */}
      {/* ------------------------------------------------------------- */}
      <div className="flex md:hidden flex-col justify-center px-3 py-2 min-h-[75px] max-h-[88px] relative z-10">
        
        {/* Linha Superior: Logo Compacto + Status DB + Login */}
        <div className="flex items-center justify-between gap-1 w-full">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-xl font-black uppercase tracking-tight text-white drop-shadow-[2px_2px_0px_#1E1B2E] flex items-center gap-1.5 leading-none shrink-0">
              <span className="text-[#00D287]">Bicharada</span>
            </h1>
            
            {dbConnected !== undefined && (
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border border-black flex items-center gap-1 shrink-0 ${
                  dbConnected ? 'bg-[#00D287] text-[#1E1B2E]' : 'bg-[#FEF08A] text-[#854D0E]'
                }`}
                title={dbConnected ? 'Postgres Conectado' : 'Offline'}
              >
                <Database className="w-2.5 h-2.5" />
                <span>{dbConnected ? 'Postgres' : 'Local'}</span>
              </span>
            )}
          </div>

          {/* Autenticação Mobile */}
          <div className="shrink-0 flex items-center gap-1">
            {usuarioLogado ? (
              <div className="flex items-center gap-1 bg-white text-[#1E1B2E] px-1.5 py-0.5 border border-black text-[10px] font-mono font-bold">
                <span className="text-[#E6007E]">{usuarioLogado.username}</span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-stone-500 hover:text-red-600 pl-1"
                  title="Sair"
                >
                  <LogOut className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="px-2 py-0.5 bg-[#00D287] text-[#1E1B2E] border border-black font-black uppercase text-[10px] shadow-[1px_1px_0px_#000] cursor-pointer"
              >
                Entrar
              </button>
            )}
          </div>
        </div>

        {/* Linha Inferior: Tema e Contagem Regressiva Compacta */}
        <div className="flex items-center justify-between gap-1 mt-1 text-[11px] font-mono">
          <span className="text-[#FBBF24] font-bold truncate max-w-[170px]">
            {temaTitulo}
          </span>

          <div className="flex items-center gap-1 font-mono font-black text-[10px] shrink-0">
            <span className="bg-[#E6007E] text-white px-1 py-0.2 shadow-[1px_1px_0px_#000]">
              {timeLeft.dias}d
            </span>
            <span className="text-[#FBBF24]">:</span>
            <span className="bg-[#00D287] text-[#1E1B2E] px-1 py-0.2 shadow-[1px_1px_0px_#000]">
              {timeLeft.horas}h
            </span>
            <span className="text-[#FBBF24]">:</span>
            <span className="bg-[#581C87] text-white px-1 py-0.2 shadow-[1px_1px_0px_#000]">
              {timeLeft.minutos}m
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
