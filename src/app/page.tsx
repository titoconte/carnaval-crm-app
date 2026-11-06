'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Navigation, { TabId } from '../components/Navigation';
import TasksManager from '../components/TasksManager';
import CalendarView from '../components/CalendarView';
import ParadeKanban from '../components/ParadeKanban';
import RepertoireVoting from '../components/RepertoireVoting';
import LyricsAndChords from '../components/LyricsAndChords';
import RaffleApp from '../components/RaffleApp';
import JoinForm from '../components/JoinForm';
import MediaManager from '../components/MediaManager';
import BarManager from '../components/BarManager';
import RosterView from '../components/RosterView';
import WhatsAppPolls from '../components/WhatsAppPolls';
import DocumentsManager from '../components/DocumentsManager';
import LoginModal from '../components/LoginModal';

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
  USUARIOS_INICIAIS,
  UsuarioBloco,
  PerfilUsuario,
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
 * 
 * Níveis de Acesso:
 * - Público (visitante anônimo): Visualiza 5 abas (Inscrições, Calendário, Rifas, Repertório, Documentos).
 * - Bicho (integrante): Visualiza as 11 abas completas com interações operacionais normais.
 * - Coordenador: Acesso total a todas as 11 abas, edição de datas, finanças e gestão de usuários.
 */
export default function Home() {
  // Usuários do sistema e Sessão de autenticação
  const [usuarios, setUsuarios] = useState<UsuarioBloco[]>(USUARIOS_INICIAIS);
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioBloco | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Perfil ativo derivado da sessão atual
  const perfilAtivo: PerfilUsuario = usuarioLogado ? usuarioLogado.perfil : 'publico';
  const isAdmin = perfilAtivo === 'coordenador';
  const isPublico = perfilAtivo === 'publico';

  // Aba ativa: inicia em 'inscricao' para o público e em 'tarefas' para membros
  const [activeTab, setActiveTab] = useState<TabId>('inscricao');

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
  const [eventos, setEventos] = useState<EventoCalendario[]>(CALENDARIO_INICIAL);
  const [documentos, setDocumentos] = useState<DocumentoBloco[]>(DOCUMENTOS_INICIAIS);
  const [cores, setCores] = useState<CorPaletaAnual[]>(CORES_PALETA_INICIAIS);
  const [artes, setArtes] = useState<ArquivoArteMidia[]>(ARTES_MIDIA_INICIAIS);
  const [postsInstagram, setPostsInstagram] = useState<PostInstagramPlanejado[]>(POSTS_INSTAGRAM_INICIAIS);
  const [configInstagram, setConfigInstagram] = useState<ConfiguracaoInstagram>(CONFIG_INSTAGRAM_INICIAL);
  const [temaAno, setTemaAno] = useState<TemaAnoBloco>(TEMA_ANO_INICIAL);

  // Estados de conexão e sincronização com Vercel Postgres / Neon
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [dbSyncing, setDbSyncing] = useState(false);
  const [dadosCarregadosDoBanco, setDadosCarregadosDoBanco] = useState(false);

  /**
   * Sincroniza os estados locais com o Vercel Postgres em tempo real,
   * garantindo cache desabilitado via URL com timestamp e cabeçalhos no-store.
   * 
   * @param silencioso - Se verdadeiro, executa sem piscar o indicador principal
   */
  const recarregarDadosDoServidor = useCallback(async (silencioso = false) => {
    if (!silencioso) setDbSyncing(true);
    try {
      const res = await fetch(`/api/db/sync?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      const data = await res.json();
      if (data.configured) {
        setDbConnected(true);
        const est = data.estados || {};
        if (est.usuarios && Array.isArray(est.usuarios) && est.usuarios.length > 0) {
          setUsuarios(est.usuarios);
        }
        if (est.tarefas && Array.isArray(est.tarefas)) setTarefas(est.tarefas);
        if (est.macrotarefas && Array.isArray(est.macrotarefas)) setMacrotarefas(est.macrotarefas);
        if (est.movimentosBar && Array.isArray(est.movimentosBar)) setMovimentosBar(est.movimentosBar);
        if (est.bilhetesRifa && Array.isArray(est.bilhetesRifa)) setBilhetesRifa(est.bilhetesRifa);
        if (est.rifas && Array.isArray(est.rifas)) setRifas(est.rifas);
        if (est.vendasRifas && Array.isArray(est.vendasRifas)) setVendasRifas(est.vendasRifas);
        if (est.inscritos && Array.isArray(est.inscritos)) setInscritos(est.inscritos);
        if (est.integrantes && Array.isArray(est.integrantes)) setIntegrantes(est.integrantes);
        if (est.musicas && Array.isArray(est.musicas)) setMusicas(est.musicas);
        if (est.letrasCifras && Array.isArray(est.letrasCifras)) setLetrasCifras(est.letrasCifras);
        if (est.enquetes && Array.isArray(est.enquetes)) setEnquetes(est.enquetes);
        if (est.eventos && Array.isArray(est.eventos)) setEventos(est.eventos);
        if (est.documentos && Array.isArray(est.documentos)) setDocumentos(est.documentos);
        if (est.cores && Array.isArray(est.cores)) setCores(est.cores);
        if (est.artes && Array.isArray(est.artes)) setArtes(est.artes);
        if (est.postsInstagram && Array.isArray(est.postsInstagram)) setPostsInstagram(est.postsInstagram);
        if (est.configInstagram) setConfigInstagram(est.configInstagram);
        if (est.temaAno) setTemaAno(est.temaAno);
      } else {
        setDbConnected(false);
      }
    } catch (err) {
      console.warn('Vercel Postgres indisponível. Operando via LocalStorage.', err);
      setDbConnected(false);
    } finally {
      setDadosCarregadosDoBanco(true);
      if (!silencioso) setDbSyncing(false);
    }
  }, []);

  // Carrega dados salvos no LocalStorage e sincroniza com o Vercel Postgres
  useEffect(() => {
    // 1. Carregamento inicial rápido via LocalStorage (offline-first)
    try {
      const sSessao = localStorage.getItem('bicha_sessao_usuario_v4');
      if (sSessao) {
        const u = JSON.parse(sSessao);
        setUsuarioLogado(u);
        setActiveTab('tarefas');
      }

      const sUsuarios = localStorage.getItem('bicha_usuarios_v4');
      if (sUsuarios) {
        const parsedUsers = JSON.parse(sUsuarios);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          setUsuarios(parsedUsers);
        }
      }

      const sTarefas = localStorage.getItem('bicha_tarefas_v4');
      if (sTarefas) setTarefas(JSON.parse(sTarefas));

      const sMacros = localStorage.getItem('bicha_macros_v4');
      if (sMacros) setMacrotarefas(JSON.parse(sMacros));

      const sBar = localStorage.getItem('bicha_bar_v4');
      if (sBar) setMovimentosBar(JSON.parse(sBar));

      const sRifa = localStorage.getItem('bicha_rifa_v4');
      if (sRifa) setBilhetesRifa(JSON.parse(sRifa));

      const sRifasTab = localStorage.getItem('bicha_rifas_tab_v4');
      if (sRifasTab) setRifas(JSON.parse(sRifasTab));

      const sVendasRifas = localStorage.getItem('bicha_rifas_vendas_v4');
      if (sVendasRifas) setVendasRifas(JSON.parse(sVendasRifas));

      const sInscritos = localStorage.getItem('bicha_inscritos_v4');
      if (sInscritos) setInscritos(JSON.parse(sInscritos));

      const sIntegrantes = localStorage.getItem('bicha_integrantes_v4');
      if (sIntegrantes) setIntegrantes(JSON.parse(sIntegrantes));

      const sMusicas = localStorage.getItem('bicha_musicas_v4');
      if (sMusicas) setMusicas(JSON.parse(sMusicas));

      const sLetras = localStorage.getItem('bicha_letras_v4');
      if (sLetras) setLetrasCifras(JSON.parse(sLetras));

      const sEnquetes = localStorage.getItem('bicha_enquetes_v4');
      if (sEnquetes) setEnquetes(JSON.parse(sEnquetes));

      const sEventos = localStorage.getItem('bicha_calendario_v4');
      if (sEventos) setEventos(JSON.parse(sEventos));

      const sDocs = localStorage.getItem('bicha_documentos_v4');
      if (sDocs) setDocumentos(JSON.parse(sDocs));

      const sCores = localStorage.getItem('bicha_midia_cores_v4');
      if (sCores) setCores(JSON.parse(sCores));

      const sArtes = localStorage.getItem('bicha_midia_artes_v4');
      if (sArtes) setArtes(JSON.parse(sArtes));

      const sPostsIg = localStorage.getItem('bicha_midia_posts_v4');
      if (sPostsIg) setPostsInstagram(JSON.parse(sPostsIg));

      const sConfigIg = localStorage.getItem('bicha_midia_config_ig_v4');
      if (sConfigIg) setConfigInstagram(JSON.parse(sConfigIg));

      const sTema = localStorage.getItem('bicha_tema_ano_v4');
      if (sTema) setTemaAno(JSON.parse(sTema));
    } catch (e) {
      console.error('Erro ao ler LocalStorage:', e);
    }

    // 2. Sincroniza com o Vercel Postgres caso ativo no backend
    recarregarDadosDoServidor(false);
  }, [recarregarDadosDoServidor]);

  // Atualiza automaticamente quando a janela ganha foco ou volta do segundo plano
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        recarregarDadosDoServidor(true);
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [recarregarDadosDoServidor]);

  // Salva no LocalStorage e envia atualização debounced ao Vercel Postgres
  useEffect(() => {
    try {
      localStorage.setItem('bicha_usuarios_v4', JSON.stringify(usuarios));
      localStorage.setItem('bicha_tarefas_v4', JSON.stringify(tarefas));
      localStorage.setItem('bicha_macros_v4', JSON.stringify(macrotarefas));
      localStorage.setItem('bicha_bar_v4', JSON.stringify(movimentosBar));
      localStorage.setItem('bicha_rifa_v4', JSON.stringify(bilhetesRifa));
      localStorage.setItem('bicha_rifas_tab_v4', JSON.stringify(rifas));
      localStorage.setItem('bicha_rifas_vendas_v4', JSON.stringify(vendasRifas));
      localStorage.setItem('bicha_inscritos_v4', JSON.stringify(inscritos));
      localStorage.setItem('bicha_integrantes_v4', JSON.stringify(integrantes));
      localStorage.setItem('bicha_musicas_v4', JSON.stringify(musicas));
      localStorage.setItem('bicha_letras_v4', JSON.stringify(letrasCifras));
      localStorage.setItem('bicha_enquetes_v4', JSON.stringify(enquetes));
      localStorage.setItem('bicha_calendario_v4', JSON.stringify(eventos));
      localStorage.setItem('bicha_documentos_v4', JSON.stringify(documentos));
      localStorage.setItem('bicha_midia_cores_v4', JSON.stringify(cores));
      localStorage.setItem('bicha_midia_artes_v4', JSON.stringify(artes));
      localStorage.setItem('bicha_midia_posts_v4', JSON.stringify(postsInstagram));
      localStorage.setItem('bicha_midia_config_ig_v4', JSON.stringify(configInstagram));
      localStorage.setItem('bicha_tema_ano_v4', JSON.stringify(temaAno));
    } catch (e) {
      console.error('Erro ao salvar LocalStorage:', e);
    }

    // Só envia para o banco após a leitura inicial ter completado e se o banco estiver ativo
    if (!dbConnected || !dadosCarregadosDoBanco) return;

    const timer = setTimeout(() => {
      setDbSyncing(true);
      fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch: {
            usuarios,
            tarefas,
            macrotarefas,
            movimentosBar,
            bilhetesRifa,
            rifas,
            vendasRifas,
            inscritos,
            integrantes,
            musicas,
            letrasCifras,
            enquetes,
            eventos,
            documentos,
            cores,
            artes,
            postsInstagram,
            configInstagram,
            temaAno
          }
        })
      })
        .catch(e => console.error('Erro na sincronização Vercel Postgres:', e))
        .finally(() => setDbSyncing(false));
    }, 1500);

    return () => clearTimeout(timer);
  }, [usuarios, tarefas, macrotarefas, movimentosBar, bilhetesRifa, rifas, vendasRifas, inscritos, integrantes, musicas, letrasCifras, enquetes, eventos, documentos, cores, artes, postsInstagram, configInstagram, temaAno, dbConnected, dadosCarregadosDoBanco]);

  /**
   * Salva o tema do ano no estado local, LocalStorage e diretamente no banco Vercel Postgres,
   * garantindo sincronização imediata sem depender exclusivamente do debounce.
   */
  const handleSalvarTema = async (temaAtualizado: TemaAnoBloco) => {
    setTemaAno(temaAtualizado);
    try {
      localStorage.setItem('bicha_tema_ano_v4', JSON.stringify(temaAtualizado));
    } catch (e) {
      console.error('Erro ao salvar tema no LocalStorage:', e);
    }

    if (dbConnected) {
      setDbSyncing(true);
      try {
        await fetch('/api/db/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'temaAno',
            data: temaAtualizado
          })
        });
      } catch (err) {
        console.error('Erro ao persistir tema no Vercel Postgres:', err);
      } finally {
        setDbSyncing(false);
      }
    }
  };

  // Contagem de tarefas órfãs
  const orfasCount = tarefas.filter(
    t => (!t.responsavel || t.responsavel.trim() === '' || t.responsavel.toLowerCase().includes('definir')) && !t.concluida
  ).length;

  /**
   * Registra o login bem-sucedido de um usuário (Bicho ou Coordenador).
   */
  const handleLoginSuccess = (usuario: UsuarioBloco) => {
    setUsuarioLogado(usuario);
    try {
      localStorage.setItem('bicha_sessao_usuario_v4', JSON.stringify(usuario));
    } catch (e) {}

    // Puxa as informações mais recentes do banco imediatamente ao trocar de usuário
    recarregarDadosDoServidor(true);

    // Ao fazer login, direciona para o Mural de Tarefas caso estivesse em inscrições
    if (activeTab === 'inscricao') {
      setActiveTab('tarefas');
    }
  };

  /**
   * Executa o logout da sessão, retornando o acesso para perfil Público.
   */
  const handleLogout = () => {
    setUsuarioLogado(null);
    try {
      localStorage.removeItem('bicha_sessao_usuario_v4');
    } catch (e) {}

    // Puxa as informações mais recentes do banco ao deslogar
    recarregarDadosDoServidor(true);

    const abasPublicas: TabId[] = ['inscricao', 'rifa', 'repertorio'];
    if (!abasPublicas.includes(activeTab)) {
      setActiveTab('inscricao');
    }
  };

  // Garante que o público acesse exclusivamente as 3 abas permitidas
  useEffect(() => {
    if (isPublico && !['inscricao', 'rifa', 'repertorio'].includes(activeTab)) {
      setActiveTab('inscricao');
    }
  }, [isPublico, activeTab]);

  /**
   * Adiciona um novo integrante aprovado à listagem oficial.
   */
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
      {/* Cabeçalho Vintage com Autenticação e Botão de Atualização em Tempo Real */}
      <Header
        usuarioLogado={usuarioLogado}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        temaTitulo={temaAno.titulo}
        temaSubtitulo={temaAno.subtituloOuSlogan}
        dbConnected={dbConnected}
        dbSyncing={dbSyncing}
        onSync={() => recarregarDadosDoServidor(false)}
      />

      {/* Menu Fanzine de Navegação adaptado ao perfil */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        orfasCount={orfasCount}
        perfil={perfilAtivo}
      />

      {/* Área de Conteúdo da Aba Ativa na Ordem Oficial */}
      <main id="conteudo-principal" className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 mb-8 pb-28 md:pb-16">
        {/* 1. Mural de Tarefas (Bicho e Coordenador) */}
        {activeTab === 'tarefas' && !isPublico && (
          <TasksManager
            tarefas={tarefas}
            setTarefas={setTarefas}
            isAdmin={isAdmin}
            onEquipePronta={handlePromoverTarefaParaDesfile}
          />
        )}

        {/* 2. Calendário de Ensaios & Datas (Bicho e Coordenador) */}
        {activeTab === 'calendario' && !isPublico && (
          <CalendarView
            eventos={eventos}
            setEventos={setEventos}
            isAdmin={isAdmin}
          />
        )}

        {/* 3. Tarefas em Andamento (Bicho e Coordenador) */}
        {activeTab === 'desfile' && !isPublico && (
          <ParadeKanban
            macrotarefas={macrotarefas}
            setMacrotarefas={setMacrotarefas}
            isAdmin={isAdmin}
          />
        )}

        {/* 4. Repertório Oficial & Letras/Cifras (Visível para Todos) */}
        {activeTab === 'repertorio' && (
          <RepertoireVoting
            musicas={musicas}
            setMusicas={setMusicas}
            isAdmin={isAdmin}
            isPublico={isPublico}
            onOpenLetras={() => setActiveTab('letras')}
          />
        )}

        {activeTab === 'letras' && !isPublico && (
          <LyricsAndChords
            items={letrasCifras}
            setItems={setLetrasCifras}
            isAdmin={isAdmin}
            onBackToRepertorio={() => setActiveTab('repertorio')}
          />
        )}

        {/* 5. Rifas Online (Visível para Todos) */}
        {activeTab === 'rifa' && (
          <RaffleApp
            rifas={rifas}
            setRifas={setRifas}
            vendas={vendasRifas}
            setVendas={setVendasRifas}
            bilhetes={bilhetesRifa}
            setBilhetes={setBilhetesRifa}
            isAdmin={isAdmin}
            isPublico={isPublico}
          />
        )}

        {/* 6. Inscrições de Foliões (Disponível para todos) */}
        {activeTab === 'inscricao' && (
          <JoinForm
            inscritos={inscritos}
            setInscritos={setInscritos}
            onAddIntegrante={handleAddIntegrante}
            isAdmin={isAdmin}
            usuarios={usuarios}
            setUsuarios={setUsuarios}
            usuarioLogado={usuarioLogado}
          />
        )}

        {/* 7. Mídia & Artes (Bicho e Coordenador) */}
        {activeTab === 'midia' && !isPublico && (
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
            onSalvarTema={handleSalvarTema}
            isAdmin={isAdmin}
          />
        )}

        {/* 8. Bar dos Ensaios (Bicho e Coordenador) */}
        {activeTab === 'bar' && !isPublico && (
          <BarManager
            movimentos={movimentosBar}
            setMovimentos={setMovimentosBar}
            isAdmin={isAdmin}
          />
        )}

        {/* 9. Elenco & Naipes (Bicho e Coordenador) */}
        {activeTab === 'elenco' && !isPublico && (
          <RosterView
            integrantes={integrantes}
            setIntegrantes={setIntegrantes}
            isAdmin={isAdmin}
          />
        )}

        {/* 10. Enquetes WhatsApp (Bicho e Coordenador) */}
        {activeTab === 'enquetes' && !isPublico && (
          <WhatsAppPolls
            enquetes={enquetes}
            setEnquetes={setEnquetes}
            isAdmin={isAdmin}
          />
        )}

        {/* 11. Documentos Oficiais (Bicho e Coordenador) */}
        {activeTab === 'documentos' && !isPublico && (
          <DocumentsManager
            documentos={documentos}
            setDocumentos={setDocumentos}
            isAdmin={isAdmin}
            isPublico={isPublico}
          />
        )}
      </main>

      {/* Rodapé Estilo Gazeta / Fanzine */}
      <footer className="bg-[#1A181B] text-[#FAF6EC] py-6 px-4 text-center text-xs border-t-4 border-[#E6007E]">
        <p className="font-mono font-black uppercase text-sm">
          ★ BLOCO BICHARADA • {temaAno.titulo.toUpperCase()} {temaAno.ano} ★
        </p>
        {temaAno.subtituloOuSlogan && (
          <p className="font-mono text-xs italic font-bold text-[#FBBF24] mt-0.5">
            &ldquo;{temaAno.subtituloOuSlogan}&rdquo;
          </p>
        )}
        <p className="mt-1 font-serif text-[11px] text-stone-400">
          Florianópolis / SC • Sistema Comunitário Aberto e 100% Gratuito na Vercel
        </p>
        {isAdmin && (
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => {
                if (confirm('Atenção: deseja limpar o cache local deste navegador para reiniciar com os dados oficiais limpos?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="px-2.5 py-1 text-[11px] font-mono font-bold uppercase bg-stone-900 border border-stone-600 text-stone-300 hover:text-red-400 hover:border-red-500 transition-colors cursor-pointer"
            >
              Limpar Cache Local do Navegador (Reset de Mocks)
            </button>
          </div>
        )}
      </footer>

      {/* Modal de Login de Usuários (Bicho ou Coordenador) */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        usuarios={usuarios}
      />
    </div>
  );
}
