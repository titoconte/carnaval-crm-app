'use client';

import React, { useState } from 'react';
import {
  UserPlus,
  CheckCircle2,
  Heart,
  Users,
  Check,
  X,
  MessageSquare,
  Search,
  ExternalLink,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Integrante,
  InscritoBloco,
  atualizarStatusInscrito,
  gerarLinkWhatsappInscricao,
  gerarMensagemWhatsappInscricao
} from '../data/blocoData';

interface JoinFormProps {
  inscritos: InscritoBloco[];
  setInscritos: React.Dispatch<React.SetStateAction<InscritoBloco[]>>;
  onAddIntegrante: (novo: Integrante) => void;
  isAdmin?: boolean;
}

/**
 * Gestor Completo de Inscrições do Bloco Bicharada.
 * Contém duas seções: Formulário de Inscrição pública e Tabela de Gestão de Aceite/Recusa
 * com acionamento direto de mensagens no WhatsApp do folião.
 */
export default function JoinForm({
  inscritos,
  setInscritos,
  onAddIntegrante,
  isAdmin = false
}: JoinFormProps) {
  // Controle de sub-aba: Formulário ou Gestão
  const [subTab, setSubTab] = useState<'formulario' | 'inscritos'>('formulario');

  // Estados do Formulário
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [grandeGrupo, setGrandeGrupo] = useState<Integrante['grandeGrupo']>('Bateria');
  const [instrumentoOuFuncao, setInstrumentoOuFuncao] = useState('Caixa');
  const [experiencia, setExperiencia] = useState('Já toco o instrumento com facilidade');
  const [observacao, setObservacao] = useState('');
  const [enviado, setEnviado] = useState(false);

  // Estados da Tabela de Gestão
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | 'Pendente' | 'Aprovado' | 'Recusado'>('Todos');
  const [modalDisparo, setModalDisparo] = useState<InscritoBloco | null>(null);

  /**
   * Trata o envio do formulário de inscrição, registrando o novo candidato com status Pendente.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !whatsapp.trim()) return;

    const dataAtual = new Date().toISOString().split('T')[0];

    const novoInscrito: InscritoBloco = {
      id: `insc-${Date.now()}`,
      nome: nome.trim(),
      whatsapp: whatsapp.trim(),
      grandeGrupo,
      instrumentoOuFuncao: instrumentoOuFuncao.trim() || 'Apoio Geral',
      experiencia,
      observacao: observacao.trim() || undefined,
      dataInscricao: dataAtual,
      status: 'Pendente'
    };

    setInscritos(prev => [novoInscrito, ...prev]);
    setEnviado(true);

    confetti({
      particleCount: 50,
      spread: 70,
      colors: ['#E6007E', '#00A868', '#FBBF24']
    });
  };

  /**
   * Altera a decisão de aceite ou recusa do candidato e, em caso de aprovação, adiciona ao elenco oficial.
   */
  const handleDecisao = (inscrito: InscritoBloco, novoStatus: 'Aprovado' | 'Recusado') => {
    const atualizados = atualizarStatusInscrito(inscritos, inscrito.id, novoStatus);
    setInscritos(atualizados);

    // Se aprovado, insere no elenco oficial
    if (novoStatus === 'Aprovado') {
      const novoIntegrante: Integrante = {
        id: `int-${inscrito.id}`,
        nome: inscrito.nome,
        grandeGrupo: inscrito.grandeGrupo,
        instrumentoOuFuncao: inscrito.instrumentoOuFuncao,
        observacao: `Aprovado pelo edital | Whats: ${inscrito.whatsapp}`,
        ativo: true
      };
      onAddIntegrante(novoIntegrante);

      confetti({
        particleCount: 40,
        spread: 60,
        colors: ['#00D287', '#E6007E']
      });
    }
  };

  /**
   * Abre o WhatsApp direto no celular/navegador com a mensagem pronta de aceite ou recusa.
   */
  const dispararMensagemWhatsapp = (inscrito: InscritoBloco, decisao: 'Aprovado' | 'Recusado') => {
    const url = gerarLinkWhatsappInscricao(inscrito, decisao);
    window.open(url, '_blank');
    setModalDisparo(null);
  };

  // Contadores para os badges das abas
  const pendentesCount = inscritos.filter(i => i.status === 'Pendente').length;
  const aprovadosCount = inscritos.filter(i => i.status === 'Aprovado').length;

  // Filtragem da tabela
  const inscritosFiltrados = inscritos.filter(i => {
    const matchStatus = filtroStatus === 'Todos' || i.status === filtroStatus;
    const matchBusca = i.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       i.instrumentoOuFuncao.toLowerCase().includes(busca.toLowerCase()) ||
                       i.whatsapp.includes(busca);
    return matchStatus && matchBusca;
  });

  return (
    <div className="space-y-4">
      {/* Navegação entre as duas partes: Formulário vs Tabela de Gestão */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-[#1E1B2E] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('formulario')}
            className={`px-4 py-2 border-2 border-[#1E1B2E] text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#1E1B2E] flex items-center gap-1.5 ${
              subTab === 'formulario'
                ? 'bg-[#E6007E] text-white'
                : 'bg-white text-[#1E1B2E] hover:bg-pink-50'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Formulário de Inscrição</span>
          </button>

          <button
            onClick={() => setSubTab('inscritos')}
            className={`px-4 py-2 border-2 border-[#1E1B2E] text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#1E1B2E] flex items-center gap-1.5 ${
              subTab === 'inscritos'
                ? 'bg-[#00D287] text-[#1E1B2E]'
                : 'bg-white text-[#1E1B2E] hover:bg-emerald-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Inscritos & Gestão</span>
            {pendentesCount > 0 && (
              <span className="px-1.5 py-0.2 bg-[#E6007E] text-white text-[9px] font-mono border border-black shadow-[1px_1px_0px_#000]">
                {pendentesCount} pendentes
              </span>
            )}
          </button>
        </div>
      </div>

      {/* PARTE 1: FORMULÁRIO DE INSCRIÇÃO */}
      {subTab === 'formulario' && (
        <div className="max-w-lg mx-auto vintage-card p-6 sm:p-8">
          <div className="text-center mb-6">
            <span className="stamp stamp-open text-xs mb-2">Edital Aberto 2027</span>
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
              <h3 className="font-black text-base uppercase text-[#1A181B] font-mono">Ficha Enviada com Sucesso!</h3>
              <p className="text-xs text-stone-800 font-serif">
                Obrigado, <strong>{nome}</strong>! Sua solicitação para <strong>{grandeGrupo} ({instrumentoOuFuncao})</strong> foi registrada e será avaliada pela coordenação. Você receberá um aviso no seu WhatsApp!
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setEnviado(false)}
                  className="px-3 py-1.5 border-2 border-[#1A181B] bg-white text-[#1A181B] text-xs font-bold uppercase hover:bg-stone-100"
                >
                  Nova Ficha
                </button>
                <button
                  onClick={() => setSubTab('inscritos')}
                  className="vintage-button px-4 py-1.5 bg-[#00D287] text-[#1E1B2E] text-xs uppercase"
                >
                  Ver Painel de Inscritos
                </button>
              </div>
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
      )}

      {/* PARTE 2: TABELA DE GESTÃO DE INSCRITOS */}
      {subTab === 'inscritos' && (
        <div className="space-y-3">
          {/* Barra de Filtros e Busca */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border-2 border-[#1E1B2E] p-3 shadow-[2px_2px_0px_#1E1B2E]">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(['Todos', 'Pendente', 'Aprovado', 'Recusado'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFiltroStatus(st)}
                  className={`px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-mono font-black uppercase transition-all ${
                    filtroStatus === st
                      ? 'bg-[#581C87] text-[#FBBF24] shadow-[2px_2px_0px_#1E1B2E]'
                      : 'bg-white text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  {st} ({st === 'Todos' ? inscritos.length : inscritos.filter(i => i.status === st).length})
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar por nome, função ou whats..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-stone-50 border-2 border-[#1E1B2E] text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Tabela de Candidatos */}
          <div className="vintage-card p-4 overflow-x-auto">
            {inscritosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-stone-500 font-mono text-xs">
                Nenhum inscrito encontrado com os filtros selecionados.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b-2 border-[#1E1B2E] bg-stone-100">
                    <th className="p-2 font-black uppercase">Candidato</th>
                    <th className="p-2 font-black uppercase">WhatsApp</th>
                    <th className="p-2 font-black uppercase">Naipe / Função</th>
                    <th className="p-2 font-black uppercase">Experiência & Obs</th>
                    <th className="p-2 font-black uppercase">Data</th>
                    <th className="p-2 font-black uppercase">Status</th>
                    <th className="p-2 font-black uppercase text-center">Gestão & Notificação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {inscritosFiltrados.map((inscrito) => (
                    <tr key={inscrito.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-2 font-bold text-stone-900 whitespace-nowrap">
                        {inscrito.nome}
                      </td>
                      <td className="p-2 text-stone-700 whitespace-nowrap">
                        {inscrito.whatsapp}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <span className="font-bold text-[#581C87]">{inscrito.grandeGrupo}</span>
                        <span className="text-stone-500 block text-[11px]">{inscrito.instrumentoOuFuncao}</span>
                      </td>
                      <td className="p-2 max-w-xs text-[11px] text-stone-600">
                        <span className="font-bold block text-stone-800">{inscrito.experiencia}</span>
                        {inscrito.observacao && <span className="italic">{inscrito.observacao}</span>}
                      </td>
                      <td className="p-2 text-stone-500 text-[11px] whitespace-nowrap">
                        {inscrito.dataInscricao}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <span className={`px-2 py-0.5 border text-[10px] font-black uppercase shadow-[1px_1px_0px_#000] ${
                          inscrito.status === 'Aprovado'
                            ? 'bg-[#00D287] text-[#1E1B2E] border-black'
                            : inscrito.status === 'Recusado'
                            ? 'bg-red-200 text-red-900 border-red-700'
                            : 'bg-[#FBBF24] text-[#1E1B2E] border-black'
                        }`}>
                          {inscrito.status}
                        </span>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Botão Aprovar */}
                          <button
                            onClick={() => handleDecisao(inscrito, 'Aprovado')}
                            className={`p-1.5 border border-black shadow-[1px_1px_0px_#000] text-xs transition-all ${
                              inscrito.status === 'Aprovado'
                                ? 'bg-[#00D287] text-[#1E1B2E]'
                                : 'bg-white hover:bg-emerald-100 text-stone-700'
                            }`}
                            title="Aprovar inscrição e inserir no elenco"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          {/* Botão Recusar */}
                          <button
                            onClick={() => handleDecisao(inscrito, 'Recusado')}
                            className={`p-1.5 border border-black shadow-[1px_1px_0px_#000] text-xs transition-all ${
                              inscrito.status === 'Recusado'
                                ? 'bg-red-400 text-white'
                                : 'bg-white hover:bg-red-100 text-stone-700'
                            }`}
                            title="Recusar inscrição"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          {/* Botão Enviar Mensagem via Celular / WhatsApp */}
                          <button
                            onClick={() => setModalDisparo(inscrito)}
                            className="px-2 py-1 bg-[#25D366] text-white hover:bg-[#1EBE5D] border border-black shadow-[1px_1px_0px_#000] text-[10px] font-bold uppercase flex items-center gap-1"
                            title="Enviar mensagem do celular informando aceite ou recusa"
                          >
                            <MessageSquare className="w-3 h-3 fill-current" />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modal de Disparo de Mensagem WhatsApp para o Inscrito */}
      {modalDisparo && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1E1B2E] p-6 max-w-md w-full shadow-[6px_6px_0px_#1E1B2E]">
            <div className="stamp stamp-urgent text-xs mb-2">Comunicação Oficial</div>
            <h3 className="text-base font-black uppercase text-[#1E1B2E] font-mono">
              Notificar {modalDisparo.nome}
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-3 font-serif">
              Clique para abrir o WhatsApp no seu aparelho com a mensagem oficial já pronta para envio para o número <strong>{modalDisparo.whatsapp}</strong>.
            </p>

            <div className="space-y-2 pt-2 border-t border-stone-200">
              <button
                onClick={() => dispararMensagemWhatsapp(modalDisparo, 'Aprovado')}
                className="w-full p-3 bg-[#ECFDF5] hover:bg-[#D1FAE5] border-2 border-[#00D287] text-left text-xs font-mono shadow-[2px_2px_0px_#00D287] flex items-center justify-between"
              >
                <div>
                  <span className="font-black text-[#00A868] uppercase block">🎉 Enviar Mensagem de Aprovação</span>
                  <span className="text-[11px] text-stone-600">Parabeniza o candidato e confirma sua vaga na bateria/ala.</span>
                </div>
                <ExternalLink className="w-4 h-4 text-[#00A868] shrink-0 ml-2" />
              </button>

              <button
                onClick={() => dispararMensagemWhatsapp(modalDisparo, 'Recusado')}
                className="w-full p-3 bg-[#FEF2F2] hover:bg-[#FEE2E2] border-2 border-red-500 text-left text-xs font-mono shadow-[2px_2px_0px_#EF4444] flex items-center justify-between"
              >
                <div>
                  <span className="font-black text-red-600 uppercase block">💬 Enviar Mensagem de Recusa / Fila de Espera</span>
                  <span className="text-[11px] text-stone-600">Agradece o carinho e informa vagas completas no momento.</span>
                </div>
                <ExternalLink className="w-4 h-4 text-red-600 shrink-0 ml-2" />
              </button>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setModalDisparo(null)}
                className="px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-bold uppercase hover:bg-stone-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
