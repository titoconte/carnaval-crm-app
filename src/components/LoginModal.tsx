'use client';

import React, { useState } from 'react';
import { Lock, User, X, LogIn, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UsuarioBloco, autenticarUsuario } from '../data/blocoData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (usuario: UsuarioBloco) => void;
  usuarios: UsuarioBloco[];
}

/**
 * Modal de Autenticação do Bloco Bicharada.
 * Permite que Bichos e Coordenadores entrem no sistema com nome de usuário e senha simples.
 */
export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  usuarios
}: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  if (!isOpen) return null;

  /**
   * Processa a tentativa de login comparando o nome de usuário e senha digitados.
   */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const usuario = autenticarUsuario(usuarios, username, senha);

    if (!usuario) {
      setErro('Nome de usuário ou senha incorretos. Verifique suas credenciais.');
      return;
    }

    // Sucesso no login
    confetti({
      particleCount: 50,
      spread: 70,
      colors: usuario.perfil === 'coordenador' ? ['#00D287', '#581C87', '#FBBF24'] : ['#E6007E', '#00D287', '#FBBF24']
    });

    onLoginSuccess(usuario);
    setUsername('');
    setSenha('');
    setErro(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-[#FAF6EC] border-4 border-[#1E1B2E] p-6 max-w-sm w-full shadow-[6px_6px_0px_#1E1B2E] relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 border-2 border-[#1E1B2E] bg-white text-[#1E1B2E] hover:bg-stone-200 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-5">
          <span className="stamp stamp-urgent text-xs">Acesso ao Sistema</span>
          <h3 className="font-mono font-black text-lg uppercase text-[#1E1B2E] mt-1">
            Entrar no Bloco
          </h3>
          <p className="text-xs font-serif text-stone-600 mt-0.5">
            Acesso para Bichos e Coordenadores da Bicharada
          </p>
        </div>

        {erro && (
          <div className="mb-4 p-2.5 bg-red-50 border-2 border-red-500 text-red-700 text-xs font-mono font-bold flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
              Nome de Usuário
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                placeholder="Ex: adminbixarada"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
              />
              <User className="w-4 h-4 text-stone-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
              Senha Simples
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Digite sua senha..."
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
              />
              <Lock className="w-4 h-4 text-stone-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full vintage-button mt-4 py-2 bg-[#00D287] hover:bg-[#34EEA0] text-[#1E1B2E] text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Entrar na Minha Conta</span>
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-stone-300 text-center">
          <p className="text-[10px] font-mono text-stone-500">
            Folião visitante? O público tem acesso sem login para consultar repertório, rifas e se inscrever!
          </p>
        </div>
      </div>
    </div>
  );
}
