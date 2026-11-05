'use client';

import React, { useState } from 'react';
import { UserPlus, CheckCircle2, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Integrante } from '../data/blocoData';

interface JoinFormProps {
  onAddIntegrante: (novo: Integrante) => void;
}

/**
 * Ficha de Inscrição Vintage para Novos Bichos.
 */
export default function JoinForm({ onAddIntegrante }: JoinFormProps) {
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [grandeGrupo, setGrandeGrupo] = useState<Integrante['grandeGrupo']>('Bateria');
  const [instrumentoOuFuncao, setInstrumentoOuFuncao] = useState('Caixa');
  const [experiencia, setExperiencia] = useState('Já toco o instrumento com facilidade');
  const [observacao, setObservacao] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !whatsapp.trim()) return;

    const novo: Integrante = {
      id: `novo-${Date.now()}`,
      nome: nome.trim(),
      grandeGrupo,
      instrumentoOuFuncao: instrumentoOuFuncao.trim(),
      observacao: `${experiencia} | Whats: ${whatsapp.trim()} ${observacao ? `| ${observacao.trim()}` : ''}`,
      ativo: true
    };

    onAddIntegrante(novo);
    setEnviado(true);

    confetti({
      particleCount: 50,
      spread: 70,
      colors: ['#E6007E', '#00A868', '#FBBF24']
    });
  };

  return (
    <div className="max-w-lg mx-auto vintage-card p-6 sm:p-8">
      <div className="text-center mb-6">
        <span className="stamp stamp-open text-xs mb-2">Edital Aberto</span>
        <h2 className="text-2xl font-black uppercase text-[#1A181B] font-mono">
          Quero Sair na Bicharada! 🐾
        </h2>
        <p className="text-xs text-stone-600 mt-1 font-serif max-w-sm mx-auto">
          Preencha sua ficha de inscrição para entrar na bateria, nos metais, na ala de pernaltas ou no apoio.
        </p>
      </div>

      {enviado ? (
        <div className="p-6 bg-[#FEF08A] border-2 border-[#1A181B] shadow-[3px_3px_0px_#1A181B] text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-[#00A868] mx-auto" />
          <h3 className="font-black text-base uppercase text-[#1A181B] font-mono">Ficha Recebida com Sucesso!</h3>
          <p className="text-xs text-stone-800 font-serif">
            Seja bem-vindo(a), <strong>{nome}</strong>! Você já está no quadro oficial do bloco em <strong>{grandeGrupo} ({instrumentoOuFuncao})</strong>.
          </p>
          <button
            onClick={() => setEnviado(false)}
            className="vintage-button px-4 py-2 bg-[#1A181B] text-white text-xs uppercase"
          >
            Preencher Outra Ficha
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Nome Completo *</label>
            <input
              type="text"
              required
              placeholder="Ex: Joana da Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">WhatsApp (com DDD) *</label>
            <input
              type="tel"
              required
              placeholder="(48) 99999-9999"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Grande Ala de Interesse</label>
              <select
                value={grandeGrupo}
                onChange={(e) => setGrandeGrupo(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono"
              >
                <option value="Bateria">Bateria (Percussão)</option>
                <option value="Sopros">Sopros (Metais)</option>
                <option value="Vozes">Vozes & Canto</option>
                <option value="Outros Instrumentos">Outros (Harmonia/Baixo/Cavaco)</option>
                <option value="Brincantes & Dança">Brincantes & Dança (Pernalta)</option>
                <option value="Organização & Apoio">Apoio & Logística de Rua</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Instrumento / Função</label>
              <input
                type="text"
                placeholder="Ex: Caixa, Surdo, Trompete, Pernalta..."
                value={instrumentoOuFuncao}
                onChange={(e) => setInstrumentoOuFuncao(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Experiência Musical / Carnavalesca</label>
            <select
              value={experiencia}
              onChange={(e) => setExperiencia(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-mono"
            >
              <option value="Já toco o instrumento com facilidade">Já toco o instrumento com facilidade</option>
              <option value="Sei o básico / quero praticar nos ensaios">Sei o básico / quero praticar nos ensaios</option>
              <option value="Tenho instrumento próprio mas sou iniciante">Tenho instrumento próprio mas sou iniciante</option>
              <option value="Quero atuar no apoio/produção/dança">Quero atuar no apoio/produção/dança</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#1A181B] mb-1">Recado para a Coordenação (opcional)</label>
            <textarea
              rows={2}
              placeholder="Alguma observação, disponibilidade ou sugestão..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#1A181B] text-xs font-serif focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="vintage-button w-full py-2.5 bg-[#E6007E] text-white text-xs uppercase flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_#1A181B]"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>Enviar Minha Ficha!</span>
          </button>
        </form>
      )}
    </div>
  );
}
