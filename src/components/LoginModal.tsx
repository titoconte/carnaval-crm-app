'use client';

import React, { useState } from 'react';
import { Lock, User, X, LogIn, AlertCircle, UserPlus, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UsuarioBloco, autenticarUsuario, adicionarNovoUsuario } from '../data/blocoData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (usuario: UsuarioBloco) => void;
  usuarios: UsuarioBloco[];
  onCadastrarUsuario?: (usuario: UsuarioBloco) => void;
}

/**
 * Modal de Autenticação e Autocadastro do Bloco Bicharada.
 * - Modo Login: Bichos e Coordenadores entram com username e senha.
 * - Modo Autocadastro: Novos integrantes criam sua conta de 'Bicho' no primeiro acesso.
 */
export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  usuarios,
  onCadastrarUsuario
}: LoginModalProps) {
  const [modo, setModo] = useState<'login' | 'cadastro'>('login');
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
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
    limparFormulario();
    onClose();
  };

  /**
   * Processa o autocadastro de um novo integrante com perfil 'bicho'.
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
          <span className="stamp stamp-urgent text-xs">
            {modo === 'login' ? 'Acesso ao Sistema' : 'Primeiro Acesso'}
          </span>
          <h3 className="font-mono font-black text-lg uppercase text-[#1E1B2E] mt-1">
            {modo === 'login' ? 'Entrar no Bloco' : 'Criar Minha Conta'}
          </h3>
          <p className="text-xs font-serif text-stone-600 mt-0.5">
            {modo === 'login'
              ? 'Acesso para Bichos e Coordenadores da Bicharada'
              : 'Cadastre seu usuário para acessar todas as áreas do bloco'}
          </p>
        </div>

        {/* Abas Alternadoras: Login / Criar Conta */}
        <div className="flex border-2 border-[#1E1B2E] mb-4 bg-stone-200 font-mono text-xs font-bold">
          <button
            type="button"
            onClick={() => { setModo('login'); setErro(null); }}
            className={`flex-1 py-1.5 text-center uppercase cursor-pointer transition-colors ${
              modo === 'login'
                ? 'bg-[#1E1B2E] text-white'
                : 'text-[#1E1B2E] hover:bg-stone-300'
            }`}
          >
            Fazer Login
          </button>
          <button
            type="button"
            onClick={() => { setModo('cadastro'); setErro(null); }}
            className={`flex-1 py-1.5 text-center uppercase cursor-pointer transition-colors ${
              modo === 'cadastro'
                ? 'bg-[#E6007E] text-white'
                : 'text-[#1E1B2E] hover:bg-stone-300'
            }`}
          >
            Primeiro Acesso
          </button>
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
              <span>Entrar na Minha Conta</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleAutocadastro} className="space-y-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                Escolha seu Nome de Usuário *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: joaosilva (sem espaços)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
                <User className="w-4 h-4 text-stone-500 absolute left-2.5 top-2.5" />
              </div>
              <span className="text-[10px] text-stone-500 font-mono mt-0.5 block">
                Mínimo 3 letras ou números.
              </span>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                Criar Senha Simples *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Crie uma senha..."
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
                <Lock className="w-4 h-4 text-stone-500 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                Confirmar Senha *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Digite a mesma senha..."
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
                <CheckCircle2 className="w-4 h-4 text-stone-500 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full vintage-button mt-3 py-2 bg-[#E6007E] hover:bg-[#C2006A] text-white text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar e Entrar</span>
            </button>
          </form>
        )}

        <div className="mt-4 pt-3 border-t border-stone-300 text-center">
          {modo === 'login' ? (
            <button
              type="button"
              onClick={() => { setModo('cadastro'); setErro(null); }}
              className="text-xs font-mono font-bold text-[#E6007E] hover:underline cursor-pointer"
            >
              Primeiro acesso? Crie sua conta aqui!
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setModo('login'); setErro(null); }}
              className="text-xs font-mono font-bold text-stone-700 hover:underline cursor-pointer"
            >
              Já possui conta? Clique para entrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
