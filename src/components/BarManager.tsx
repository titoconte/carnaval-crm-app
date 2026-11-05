'use client';

import React, { useState } from 'react';
import { Beer, TrendingUp, TrendingDown, Plus, Minus, Receipt, Wallet } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MovimentoBar } from '../data/blocoData';

interface BarManagerProps {
  movimentos: MovimentoBar[];
  setMovimentos: React.Dispatch<React.SetStateAction<MovimentoBar[]>>;
  isAdmin: boolean;
}

/**
 * Livro Caixa do Bar dos Ensaios com as Cores Oficiais da Bicharada.
 */
export default function BarManager({ movimentos, setMovimentos, isAdmin }: BarManagerProps) {
  const [modalLancamento, setModalLancamento] = useState<null | 'Entrada' | 'Saída'>(null);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState<MovimentoBar['categoria']>('Venda de Cerveja / Bebidas');
  const [responsavel, setResponsavel] = useState('Pedro');

  const totalEntradas = movimentos
    .filter(m => m.tipo === 'Entrada')
    .reduce((acc, cur) => acc + cur.valor, 0);

  const totalSaidas = movimentos
    .filter(m => m.tipo === 'Saída')
    .reduce((acc, cur) => acc + cur.valor, 0);

  const saldoAtual = totalEntradas - totalSaidas;

  const handleSalvarMovimento = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valor.replace(',', '.'));
    if (!descricao.trim() || isNaN(val) || val <= 0 || !modalLancamento) return;

    const novo: MovimentoBar = {
      id: `mov-${Date.now()}`,
      data: new Date().toISOString().split('T')[0],
      descricao: descricao.trim(),
      tipo: modalLancamento,
      categoria,
      valor: val,
      responsavel: responsavel.trim() || 'Apoio'
    };

    setMovimentos(prev => [novo, ...prev]);
    setModalLancamento(null);
    setDescricao('');
    setValor('');

    confetti({
      particleCount: 30,
      spread: 50,
      colors: modalLancamento === 'Entrada' ? ['#00D287', '#FBBF24'] : ['#E6007E', '#1E1B2E']
    });
  };

  return (
    <div className="space-y-4">
      {/* Banner Principal */}
      <div className="vintage-card p-4 border-l-8 border-[#FBBF24] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black uppercase text-[#1E1B2E] flex items-center gap-2">
            <Beer className="w-5 h-5 text-[#E6007E]" />
            <span>Livro Caixa do Bar dos Ensaios</span>
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Controle financeiro das latinhas nos ensaios, compras no atacado e isopores de peixaria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCategoria('Venda de Cerveja / Bebidas');
              setModalLancamento('Entrada');
            }}
            className="vintage-button px-3.5 py-2 bg-[#00D287] text-[#1E1B2E] hover:bg-[#34EEA0] text-xs uppercase flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Entrada</span>
          </button>

          <button
            onClick={() => {
              setCategoria('Compra no Atacado (Fort)');
              setModalLancamento('Saída');
            }}
            className="vintage-button px-3.5 py-2 bg-[#E6007E] text-white hover:bg-[#C2006A] text-xs uppercase flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
          >
            <Minus className="w-4 h-4" />
            <span>- Nova Saída</span>
          </button>
        </div>
      </div>

      {/* Cartões do Caixa */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="vintage-card p-4 bg-[#ECFDF5] border-[#00D287]">
          <span className="text-[11px] font-black uppercase text-[#00A868] font-mono flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Total Entradas (Vendas)
          </span>
          <p className="text-2xl font-black text-[#00A868] font-mono mt-1">
            + R$ {totalEntradas.toFixed(2).replace('.', ',')}
          </p>
        </div>

        <div className="vintage-card p-4 bg-[#FDF2F8] border-[#E6007E]">
          <span className="text-[11px] font-black uppercase text-[#E6007E] font-mono flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> Total Saídas (Despesas)
          </span>
          <p className="text-2xl font-black text-[#E6007E] font-mono mt-1">
            - R$ {totalSaidas.toFixed(2).replace('.', ',')}
          </p>
        </div>

        <div className="vintage-card p-4 bg-[#FEFCE8] border-[#FBBF24]">
          <span className="text-[11px] font-black uppercase text-[#B45309] font-mono flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-[#581C87]" /> Saldo em Caixa Atual
          </span>
          <p className="text-2xl font-black text-[#1E1B2E] font-mono mt-1">
            R$ {saldoAtual.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </div>

      {/* Extrato / Fita de Caixa */}
      <div className="vintage-card p-5">
        <div className="flex items-center justify-between border-b-2 border-[#1E1B2E] pb-2 mb-3">
          <h3 className="font-black text-sm uppercase text-[#1E1B2E] font-mono flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#581C87]" />
            <span>Extrato Contábil dos Ensaios</span>
          </h3>
          <span className="text-xs font-mono font-bold text-stone-500">
            {movimentos.length} lançamentos registrados
          </span>
        </div>

        <div className="space-y-2">
          {movimentos.map((mov) => {
            const isEntrada = mov.tipo === 'Entrada';
            return (
              <div
                key={mov.id}
                className="p-3 bg-stone-50/70 border border-[#1E1B2E] shadow-[2px_2px_0px_#1E1B2E] flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className={`font-black px-1.5 py-0.5 border ${
                      isEntrada ? 'bg-[#ECFDF5] text-[#00A868] border-[#00D287]' : 'bg-[#FDF2F8] text-[#E6007E] border-[#E6007E]'
                    }`}>
                      {mov.categoria}
                    </span>
                    <span className="text-stone-500">{mov.data}</span>
                  </div>

                  <p className="font-bold text-[#1E1B2E] mt-1 font-mono text-xs">
                    {mov.descricao}
                  </p>
                  <p className="text-[10px] text-stone-500">Resp: {mov.responsavel}</p>
                </div>

                <div className="text-right shrink-0 font-mono">
                  <span className={`text-sm font-black ${isEntrada ? 'text-[#00A868]' : 'text-[#E6007E]'}`}>
                    {isEntrada ? '+' : '-'} R$ {mov.valor.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Lançamento */}
      {modalLancamento && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-md w-full shadow-[6px_6px_0px_#1E1B2E]">
            <div className={`stamp ${modalLancamento === 'Entrada' ? 'stamp-confirmed' : 'stamp-urgent'} text-xs mb-2`}>
              Novo Lançamento: {modalLancamento}
            </div>

            <h3 className="text-base font-black uppercase text-[#1E1B2E]">
              {modalLancamento === 'Entrada' ? 'Registrar Venda no Bar' : 'Registrar Compra / Despesa'}
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 font-serif">
              Mantenha o caixa do bloco atualizado e transparente.
            </p>

            <form onSubmit={handleSalvarMovimento} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Descrição do Movimento *</label>
                <input
                  type="text"
                  required
                  placeholder={modalLancamento === 'Entrada' ? 'Ex: Venda de 50 cervejas no ensaio' : 'Ex: Compra de 6 caixas de cerveja no Fort'}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Valor (R$) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 150,00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono"
                  >
                    {modalLancamento === 'Entrada' ? (
                      <>
                        <option value="Venda de Cerveja / Bebidas">Venda de Cerveja / Bebidas</option>
                        <option value="Outros">Outras Entradas</option>
                      </>
                    ) : (
                      <>
                        <option value="Compra no Atacado (Fort)">Compra no Atacado (Fort)</option>
                        <option value="Isopor da Peixaria">Isopor da Peixaria</option>
                        <option value="Gelo">Gelo</option>
                        <option value="Outros">Outras Despesas</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Responsável</label>
                <input
                  type="text"
                  placeholder="Ex: Pedro / Tito"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalLancamento(null)}
                  className="px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-bold uppercase hover:bg-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`vintage-button px-4 py-1.5 text-xs uppercase ${
                    modalLancamento === 'Entrada' ? 'bg-[#00D287] text-[#1E1B2E]' : 'bg-[#E6007E] text-white'
                  }`}
                >
                  Confirmar {modalLancamento}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
