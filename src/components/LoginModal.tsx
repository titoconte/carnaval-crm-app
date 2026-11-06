'use client';

import React, { useState, useEffect } from 'react';
import { Lock, User, X, LogIn, AlertCircle, UserPlus, CheckCircle2, Ticket } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UsuarioBloco, autenticarUsuario } from '../data/blocoData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (usuario: UsuarioBloco) => void;
  usuarios: UsuarioBloco[];
  onCadastrarUsuario?: (usuario: UsuarioBloco) => void;
  isModoConvite?: boolean;
}

/**
 * Modal de Autenticação e Primeiro Acesso por Convite do Bloco Bicharada.
 * - Modo Normal: Apenas formulário de Login (Username + Senha). Nenhuma opção pública de cadastro é visível.
 * - Modo Convite (Link Exclusivo): Abre tela de Primeiro Acesso para criação de conta de Bicho.
 */
export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  usuarios,
  onCadastrarUsuario,
  isModoConvite = false
}: LoginModalProps) {
  const [modo, setModo] = useState<'login' | 'cadastro'>(isModoConvite ? 'cadastro' : 'login');
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  // Sincroniza o modo quando o modal abre dependendo se é convite exclusivo ou login normal
  useEffect(() => {
    if (isOpen) {
      setModo(isModoConvite ? 'cadastro' : 'login');
      setErro(null);
    }
  }, [isOpen, isModoConvite]);

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
    limparFormulario();
    onClose();
  };

  /**
   * Processa o autocadastro de um novo integrante com perfil 'bicho' via link de convite.
   */
  const handleAutocadastro = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const userLimpo = username.trim().toLowerCase();
    if (userLimpo.length < 3) {
      setErro('O nome de usuário deve ter pelo menos 3 caracteres.');
      return;
    }

    if (senha.length < 3) {
      setErro('A senha deve ter pelo menos 3 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem. Digite novamente.');
      return;
    }

    // Verifica se já existe um usuário com esse username
    const jaExiste = usuarios.some(u => u.username.toLowerCase() === userLimpo);
    if (jaExiste) {
      setErro(`O usuário "${userLimpo}" já está cadastrado. Tente outro nome ou faça login.`);
      return;
    }

    const novoUsuario: UsuarioBloco = {
      id: `usr-auto-${Date.now()}`,
      username: userLimpo,
      senha: senha,
      perfil: 'bicho',
      criadoEm: new Date().toISOString()
    };

    if (onCadastrarUsuario) {
      onCadastrarUsuario(novoUsuario);
    }

    confetti({
      particleCount: 60,
      spread: 75,
      colors: ['#00D287', '#E6007E', '#FBBF24']
    });

    onLoginSuccess(novoUsuario);
    limparFormulario();
    onClose();
  };

  const limparFormulario = () => {
    setUsername('');
    setSenha('');
    setConfirmarSenha('');
    setErro(null);
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

        <div className="text-center mb-4">
          {isModoConvite ? (
            <span className="stamp stamp-gold text-xs flex items-center justify-center gap-1 mx-auto w-fit">
              <Ticket className="w-3.5 h-3.5" />
              <span>Convite Exclusivo</span>
            </span>
          ) : (
            <span className="stamp stamp-urgent text-xs">
              Acesso ao Sistema
            </span>
          )}

          <h3 className="font-mono font-black text-lg uppercase text-[#1E1B2E] mt-1">
            {modo === 'login' ? 'Entrar no Bloco' : 'Primeiro Acesso'}
          </h3>
          <p className="text-xs font-serif text-stone-600 mt-0.5">
            {modo === 'login'
              ? 'Acesso para Bichos e Coordenadores da Bicharada'
              : 'Cadastre seu usuário para ter acesso ao sistema interno'}
          </p>
        </div>

        {erro && (
          <div className="mb-4 p-2.5 bg-red-50 border-2 border-red-500 text-red-700 text-xs font-mono font-bold flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{erro}</span>
          </div>
        )}

        {modo === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                Nome de Usuário
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: mariasilva ou adminbixarada"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
                <User className="w-4 h-4 text-stone-500 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                Senha
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
              className="w-full vintage-button mt-3 py-2 bg-[#00D287] hover:bg-[#34EEA0] text-[#1E1B2E] text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar no Sistema</span>
            </button>

            {/* Se acessou via link de convite mas já tem conta, pode alternar */}
            {isModoConvite && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setModo('cadastro'); setErro(null); }}
                  className="text-xs font-mono text-[#581C87] hover:underline"
                >
                  ← Voltar para Primeiro Acesso
                </button>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleAutocadastro} className="space-y-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                Nome de Usuário (Apelido/Nome) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: lais.sax ou pedro.surdo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
                <User className="w-4 h-4 text-stone-500 absolute left-2.5 top-2.5" />
              </div>
              <span className="text-[10px] font-mono text-stone-500 mt-0.5 block">
                Sem espaços, minúsculo. Será seu login de acesso.
              </span>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                Crie uma Senha Simples *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Mínimo de 3 caracteres..."
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
                <Lock className="w-4 h-4 text-stone-500 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                Confirme a Senha *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Repita a senha criada..."
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
                <Lock className="w-4 h-4 text-stone-500 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full vintage-button mt-3 py-2 bg-[#E6007E] hover:bg-[#C2006A] text-white text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Concluir Cadastro & Entrar</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setModo('login'); setErro(null); }}
                className="text-xs font-mono text-[#581C87] hover:underline"
              >
                Já tem conta cadastrada? Fazer Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
