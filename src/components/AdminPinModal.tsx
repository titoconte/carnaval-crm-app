'use client';

import React, { useState } from 'react';
import { Lock, KeyRound, Sparkles, X } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal de Autenticação Rápida da Coordenação por PIN/Senha.
 */
export default function AdminPinModal({ isOpen, onClose, onSuccess }: AdminPinModalProps) {
  const [pin, setPin] = useState('');
  const [erro, setErro] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // PIN padrão do Carnaval: 2027 ou bixarada
    if (pin === '2027' || pin.toLowerCase() === 'bixarada') {
      onSuccess();
      onClose();
      setPin('');
      setErro(false);
    } else {
      setErro(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 text-center relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-stone-400 hover:text-stone-700 p-1"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center mx-auto mb-3">
          <KeyRound className="w-6 h-6" />
        </div>

        <h3 className="text-base font-black text-[#1E1B2E]">Acesso da Coordenação</h3>
        <p className="text-xs text-stone-500 mt-1 mb-4">
          Digite o PIN de organizador para liberar o lançamento no bar, edição de status e upload avançado.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="password"
              autoFocus
              maxLength={8}
              placeholder="Digite o PIN (Dica: 2027)"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setErro(false);
              }}
              className="w-full text-center px-4 py-2.5 rounded-xl border border-stone-300 font-mono text-base tracking-widest focus:outline-none focus:border-[#6C2BD9]"
            />
            {erro && (
              <p className="text-[11px] text-rose-600 font-bold mt-1.5">
                PIN incorreto! Tente o ano do carnaval: 2027
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#6C2BD9] hover:bg-[#4C1D95] text-white font-extrabold rounded-xl text-xs shadow-md transition-all active:scale-95"
          >
            Desbloquear Modo Coordenação
          </button>
        </form>
      </div>
    </div>
  );
}

