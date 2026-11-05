'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navigation, { TabId } from '../components/Navigation';
import RepertoireVoting from '../components/RepertoireVoting';
import LyricsAndChords from '../components/LyricsAndChords';
import TasksManager from '../components/TasksManager';
import RosterView from '../components/RosterView';
import WhatsAppPolls from '../components/WhatsAppPolls';
import BarManager from '../components/BarManager';
import RaffleApp from '../components/RaffleApp';
import ParadeKanban from '../components/ParadeKanban';
import CalendarView from '../components/CalendarView';
import JoinForm from '../components/JoinForm';
import DocumentsManager from '../components/DocumentsManager';
import MediaManager from '../components/MediaManager';
import AdminPinModal from '../components/AdminPinModal';

import {
  INTEGRANTES_INICIAIS,
  TAREFAS_POSTIT_INICIAIS,
  MACROTAREFAS_DESFILE_INICIAIS,
  MOVIMENTOS_BAR_INICIAIS,
  gerarBilhetesRifaIniciais,
  RIFAS_INICIAIS,
  VENDAS_RIFAS_INICIAIS,
  INSCRITOS_INICIAIS,
  REPERTORIO_INICIAL,
  LETRAS_CIFRAS_INICIAIS,
  ENQUETES_WHATSAPP_INICIAIS,
  CALENDARIO_INICIAL,
  DOCUMENTOS_INICIAIS,
  CORES_PALETA_INICIAIS,
  ARTES_MIDIA_INICIAIS,
  POSTS_INSTAGRAM_INICIAIS,
  CONFIG_INSTAGRAM_INICIAL,
  TEMA_ANO_INICIAL,
  converterTarefaEmMacrotarefa,
  Integrante,
  InscritoBloco,
  TarefaPostIt,
  MacrotarefaDesfile,
  MovimentoBar,
  BilheteRifa,
  Rifa,
  RifaVenda,
  MusicaRepertorio,
  ItemLetraCifra,
  EnqueteWhatsApp,
  EventoCalendario,
  DocumentoBloco,
  CorPaletaAnual,
  ArquivoArteMidia,
  PostInstagramPlanejado,
  ConfiguracaoInstagram,
  TemaAnoBloco
} from '../data/blocoData';

/**
 * Aplicação Oficial do Bloco Bicharada / Bixarada Floripa 2027.
 * Estilo Fanzine Vintage, Lambe-lambe e Quadro de Cortiça.
 */
export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('repertorio');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Estados principais da aplicação
  const [integrantes, setIntegrantes] = useState<Integrante[]>(INTEGRANTES_INICIAIS);
  const [tarefas, setTarefas] = useState<TarefaPostIt[]>(TAREFAS_POSTIT_INICIAIS);
  const [macrotarefas, setMacrotarefas] = useState<MacrotarefaDesfile[]>(MACROTAREFAS_DESFILE_INICIAIS);
  const [movimentosBar, setMovimentosBar] = useState<MovimentoBar[]>(MOVIMENTOS_BAR_INICIAIS);
  const [bilhetesRifa, setBilhetesRifa] = useState<BilheteRifa[]>(gerarBilhetesRifaIniciais());
  const [rifas, setRifas] = useState<Rifa[]>(RIFAS_INICIAIS);
  const [vendasRifas, setVendasRifas] = useState<RifaVenda[]>(VENDAS_RIFAS_INICIAIS);
  const [inscritos, setInscritos] = useState<InscritoBloco[]>(INSCRITOS_INICIAIS);
  const [musicas, setMusicas] = useState<MusicaRepertorio[]>(REPERTORIO_INICIAL);
  const [letrasCifras, setLetrasCifras] = useState<ItemLetraCifra[]>(LETRAS_CIFRAS_INICIAIS);
  const [enquetes, setEnquetes] = useState<EnqueteWhatsApp[]>(ENQUETES_WHATSAPP_INICIAIS);
  const [eventos] = useState<EventoCalendario[]>(CALENDARIO_INICIAL);
  const [documentos, setDocumentos] = useState<DocumentoBloco[]>(DOCUMENTOS_INICIAIS);
  const [cores, setCores] = useState<CorPaletaAnual[]>(CORES_PALETA_INICIAIS);
  const [artes, setArtes] = useState<ArquivoArteMidia[]>(ARTES_MIDIA_INICIAIS);
  const [postsInstagram, setPostsInstagram] = useState<PostInstagramPlanejado[]>(POSTS_INSTAGRAM_INICIAIS);
  const [configInstagram, setConfigInstagram] = useState<ConfiguracaoInstagram>(CONFIG_INSTAGRAM_INICIAL);
  const [temaAno, setTemaAno] = useState<TemaAnoBloco>(TEMA_ANO_INICIAL);

  // Carrega dados salvos no LocalStorage
  useEffect(() => {
    try {
      const sTarefas = localStorage.getItem('bicha_tarefas_v2');
      if (sTarefas) setTarefas(JSON.parse(sTarefas));

      const sMacros = localStorage.getItem('bicha_macros_v2');
      if (sMacros) setMacrotarefas(JSON.parse(sMacros));

      const sBar = localStorage.getItem('bicha_bar_v2');
      if (sBar) setMovimentosBar(JSON.parse(sBar));

      const sRifa = localStorage.getItem('bicha_rifa_v2');
      if (sRifa) setBilhetesRifa(JSON.parse(sRifa));

      const sRifasTab = localStorage.getItem('bicha_rifas_tab_v3');
      if (sRifasTab) setRifas(JSON.parse(sRifasTab));

      const sVendasRifas = localStorage.getItem('bicha_rifas_vendas_v3');
      if (sVendasRifas) setVendasRifas(JSON.parse(sVendasRifas));

      const sInscritos = localStorage.getItem('bicha_inscritos_v2');
      if (sInscritos) setInscritos(JSON.parse(sInscritos));

      const sIntegrantes = localStorage.getItem('bicha_integrantes_v2');
      if (sIntegrantes) setIntegrantes(JSON.parse(sIntegrantes));

      const sMusicas = localStorage.getItem('bicha_musicas_v2');
      if (sMusicas) setMusicas(JSON.parse(sMusicas));

      const sLetras = localStorage.getItem('bicha_letras_v2');
      if (sLetras) setLetrasCifras(JSON.parse(sLetras));

      const sEnquetes = localStorage.getItem('bicha_enquetes_v2');
      if (sEnquetes) setEnquetes(JSON.parse(sEnquetes));

      const sDocs = localStorage.getItem('bicha_documentos_v2');
      if (sDocs) setDocumentos(JSON.parse(sDocs));

      const sCores = localStorage.getItem('bicha_midia_cores_v1');
      if (sCores) setCores(JSON.parse(sCores));

      const sArtes = localStorage.getItem('bicha_midia_artes_v1');
      if (sArtes) setArtes(JSON.parse(sArtes));

      const sPostsIg = localStorage.getItem('bicha_midia_posts_v1');
      if (sPostsIg) setPostsInstagram(JSON.parse(sPostsIg));

      const sConfigIg = localStorage.getItem('bicha_midia_config_ig_v1');
      if (sConfigIg) setConfigInstagram(JSON.parse(sConfigIg));

      const sTema = localStorage.getItem('bicha_tema_ano_v1');
      if (sTema) setTemaAno(JSON.parse(sTema));
    } catch (e) {
      console.error('Erro ao ler LocalStorage:', e);
    }
  }, []);

  // Salva no LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('bicha_tarefas_v2', JSON.stringify(tarefas));
      localStorage.setItem('bicha_macros_v2', JSON.stringify(macrotarefas));
      localStorage.setItem('bicha_bar_v2', JSON.stringify(movimentosBar));
      localStorage.setItem('bicha_rifa_v2', JSON.stringify(bilhetesRifa));
      localStorage.setItem('bicha_rifas_tab_v3', JSON.stringify(rifas));
      localStorage.setItem('bicha_rifas_vendas_v3', JSON.stringify(vendasRifas));
      localStorage.setItem('bicha_inscritos_v2', JSON.stringify(inscritos));
      localStorage.setItem('bicha_integrantes_v2', JSON.stringify(integrantes));
      localStorage.setItem('bicha_musicas_v2', JSON.stringify(musicas));
      localStorage.setItem('bicha_letras_v2', JSON.stringify(letrasCifras));
      localStorage.setItem('bicha_enquetes_v2', JSON.stringify(enquetes));
      localStorage.setItem('bicha_documentos_v2', JSON.stringify(documentos));
      localStorage.setItem('bicha_midia_cores_v1', JSON.stringify(cores));
      localStorage.setItem('bicha_midia_artes_v1', JSON.stringify(artes));
      localStorage.setItem('bicha_midia_posts_v1', JSON.stringify(postsInstagram));
      localStorage.setItem('bicha_midia_config_ig_v1', JSON.stringify(configInstagram));
      localStorage.setItem('bicha_tema_ano_v1', JSON.stringify(temaAno));
    } catch (e) {
      console.error('Erro ao salvar LocalStorage:', e);
    }
  }, [tarefas, macrotarefas, movimentosBar, bilhetesRifa, rifas, vendasRifas, inscritos, integrantes, musicas, letrasCifras, enquetes, documentos, cores, artes, postsInstagram, configInstagram, temaAno]);

  // Contagem de tarefas órfãs
  const orfasCount = tarefas.filter(
    t => (!t.responsavel || t.responsavel.trim() === '' || t.responsavel.toLowerCase().includes('definir')) && !t.concluida
  ).length;

  const handleAddIntegrante = (novo: Integrante) => {
    setIntegrantes(prev => [novo, ...prev]);
  };

  /**
   * Promove uma tarefa do mural para a aba de Tarefas em Andamento (Desfile) ao acionar Equipe Pronta.
   */
  const handlePromoverTarefaParaDesfile = (tarefa: TarefaPostIt) => {
    const novaMacro = converterTarefaEmMacrotarefa(tarefa);
    setMacrotarefas(prev => [novaMacro, ...prev]);
    setTarefas(prev => prev.filter(t => t.id !== tarefa.id));
    setActiveTab('desfile');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4EEDF] text-[#1A181B]">
      {/* Cabeçalho Vintage */}
      <Header
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        openAdminModal={() => setAdminModalOpen(true)}
        temaTitulo={temaAno.titulo}
      />

      {/* Menu Fanzine de Navegação */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        orfasCount={orfasCount}
      />

      {/* Área de Conteúdo da Aba Ativa */}
      <main id="conteudo-principal" className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 mb-16">
        {activeTab === 'repertorio' && (
          <RepertoireVoting
            musicas={musicas}
            setMusicas={setMusicas}
            isAdmin={isAdmin}
            onOpenLetras={() => setActiveTab('letras')}
          />
        )}

        {activeTab === 'letras' && (
          <LyricsAndChords
            items={letrasCifras}
            setItems={setLetrasCifras}
            isAdmin={isAdmin}
            onBackToRepertorio={() => setActiveTab('repertorio')}
          />
        )}

        {activeTab === 'tarefas' && (
          <TasksManager
            tarefas={tarefas}
            setTarefas={setTarefas}
            isAdmin={isAdmin}
            onEquipePronta={handlePromoverTarefaParaDesfile}
          />
        )}

        {activeTab === 'elenco' && (
          <RosterView
            integrantes={integrantes}
            setIntegrantes={setIntegrantes}
          />
        )}

        {activeTab === 'enquetes' && (
          <WhatsAppPolls
            enquetes={enquetes}
            setEnquetes={setEnquetes}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'bar' && (
          <BarManager
            movimentos={movimentosBar}
            setMovimentos={setMovimentosBar}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'rifa' && (
          <RaffleApp
            rifas={rifas}
            setRifas={setRifas}
            vendas={vendasRifas}
            setVendas={setVendasRifas}
            bilhetes={bilhetesRifa}
            setBilhetes={setBilhetesRifa}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'desfile' && (
          <ParadeKanban
            macrotarefas={macrotarefas}
            setMacrotarefas={setMacrotarefas}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'calendario' && (
          <CalendarView eventos={eventos} />
        )}

        {activeTab === 'inscricao' && (
          <JoinForm
            inscritos={inscritos}
            setInscritos={setInscritos}
            onAddIntegrante={handleAddIntegrante}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'documentos' && (
          <DocumentsManager
            documentos={documentos}
            setDocumentos={setDocumentos}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'midia' && (
          <MediaManager
            cores={cores}
            setCores={setCores}
            artes={artes}
            setArtes={setArtes}
            postsInstagram={postsInstagram}
            setPostsInstagram={setPostsInstagram}
            configInstagram={configInstagram}
            setConfigInstagram={setConfigInstagram}
            temaAno={temaAno}
            setTemaAno={setTemaAno}
            isAdmin={isAdmin}
          />
        )}
      </main>

      {/* Rodapé Estilo Gazeta / Fanzine */}
      <footer className="bg-[#1A181B] text-[#FAF6EC] py-6 px-4 text-center text-xs border-t-4 border-[#E6007E]">
        <p className="font-mono font-black uppercase text-sm">
          ★ BLOCO BICHARADA • {temaAno.titulo.toUpperCase()} {temaAno.ano} ★
        </p>
        <p className="mt-1 font-serif text-[11px] text-stone-400">
          Florianópolis / SC • Sistema Comunitário Aberto e 100% Gratuito na Vercel
        </p>
      </footer>

      {/* Modal de PIN da Coordenação */}
      <AdminPinModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onSuccess={() => setIsAdmin(true)}
      />
    </div>
  );
}
