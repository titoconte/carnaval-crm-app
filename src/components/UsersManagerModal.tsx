'use client';

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  X, 
  AlertTriangle, 
  Check, 
  KeyRound,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  UsuarioBloco, 
  adicionarNovoUsuario, 
  removerUsuario 
} from '../data/blocoData';

interface UsersManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarios: UsuarioBloco[];
  setUsuarios: React.Dispatch<React.SetStateAction<UsuarioBloco[]>>;
  usuarioLogado: UsuarioBloco | null;
}

/**
 * Painel Exclusivo de Gestão de Usuários da Coordenação.
 * - Lista todos os usuários cadastrados (Bichos e Coordenadores);
 * - Permite excluir usuários mediante caixa de confirmação;
 * - Popup para cadastrar novos usuários com nome de usuário, senha simples e nível de permissão.
 */
export default function UsersManagerModal({
  isOpen,
  onClose,
  usuarios,
  setUsuarios,
  usuarioLogado
}: UsersManagerModalProps) {
  // Modal de Criação de Novo Usuário
  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [novoUsername, setNovoUsername] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [isCoordenador, setIsCoordenador] = useState(false);
  const [erroCriacao, setErroCriacao] = useState<string | null>(null);

  // Modal de Confirmação de Exclusão
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<UsuarioBloco | null>(null);

  if (!isOpen) return null;

  /**
   * Processa o cadastro de um novo usuário (Bicho ou Coordenador).
   */
  const handleCriarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    setErroCriacao(null);

    const resultado = adicionarNovoUsuario(usuarios, {
      username: novoUsername,
      senha: novaSenha,
      perfil: isCoordenador ? 'coordenador' : 'bicho'
    });

    if (!resultado.sucesso) {
      setErroCriacao(resultado.erro || 'Erro ao criar usuário.');
      return;
    }

    setUsuarios(resultado.usuariosAtualizados);
    setNovoUsername('');
    setNovaSenha('');
    setIsCoordenador(false);
    setModalNovoOpen(false);

    confetti({
      particleCount: 40,
      spread: 60,
      colors: ['#00D287', '#581C87', '#FBBF24']
    });
  };

  /**
   * Confirma e executa a exclusão de um usuário do sistema.
   */
  const handleConfirmarExclusao = () => {
    if (!usuarioParaExcluir) return;

    if (usuarioLogado && usuarioParaExcluir.id === usuarioLogado.id) {
      alert('Você não pode excluir o seu próprio usuário logado no momento.');
      setUsuarioParaExcluir(null);
      return;
    }

    const atualizados = removerUsuario(usuarios, usuarioParaExcluir.id);
    setUsuarios(atualizados);
    setUsuarioParaExcluir(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-[#FAF6EC] border-4 border-[#1E1B2E] p-5 sm:p-6 max-w-2xl w-full shadow-[6px_6px_0px_#1E1B2E] max-h-[90vh] flex flex-col relative">
        {/* Cabeçalho do Painel */}
        <div className="flex items-center justify-between border-b-2 border-[#1E1B2E] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#581C87] text-[#FBBF24] border border-[#1E1B2E] shadow-[1px_1px_0px_#1E1B2E]">
              <Users className="w-4 h-4" />
            </span>
            <div>
              <span className="stamp stamp-urgent text-[10px]">Exclusivo Coordenação</span>
              <h3 className="font-mono font-black text-base uppercase text-[#1E1B2E] mt-0.5">
                Gestão de Usuários do Bloco
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setErroCriacao(null);
                setModalNovoOpen(true);
              }}
              className="vintage-button px-3 py-1.5 bg-[#00D287] hover:bg-[#34EEA0] text-[#1E1B2E] text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Novo Usuário</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 border-2 border-[#1E1B2E] bg-white text-[#1E1B2E] hover:bg-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabela de Usuários Cadastrados */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="bg-white border-2 border-[#1E1B2E] shadow-[2px_2px_0px_#1E1B2E]">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-stone-100 border-b-2 border-[#1E1B2E] text-stone-800 uppercase font-black">
                  <th className="p-2.5">Nome de Usuário</th>
                  <th className="p-2.5">Perfil & Permissão</th>
                  <th className="p-2.5 hidden sm:table-cell">Cadastrado em</th>
                  <th className="p-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {usuarios.map((user) => {
                  const isCoord = user.perfil === 'coordenador';
                  const isEu = usuarioLogado?.id === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-purple-50/40 transition-colors">
                      <td className="p-2.5 font-bold text-[#1E1B2E] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-stone-500" />
                        <span>{user.username}</span>
                        {isEu && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.5 border border-amber-300">
                            (Você)
                          </span>
                        )}
                      </td>
                      <td className="p-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase border ${
                          isCoord 
                            ? 'bg-purple-100 text-purple-900 border-purple-400' 
                            : 'bg-emerald-100 text-emerald-900 border-emerald-400'
                        }`}>
                          {isCoord ? <ShieldCheck className="w-3 h-3 text-[#581C87]" /> : <Shield className="w-3 h-3 text-[#00A868]" />}
                          <span>{isCoord ? 'Coordenador' : 'Bicho'}</span>
                        </span>
                      </td>
                      <td className="p-2.5 text-stone-500 hidden sm:table-cell">
                        {user.criadoEm}
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => setUsuarioParaExcluir(user)}
                          disabled={isEu}
                          className={`p-1.5 border border-[#1E1B2E] text-xs transition-all cursor-pointer ${
                            isEu 
                              ? 'opacity-30 cursor-not-allowed bg-stone-100' 
                              : 'bg-white hover:bg-red-50 text-red-600 hover:border-red-600 shadow-[1px_1px_0px_#1E1B2E]'
                          }`}
                          title={isEu ? 'Você não pode excluir sua própria conta' : 'Excluir usuário'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rodapé Informativo */}
        <div className="mt-4 pt-2.5 border-t border-stone-300 flex items-center justify-between text-[11px] font-mono text-stone-600">
          <span>Total: <strong>{usuarios.length}</strong> usuário(s) ativos</span>
          <span className="text-[10px] text-stone-500">Coordenadores têm permissão total de edição</span>
        </div>
      </div>

      {/* POPUP / MODAL PARA CRIAR NOVO USUÁRIO */}
      {modalNovoOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-[#FAF6EC] border-4 border-[#1E1B2E] p-5 max-w-sm w-full shadow-[6px_6px_0px_#1E1B2E]">
            <div className="flex items-center justify-between border-b-2 border-[#1E1B2E] pb-2 mb-3">
              <h4 className="font-mono font-black text-sm uppercase text-[#1E1B2E] flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#00D287]" />
                <span>Criar Novo Usuário</span>
              </h4>
              <button
                type="button"
                onClick={() => setModalNovoOpen(false)}
                className="p-1 border border-[#1E1B2E] bg-white text-[#1E1B2E] hover:bg-stone-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {erroCriacao && (
              <div className="mb-3 p-2 bg-red-100 border border-red-500 text-red-800 text-xs font-mono font-bold">
                {erroCriacao}
              </div>
            )}

            <form onSubmit={handleCriarUsuario} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Nome de Usuário *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: clarissebicho"
                    value={novoUsername}
                    onChange={(e) => setNovoUsername(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                  />
                  <User className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-2.5" />
                </div>
                <span className="text-[10px] text-stone-500 font-mono">Sem espaços ou caracteres especiais</span>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">
                  Senha Simples *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: bixa2027"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                  />
                  <KeyRound className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Botão de Seleção de Permissão de Coordenação */}
              <div className="p-3 bg-stone-100 border-2 border-[#1E1B2E] space-y-2">
                <span className="block text-xs font-black uppercase text-[#1E1B2E]">
                  Nível de Permissão:
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCoordenador(false)}
                    className={`py-1.5 px-2 border-2 border-[#1E1B2E] text-xs font-black uppercase cursor-pointer flex items-center justify-center gap-1 ${
                      !isCoordenador 
                        ? 'bg-[#00D287] text-[#1E1B2E] shadow-[2px_2px_0px_#1E1B2E]' 
                        : 'bg-white text-stone-700'
                    }`}
                  >
                    {!isCoordenador && <Check className="w-3 h-3" />}
                    <span>Bicho</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCoordenador(true)}
                    className={`py-1.5 px-2 border-2 border-[#1E1B2E] text-xs font-black uppercase cursor-pointer flex items-center justify-center gap-1 ${
                      isCoordenador 
                        ? 'bg-[#581C87] text-[#FBBF24] shadow-[2px_2px_0px_#1E1B2E]' 
                        : 'bg-white text-stone-700'
                    }`}
                  >
                    {isCoordenador && <Check className="w-3 h-3 text-[#FBBF24]" />}
                    <span>Coordenador</span>
                  </button>
                </div>

                <p className="text-[10px] font-mono text-stone-600">
                  {isCoordenador 
                    ? '★ Acesso total: edição de datas, criação de usuários, enquetes e finanças.' 
                    : 'Acesso às 11 abas com visualização e operações normais de folião.'}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovoOpen(false)}
                  className="px-3 py-1.5 border-2 border-[#1E1B2E] bg-white text-xs font-black uppercase hover:bg-stone-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-1.5 bg-[#00D287] text-[#1E1B2E] text-xs font-black uppercase shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CAIXA DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {usuarioParaExcluir && (
        <div className="fixed inset-0 z-70 bg-black/70 flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-[#FAF6EC] border-4 border-red-600 p-5 max-w-sm w-full shadow-[6px_6px_0px_#1E1B2E]">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-mono font-black text-sm uppercase">
                Confirmar Exclusão
              </h4>
            </div>

            <p className="text-xs font-mono text-stone-800 mb-3">
              Tem certeza que deseja excluir o usuário <strong>&quot;{usuarioParaExcluir.username}&quot;</strong>?
              Esta ação revogará o acesso deste usuário imediatamente.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-300">
              <button
                type="button"
                onClick={() => setUsuarioParaExcluir(null)}
                className="px-3 py-1.5 border-2 border-[#1E1B2E] bg-white text-xs font-black uppercase hover:bg-stone-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarExclusao}
                className="vintage-button px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
