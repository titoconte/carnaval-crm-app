'use client';

import React, { useState } from 'react';
import { Gift, Sparkles, Check, Copy, MessageSquare, ShoppingBag, Search, Plus, AlertCircle, Calendar, UserCheck, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Rifa,
  RifaVenda,
  PremioRifa,
  validarVendaRifa,
  criarNovaRifa,
  gerarVendasIniciaisParaRifa,
  BilheteRifa
} from '../data/blocoData';

interface RaffleAppProps {
  rifas: Rifa[];
  setRifas: React.Dispatch<React.SetStateAction<Rifa[]>>;
  vendas: RifaVenda[];
  setVendas: React.Dispatch<React.SetStateAction<RifaVenda[]>>;
  isAdmin: boolean;
  // Compatibilidade caso bilhetes legados sejam passados
  bilhetes?: BilheteRifa[];
  setBilhetes?: React.Dispatch<React.SetStateAction<BilheteRifa[]>>;
}

/**
 * Aplicativo Oficial de Rifas do Bloco Bicharada.
 * Suporta múltiplas rifas estruturadas, criação pelo administrador,
 * tabela fato de vendas e validação de data limite (+1 dia).
 */
export default function RaffleApp({
  rifas,
  setRifas,
  vendas,
  setVendas,
  isAdmin
}: RaffleAppProps) {
  // Rifa selecionada no momento
  const [activeRifaId, setActiveRifaId] = useState<string>(rifas[0]?.id || 'rifa-oficial-2027');
  const currentRifa = rifas.find(r => r.id === activeRifaId) || rifas[0];

  // Estados de navegação e filtros
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [faixaAtiva, setFaixaAtiva] = useState<number>(1);
  const [buscaNumero, setBuscaNumero] = useState('');
  const [nomeComprador, setNomeComprador] = useState('');
  const [whatsComprador, setWhatsComprador] = useState('');
  const [modalCheckout, setModalCheckout] = useState(false);
  const [copiadoPix, setCopiadoPix] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | 'Disponível' | 'Reservado' | 'Pago'>('Todos');

  // Modal de Criação de Nova Rifa (Exclusivo Administrador)
  const [modalCriarRifa, setModalCriarRifa] = useState(false);
  const [formTitulo, setFormTitulo] = useState('');
  const [formCoordenador, setFormCoordenador] = useState('Regina');
  const [formQuantidade, setFormQuantidade] = useState<number>(200);
  const [formPreco, setFormPreco] = useState<number>(10);
  const [formDataLimite, setFormDataLimite] = useState('');
  const [formNumeroPremios, setFormNumeroPremios] = useState<number>(3);
  const [formDescritivosPremios, setFormDescritivosPremios] = useState<string[]>([
    'Cesta Artesanal Carnavalesca',
    'Camiseta Oficial + Copo',
    'Kit Cervejas Artesanais'
  ]);

  if (!currentRifa) {
    return <div className="p-8 text-center font-mono">Nenhuma rifa disponível no momento.</div>;
  }

  // Vendas pertencentes à rifa ativa
  const vendasDaRifa = vendas.filter(v => v.rifaId === currentRifa.id);

  // Validação da data limite (+1 dia de tolerância máxima)
  const statusVenda = validarVendaRifa(currentRifa, new Date());
  const vendasEncerradas = !statusVenda.permitida;

  const totalPagos = vendasDaRifa.filter(b => b.status === 'Pago').length;
  const totalReservados = vendasDaRifa.filter(b => b.status === 'Reservado').length;
  const totalDisponiveis = vendasDaRifa.filter(b => b.status === 'Disponível').length;
  const valorTotalArrecadado = totalPagos * currentRifa.precoNumero;
  const metaTotal = currentRifa.quantidadeNumeros * currentRifa.precoNumero;

  /**
   * Alterna a seleção de um número para compra pelo folião.
   */
  const toggleSelectNumber = (num: number) => {
    if (vendasEncerradas) return;
    const bilhete = vendasDaRifa.find(b => b.numero === num);
    if (!bilhete || bilhete.status === 'Pago') return;

    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(prev => prev.filter(n => n !== num));
    } else {
      setSelectedNumbers(prev => [...prev, num]);
    }
  };

  /**
   * Abre o modal de checkout caso haja números selecionados.
   */
  const handleAbrirCheckout = () => {
    if (selectedNumbers.length === 0 || vendasEncerradas) return;
    setModalCheckout(true);
  };

  /**
   * Copia a chave Pix oficial para a área de transferência.
   */
  const copiarPix = () => {
    navigator.clipboard.writeText(currentRifa.chavePix || 'apoio@bicharada.org');
    setCopiadoPix(true);
    setTimeout(() => setCopiadoPix(false), 2000);
  };

  /**
   * Conclui a reserva de números, salvando na tabela fato de vendas e gerando o link do WhatsApp.
   */
  const handleFinalizarReserva = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeComprador.trim() || !whatsComprador.trim() || selectedNumbers.length === 0) return;

    if (vendasEncerradas) {
      alert('Prazo de vendas para esta rifa já se encerrou (limite de 1 dia após a data final ultrapassado).');
      return;
    }

    const dataAtual = new Date().toISOString();

    setVendas(prev => prev.map(v => {
      if (v.rifaId === currentRifa.id && selectedNumbers.includes(v.numero)) {
        return {
          ...v,
          status: 'Reservado',
          compradorNome: nomeComprador.trim(),
          compradorWhats: whatsComprador.trim(),
          dataVenda: dataAtual,
          valorPago: currentRifa.precoNumero
        };
      }
      return v;
    }));

    const textoNumeros = selectedNumbers.map(n => `#${String(n).padStart(3, '0')}`).join(', ');
    const totalPagar = (selectedNumbers.length * currentRifa.precoNumero).toFixed(2);
    
    const mensagemWhatsapp = encodeURIComponent(
      `🦁 *RIFA DO BLOCO BICHARADA - ${currentRifa.titulo.toUpperCase()}* 🪽\n\n` +
      `Oi ${currentRifa.nomeCoordenador}! Acabei de reservar meus bilhetes no app do bloco:\n\n` +
      `👤 *Nome:* ${nomeComprador.trim()}\n` +
      `📱 *WhatsApp:* ${whatsComprador.trim()}\n` +
      `🎟️ *Números Escolhidos:* ${textoNumeros}\n` +
      `💰 *Valor Total:* R$ ${totalPagar}\n\n` +
      `Estou enviando o comprovante do Pix em anexo logo abaixo!`
    );

    const telefone = currentRifa.telefoneContato || '5548999999999';
    const linkWhatsapp = `https://wa.me/${telefone}?text=${mensagemWhatsapp}`;

    confetti({
      particleCount: 50,
      spread: 70,
      colors: ['#00D287', '#E6007E', '#FBBF24']
    });

    window.open(linkWhatsapp, '_blank');

    setModalCheckout(false);
    setSelectedNumbers([]);
    setNomeComprador('');
    setWhatsComprador('');
  };

  /**
   * Alterna status do bilhete (Apenas Coordenação com PIN ativo).
   */
  const alternarStatusCoord = (num: number) => {
    if (!isAdmin) return;
    setVendas(prev => prev.map(b => {
      if (b.rifaId === currentRifa.id && b.numero === num) {
        const prox = b.status === 'Disponível' ? 'Reservado' : b.status === 'Reservado' ? 'Pago' : 'Disponível';
        return { ...b, status: prox };
      }
      return b;
    }));
  };

  /**
   * Atualiza a quantidade de prêmios e ajusta o array de descritivos.
   */
  const handleAlterarQuantidadePremios = (qtd: number) => {
    const qtdAjustada = Math.max(1, qtd);
    setFormNumeroPremios(qtdAjustada);
    setFormDescritivosPremios(prev => {
      const novo = [...prev];
      while (novo.length < qtdAjustada) novo.push('');
      return novo.slice(0, qtdAjustada);
    });
  };

  /**
   * Adiciona dinamicamente mais um prêmio à rifa que está sendo criada.
   */
  const handleAdicionarMaisUmPremio = () => {
    setFormDescritivosPremios(prev => [...prev, '']);
    setFormNumeroPremios(prev => prev + 1);
  };

  /**
   * Remove um prêmio específico da lista de prêmios.
   */
  const handleRemoverPremio = (index: number) => {
    if (formDescritivosPremios.length <= 1) return;
    setFormDescritivosPremios(prev => prev.filter((_, idx) => idx !== index));
    setFormNumeroPremios(prev => Math.max(1, prev - 1));
  };

  /**
   * Salva a criação de uma nova rifa pelo administrador.
   */
  const handleCriarNovaRifa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim() || !formCoordenador.trim() || !formDataLimite) return;

    const premios: PremioRifa[] = formDescritivosPremios.map((desc, idx) => ({
      posicao: idx + 1,
      descricao: desc.trim() || `${idx + 1}º Prêmio a definir`
    }));

    const novaRifa = criarNovaRifa({
      titulo: formTitulo.trim(),
      nomeCoordenador: formCoordenador.trim(),
      quantidadeNumeros: Number(formQuantidade) || 100,
      precoNumero: Number(formPreco) || 10,
      dataLimite: formDataLimite,
      premios
    });

    // Gera os bilhetes na tabela fato de vendas
    const novasVendas = gerarVendasIniciaisParaRifa(novaRifa);

    setRifas(prev => [novaRifa, ...prev]);
    setVendas(prev => [...novasVendas, ...prev]);
    setActiveRifaId(novaRifa.id);
    setModalCriarRifa(false);

    // Reset formulário
    setFormTitulo('');
    setFormDataLimite('');

    confetti({
      particleCount: 60,
      spread: 80,
      colors: ['#00D287', '#E6007E', '#FBBF24']
    });
  };

  // Faixa de números para paginação (100 por faixa)
  const inicioFaixa = (faixaAtiva - 1) * 100 + 1;
  const fimFaixa = Math.min(faixaAtiva * 100, currentRifa.quantidadeNumeros);
  const totalFaixas = Math.ceil(currentRifa.quantidadeNumeros / 100);

  const bilhetesExibidos = vendasDaRifa.filter(b => {
    if (buscaNumero.trim()) {
      return String(b.numero).includes(buscaNumero.trim());
    }
    const naFaixa = b.numero >= inicioFaixa && b.numero <= fimFaixa;
    const noStatus = filtroStatus === 'Todos' || b.status === filtroStatus;
    return naFaixa && noStatus;
  });

  return (
    <div className="space-y-4">
      {/* Barra de Seleção de Rifa e Botão Admin Criar Rifa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border-2 border-[#1E1B2E] p-3 shadow-[2px_2px_0px_#1E1B2E]">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="font-mono text-xs font-black uppercase text-[#1E1B2E] shrink-0">Rifa Ativa:</span>
          {rifas.map(r => (
            <button
              key={r.id}
              onClick={() => {
                setActiveRifaId(r.id);
                setSelectedNumbers([]);
                setFaixaAtiva(1);
              }}
              className={`px-3 py-1 border-2 border-[#1E1B2E] text-xs font-mono font-black uppercase transition-all whitespace-nowrap ${
                activeRifaId === r.id
                  ? 'bg-[#E6007E] text-white shadow-[2px_2px_0px_#1E1B2E]'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
              }`}
            >
              {r.titulo}
            </button>
          ))}
        </div>

        {/* Botão exclusivo de Administrador */}
        {isAdmin && (
          <button
            onClick={() => setModalCriarRifa(true)}
            className="vintage-button px-3.5 py-1.5 bg-[#00D287] text-[#1E1B2E] hover:bg-[#34EEA0] text-xs font-black uppercase flex items-center gap-1.5 shrink-0 shadow-[2px_2px_0px_#1E1B2E]"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Rifa</span>
          </button>
        )}
      </div>

      {/* Alerta de Vendas Encerradas caso passe de 1 dia da data limite */}
      {vendasEncerradas && (
        <div className="p-3 bg-red-100 border-2 border-red-600 text-red-900 text-xs font-mono flex items-center gap-2 shadow-[2px_2px_0px_#DC2626]">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <strong>Vendas Encerradas!</strong> A data limite desta rifa era {currentRifa.dataLimite}. A regra oficial do bloco veda vendas após 1 dia da data limite.
          </div>
        </div>
      )}

      {/* Banner da Rifa com as Informações Estruturadas */}
      <div className="vintage-card p-5 border-l-8 border-[#00D287]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`stamp text-xs ${vendasEncerradas ? 'stamp-urgent' : 'stamp-open'}`}>
                {vendasEncerradas ? 'Vendas Encerradas' : 'Venda 100% Online'}
              </span>
              <span className="font-mono text-xs font-bold text-stone-600">
                Coordenação: {currentRifa.nomeCoordenador}
              </span>
              <span className="font-mono text-xs text-stone-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#E6007E]" />
                Limite: <strong>{currentRifa.dataLimite}</strong> (tolerância: +1 dia)
              </span>
            </div>
            <h2 className="text-2xl font-black uppercase text-[#1E1B2E] font-mono leading-tight">
              {currentRifa.titulo} 🎟️
            </h2>
            <p className="text-xs text-stone-700 mt-1 max-w-lg font-serif">
              Escolha seus números da sorte abaixo. Cada bilhete custa apenas <strong>R$ {currentRifa.precoNumero.toFixed(2).replace('.', ',')}</strong> e todo o dinheiro arrecadado banca as necessidades do nosso cortejo!
            </p>
          </div>

          {/* Card Pix */}
          <div className="bg-[#FAF5FF] border-2 border-[#581C87] p-3 shadow-[3px_3px_0px_#581C87] text-xs font-mono shrink-0">
            <span className="font-black text-[#581C87] block text-[10px] uppercase">Chave Pix Oficial:</span>
            <div className="flex items-center gap-2 mt-1">
              <code className="bg-white px-2 py-1 font-bold text-stone-900 border border-[#581C87]">
                {currentRifa.chavePix || 'apoio@bicharada.org'}
              </code>
              <button
                onClick={copiarPix}
                className="p-1 bg-[#581C87] text-[#FBBF24] hover:bg-[#431464] border border-black shadow-[1px_1px_0px_#000]"
                title="Copiar Pix"
              >
                {copiadoPix ? <Check className="w-3.5 h-3.5 text-[#00D287]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Termômetro da Rifa */}
        <div className="mt-4 pt-3 border-t-2 border-stone-200">
          <div className="flex items-center justify-between text-xs font-mono font-black mb-1">
            <span>Arrecadado: R$ {valorTotalArrecadado.toFixed(2).replace('.', ',')} ({totalPagos} pagos / {currentRifa.quantidadeNumeros} totais)</span>
            <span className="text-[#E6007E] font-black">{Math.round((valorTotalArrecadado / metaTotal) * 100) || 0}% da Meta</span>
          </div>

          <div className="w-full h-4 bg-white border-2 border-[#1E1B2E] shadow-[2px_2px_0px_#1E1B2E]">
            <div
              className="h-full bg-gradient-to-r from-[#FBBF24] via-[#E6007E] to-[#00D287] border-r border-[#1E1B2E] transition-all duration-700"
              style={{ width: `${Math.min(100, Math.round((valorTotalArrecadado / metaTotal) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Prêmios Oficiais da Rifa */}
      <div className="vintage-card p-4">
        <h3 className="font-black text-xs uppercase tracking-wider text-[#581C87] font-mono mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
          <span>Prêmios que Serão Sorteados ({currentRifa.premios.length} Prêmios):</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-serif">
          {currentRifa.premios.map((premio) => (
            <div
              key={premio.posicao}
              className={`p-2.5 border-2 text-[#1E1B2E] font-bold ${
                premio.posicao === 1
                  ? 'bg-[#FEFCE8] border-[#FBBF24] shadow-[2px_2px_0px_#FBBF24]'
                  : premio.posicao === 2
                  ? 'bg-[#FDF2F8] border-[#E6007E] shadow-[2px_2px_0px_#E6007E]'
                  : 'bg-[#ECFDF5] border-[#00D287] shadow-[2px_2px_0px_#00D287]'
              }`}
            >
              <span>{premio.posicao}º Prêmio: {premio.descricao}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navegação da Cartela de Bilhetes por Faixas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#1E1B2E] pb-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar font-mono text-xs">
          {Array.from({ length: totalFaixas }, (_, idx) => idx + 1).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFaixaAtiva(f);
                setBuscaNumero('');
              }}
              className={`px-3 py-1.5 border-2 border-[#1E1B2E] font-black uppercase shadow-[2px_2px_0px_#1E1B2E] transition-all ${
                faixaAtiva === f && !buscaNumero
                  ? 'bg-[#E6007E] text-white'
                  : 'bg-white text-stone-800 hover:bg-stone-100'
              }`}
            >
              {String((f - 1) * 100 + 1).padStart(3, '0')} - {String(Math.min(f * 100, currentRifa.quantidadeNumeros)).padStart(3, '0')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-48">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="number"
            placeholder="Buscar número..."
            value={buscaNumero}
            onChange={(e) => setBuscaNumero(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-white border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
          />
        </div>
      </div>

      {/* Legenda de Cores */}
      <div className="flex items-center gap-3 text-[11px] font-mono font-bold flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-3.5 h-3.5 bg-white border border-[#1E1B2E] inline-block shadow-[1px_1px_0px_#000]" /> Disponível ({totalDisponiveis})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3.5 h-3.5 bg-[#FBBF24] border border-[#1E1B2E] inline-block shadow-[1px_1px_0px_#000]" /> Reservado ({totalReservados})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3.5 h-3.5 bg-[#E6007E] border border-[#1E1B2E] inline-block shadow-[1px_1px_0px_#000]" /> Pago ({totalPagos})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3.5 h-3.5 bg-[#00D287] border border-[#1E1B2E] inline-block shadow-[1px_1px_0px_#000]" /> Selecionado ({selectedNumbers.length})
        </span>
        {isAdmin && (
          <span className="text-xs text-stone-500 italic ml-auto font-sans">
            (Dica Coord: clique duas vezes no número para alterar status)
          </span>
        )}
      </div>

      {/* Grade Interativa de Números */}
      <div className="vintage-card p-4">
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {bilhetesExibidos.map((bilhete) => {
            const isSelected = selectedNumbers.includes(bilhete.numero);
            const isPago = bilhete.status === 'Pago';
            const isReservado = bilhete.status === 'Reservado';

            return (
              <button
                key={bilhete.numero}
                onClick={() => toggleSelectNumber(bilhete.numero)}
                onDoubleClick={() => alternarStatusCoord(bilhete.numero)}
                disabled={isPago || (vendasEncerradas && !isAdmin)}
                className={`py-2 px-1 border-2 border-[#1E1B2E] text-xs font-mono font-black transition-all flex flex-col items-center justify-center relative ${
                  isSelected
                    ? 'bg-[#00D287] text-[#1E1B2E] shadow-[3px_3px_0px_#1E1B2E] scale-105 z-10'
                    : isPago
                    ? 'bg-[#FDF2F8] text-[#E6007E] border-[#E6007E] opacity-70 line-through cursor-not-allowed'
                    : isReservado
                    ? 'bg-[#FEFCE8] text-[#B45309] border-[#FBBF24] shadow-[2px_2px_0px_#FBBF24]'
                    : vendasEncerradas
                    ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                    : 'bg-white hover:bg-pink-50 text-[#1E1B2E] shadow-[2px_2px_0px_#1E1B2E] active:translate-x-0.5 active:translate-y-0.5'
                }`}
                title={
                  isPago ? `Bilhete #${bilhete.numero} pago por ${bilhete.compradorNome || 'Folião'}` :
                  isReservado ? `Bilhete #${bilhete.numero} reservado por ${bilhete.compradorNome || 'Folião'}` :
                  vendasEncerradas ? 'Vendas encerradas' :
                  `Clique para escolher o bilhete #${bilhete.numero}`
                }
              >
                <span>#{String(bilhete.numero).padStart(3, '0')}</span>
                {isPago && <span className="text-[8px] uppercase font-black text-[#E6007E]">Pago</span>}
                {isReservado && !isSelected && <span className="text-[8px] uppercase font-bold text-[#B45309]">Res.</span>}
                {isSelected && <span className="text-[8px] uppercase font-black">Quero</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Barra Flutuante de Checkout */}
      {selectedNumbers.length > 0 && !vendasEncerradas && (
        <div className="sticky bottom-4 z-40 bg-white border-4 border-[#1E1B2E] p-4 shadow-[6px_6px_0px_#1E1B2E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div>
            <span className="font-mono text-xs font-black uppercase text-[#E6007E] block">
              🎟️ {selectedNumbers.length} {selectedNumbers.length === 1 ? 'número selecionado' : 'números selecionados'}
            </span>
            <p className="font-black text-sm text-[#1E1B2E] font-mono">
              Total: R$ {(selectedNumbers.length * currentRifa.precoNumero).toFixed(2).replace('.', ',')}
              <span className="text-stone-500 text-xs font-normal ml-2">
                ({selectedNumbers.map(n => `#${String(n).padStart(3, '0')}`).join(', ')})
              </span>
            </p>
          </div>

          <button
            onClick={handleAbrirCheckout}
            className="vintage-button px-5 py-2.5 bg-[#00D287] text-[#1E1B2E] hover:bg-[#34EEA0] text-xs uppercase flex items-center gap-2 shadow-[3px_3px_0px_#1E1B2E]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Reservar & Pagar via Pix</span>
          </button>
        </div>
      )}

      {/* Modal de Finalização Pix */}
      {modalCheckout && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-md w-full shadow-[6px_6px_0px_#1E1B2E] max-h-[90vh] overflow-y-auto">
            <div className="stamp stamp-urgent text-xs mb-2">Checkout Rápido</div>
            <h3 className="text-lg font-black uppercase text-[#1E1B2E] font-mono">
              Finalizar Reserva da Rifa
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-3 font-serif">
              Insira seus dados para gerarmos a confirmação que será enviada direto no WhatsApp de {currentRifa.nomeCoordenador}.
            </p>

            <div className="bg-[#FAF5FF] border-2 border-[#581C87] p-3 shadow-[2px_2px_0px_#581C87] mb-3 text-xs font-mono space-y-1">
              <div className="flex justify-between font-bold">
                <span>Números Escolhidos:</span>
                <span className="text-[#E6007E]">
                  {selectedNumbers.map(n => `#${String(n).padStart(3, '0')}`).join(', ')}
                </span>
              </div>
              <div className="flex justify-between font-black text-sm pt-1 border-t border-purple-200">
                <span>Total a Pagar via Pix:</span>
                <span className="text-[#00A868]">
                  R$ {(selectedNumbers.length * currentRifa.precoNumero).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <div className="bg-[#FEFCE8] border-2 border-[#FBBF24] p-3 mb-4 text-xs font-mono text-center">
              <span className="font-bold block text-stone-600 text-[11px] mb-1">CHAVE PIX DO BLOCO:</span>
              <div className="flex items-center justify-center gap-2">
                <strong className="text-stone-900 bg-white px-2 py-0.5 border border-stone-300">
                  {currentRifa.chavePix || 'apoio@bicharada.org'}
                </strong>
                <button
                  type="button"
                  onClick={copiarPix}
                  className="px-2 py-1 bg-[#1E1B2E] text-white text-[11px] font-bold uppercase"
                >
                  {copiadoPix ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <form onSubmit={handleFinalizarReserva} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Seu Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mariana Silveira"
                  value={nomeComprador}
                  onChange={(e) => setNomeComprador(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Seu WhatsApp (com DDD) *</label>
                <input
                  type="tel"
                  required
                  placeholder="(48) 99999-9999"
                  value={whatsComprador}
                  onChange={(e) => setWhatsComprador(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalCheckout(false)}
                  className="px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-bold uppercase hover:bg-stone-200"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-2 bg-[#00D287] text-[#1E1B2E] text-xs uppercase flex items-center gap-1.5 shadow-[3px_3px_0px_#1E1B2E]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enviar Comprovante no WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Criação de Nova Rifa (Exclusivo Administrador) */}
      {modalCriarRifa && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-lg w-full shadow-[6px_6px_0px_#1E1B2E] max-h-[90vh] overflow-y-auto">
            <div className="stamp stamp-urgent text-xs mb-2">Painel da Coordenação</div>
            <h3 className="text-lg font-black uppercase text-[#1E1B2E] font-mono">
              Criar Nova Rifa Oficial
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 font-serif">
              Preencha os parâmetros da rifa. As tabelas de rifas e vendas serão geradas automaticamente.
            </p>

            <form onSubmit={handleCriarNovaRifa} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Título da Rifa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rifa Solidária da Bateria 2027"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Nome do Coordenador *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Regina"
                    value={formCoordenador}
                    onChange={(e) => setFormCoordenador(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Data Limite de Venda *</label>
                  <input
                    type="date"
                    required
                    value={formDataLimite}
                    onChange={(e) => setFormDataLimite(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                  />
                  <span className="text-[10px] text-stone-500 font-serif">Vendas bloqueadas após 1 dia da data.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Quantidade de Números *</label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={1000}
                    step={10}
                    value={formQuantidade}
                    onChange={(e) => setFormQuantidade(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1E1B2E] mb-1">Preço de Cada Número (R$) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    step={0.5}
                    value={formPreco}
                    onChange={(e) => setFormPreco(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Gestão e Descritivo de Prêmios Dinâmicos */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase text-[#581C87] block">
                    Prêmios da Rifa ({formDescritivosPremios.length} cadastrados):
                  </span>
                  <button
                    type="button"
                    onClick={handleAdicionarMaisUmPremio}
                    className="px-2.5 py-1 bg-[#00D287] hover:bg-[#34EEA0] text-[#1E1B2E] border-2 border-[#1E1B2E] text-[10px] font-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_#000] cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Adicionar Prêmio</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-1">
                  {formDescritivosPremios.map((desc, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold w-18 shrink-0">{idx + 1}º Prêmio:</span>
                      <input
                        type="text"
                        required
                        placeholder={`Descreva o ${idx + 1}º prêmio...`}
                        value={desc}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormDescritivosPremios(prev => {
                            const novo = [...prev];
                            novo[idx] = val;
                            return novo;
                          });
                        }}
                        className="flex-1 px-3 py-1.5 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
                      />
                      {formDescritivosPremios.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoverPremio(idx)}
                          className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 border border-stone-300 transition-colors cursor-pointer"
                          title="Remover este prêmio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setModalCriarRifa(false)}
                  className="px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-bold uppercase hover:bg-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vintage-button px-4 py-2 bg-[#00D287] text-[#1E1B2E] text-xs font-black uppercase shadow-[3px_3px_0px_#1E1B2E]"
                >
                  Publicar Rifa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
