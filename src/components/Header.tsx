'use client';

import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  User, 
  PartyPopper, 
  Database,
  RefreshCw
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
  onSync?: () => void;
}

/**
 * Cabeçalho do Bloco Bicharada com as Cores Oficiais e Estilo Fanzine Carnavalesco.
 * - Versão Desktop: Banner completo com contagem regressiva em destaque, logo oficial e autenticação.
 * - Versão Mobile: Painel compacto (~85px) sem sobrecarregar a tela.
 * - Autenticação: Mostra status de Folião Público (com botão Entrar / Login) ou crachá do usuário logado (Bicho ou Coordenador).
 * - Sincronização: Indicador do status do Vercel Postgres e botão de atualização sem cache.
 */
export default function Header({
  usuarioLogado,
  onOpenLoginModal,
  onLogout,
  temaTitulo = 'Solta pelos Ares 🪽',
  dbConnected,
  dbSyncing = false,
  onSync
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
                    : 'Modo Local (LocalStorage) - Ative POSTGRES_URL na Vercel para sincronização em nuvem'
                }
              >
                <Database className="w-3 h-3" />
                <span>
                  {dbSyncing
                    ? 'Sincronizando...'
                    : dbConnected
                    ? 'Vercel Postgres Ativo'
                    : 'Modo Local (LocalStorage)'}
                </span>
                {dbConnected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E1B2E] animate-pulse" />
                )}
              </div>
            )}

            {onSync && (
              <button
                type="button"
                onClick={onSync}
                className="flex items-center gap-1 px-2 py-1 bg-white text-[#1E1B2E] hover:bg-stone-100 border-2 border-[#1E1B2E] font-mono font-bold text-[10px] uppercase shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
                title="Buscar atualizações e sincronizar agora"
              >
                <RefreshCw className={`w-3 h-3 ${dbSyncing ? 'animate-spin text-[#E6007E]' : ''}`} />
                <span>Atualizar</span>
              </button>
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
                <span>{usuarioLogado.username} ({usuarioLogado.perfil})</span>
              </span>

              <button
                type="button"
                onClick={onLogout}
                className="vintage-button px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 border-2 border-[#1E1B2E] text-xs font-black uppercase flex items-center gap-1 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
                title="Encerrar sessão deste usuário"
              >
                <LogOut className="w-3.5 h-3.5 text-red-600" />
                <span>Sair</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="vintage-button px-3.5 py-1 bg-[#FBBF24] hover:bg-[#FDE047] text-[#1E1B2E] border-2 border-[#1E1B2E] text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
              title="Entrar com usuário de Bicho ou Coordenador"
            >
              <LogIn className="w-3.5 h-3.5 text-[#E6007E]" />
              <span>Entrar / Login</span>
            </button>
          )}
        </div>

        {/* Título e Estilo Fanzine Carnavalesco */}
        <div className="relative inline-block mt-1">
          <span className="font-mono text-xs font-black uppercase bg-[#00D287] text-[#1E1B2E] px-2 py-0.5 border border-black shadow-[2px_2px_0px_#000] rotate-[-2deg] inline-block mb-1">
            Sistema Oficial de Gestão
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[3px_3px_0px_#1E1B2E] flex items-center justify-center gap-3">
            <span className="text-[#00D287]">Bloco</span>
            <span className="text-[#FBBF24]">da</span>
            <span className="text-[#E6007E]">Bicharada</span>
          </h1>
        </div>

        {/* Faixa do Tema do Carnaval */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="font-mono text-xs font-black uppercase tracking-wider text-[#FBBF24] bg-[#581C87] border-2 border-[#FBBF24] px-3 py-1 shadow-[2px_2px_0px_#1E1B2E] rotate-[0.5deg]">
            <span className="text-white mr-1.5">Carnaval 2027:</span>
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
                title={dbConnected ? 'Vercel Postgres Ativo' : 'Modo Local (LocalStorage)'}
              >
                <Database className="w-2.5 h-2.5" />
                <span>{dbConnected ? 'Postgres' : 'Local'}</span>
              </span>
            )}
            {onSync && (
              <button
                type="button"
                onClick={onSync}
                className="p-1 bg-white text-[#1E1B2E] border border-black shadow-[1px_1px_0px_#000] shrink-0"
                title="Atualizar dados"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${dbSyncing ? 'animate-spin text-[#E6007E]' : ''}`} />
              </button>
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
              className="px-2 py-0.5 bg-[#FBBF24] text-[#1E1B2E] border border-black font-black uppercase text-[10px] shadow-[1px_1px_0px_#000] flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <LogIn className="w-3 h-3 text-[#E6007E]" />
              <span>Entrar</span>
            </button>
          )}
        </div>

        {/* Título e Tema Mobile Compactos */}
        <div className="flex items-center justify-between gap-1 border-t border-white/20 pt-1">
          <div className="font-black text-sm uppercase tracking-tight text-white flex items-center gap-1">
            <span className="text-[#00D287]">Bloco</span>
            <span className="text-[#FBBF24]">da</span>
            <span className="text-[#E6007E]">Bicharada</span>
          </div>
          <div className="text-[10px] font-mono font-bold text-[#FBBF24] bg-[#581C87] border border-[#FBBF24] px-1.5 py-0.2 truncate max-w-[170px]">
            {temaTitulo}
          </div>
        </div>
      </div>
    </header>
  );
}
