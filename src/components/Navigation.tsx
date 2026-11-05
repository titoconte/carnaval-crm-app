'use client';

import React, { useState } from 'react';
import { 
  Music, 
  ClipboardList, 
  Users, 
  BarChart2, 
  Beer, 
  Gift, 
  Truck, 
  Calendar, 
  UserPlus, 
  FolderDown, 
  Palette, 
  Menu, 
  X, 
  LucideIcon 
} from 'lucide-react';
import { PerfilUsuario } from '../data/blocoData';

export type TabId = 
  | 'tarefas' 
  | 'calendario' 
  | 'desfile' 
  | 'repertorio' 
  | 'letras' 
  | 'rifa' 
  | 'inscricao' 
  | 'midia' 
  | 'bar' 
  | 'elenco' 
  | 'enquetes' 
  | 'documentos';

export interface TabItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
  badge?: string;
  highlight?: boolean;
}

/**
 * Retorna as abas visíveis no menu principal respeitando o perfil de acesso do usuário:
 * - Se 'publico' (visitante sem login): Apenas 5 abas na ordem oficial:
 *   1. Inscrições (inscricao)
 *   2. Calendário (calendario)
 *   3. Rifas (rifa)
 *   4. Repertório (repertorio)
 *   5. Documentos (documentos)
 * - Se 'coordenador' ou 'bicho': Todas as 11 abas na ordem oficial de 1 a 11.
 * 
 * @param orfasCount - Quantidade de tarefas órfãs para exibição no badge
 * @param perfil - Perfil atual de acesso ('coordenador' | 'bicho' | 'publico')
 * @returns Lista de abas a serem renderizadas na barra de navegação
 */
export function getVisibleNavigationTabs(
  orfasCount: number = 0,
  perfil: PerfilUsuario = 'publico'
): TabItem[] {
  if (perfil === 'publico') {
    return [
      { id: 'inscricao', label: 'Inscrições', icon: UserPlus },
      { id: 'calendario', label: 'Calendário', icon: Calendar },
      { id: 'rifa', label: 'Rifas 🎟️', icon: Gift, highlight: true },
      { id: 'repertorio', label: 'Repertório', icon: Music },
      { id: 'documentos', label: 'Documentos', icon: FolderDown }
    ];
  }

  return [
    { id: 'tarefas', label: 'Mural de Tarefas', icon: ClipboardList, badge: orfasCount > 0 ? `${orfasCount} órfãs` : undefined },
    { id: 'calendario', label: 'Calendário', icon: Calendar },
    { id: 'desfile', label: 'Tarefas em Andamento', icon: Truck },
    { id: 'repertorio', label: 'Repertório', icon: Music },
    { id: 'rifa', label: 'Rifas 🎟️', icon: Gift, highlight: true },
    { id: 'inscricao', label: 'Inscrições', icon: UserPlus },
    { id: 'midia', label: 'Mídia & Artes', icon: Palette },
    { id: 'bar', label: 'Bar dos Ensaios', icon: Beer },
    { id: 'elenco', label: 'Elenco & Naipes', icon: Users },
    { id: 'enquetes', label: 'Enquetes WhatsApp', icon: BarChart2 },
    { id: 'documentos', label: 'Documentos', icon: FolderDown }
  ];
}

interface NavigationProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  orfasCount: number;
  perfil?: PerfilUsuario;
}

/**
 * Menu de Navegação Oficial do Bloco Bicharada.
 * - Versão Desktop: Barra superior horizontal fixa (hidden md:block) com abas segundo perfil de acesso.
 * - Versão Mobile: Barra de menu superior 100% OCULTA, mantendo unicamente a barra inferior fixa (Bottom Navigation).
 */
export default function Navigation({
  activeTab,
  setActiveTab,
  orfasCount,
  perfil = 'publico'
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tabs = getVisibleNavigationTabs(orfasCount, perfil);

  /**
   * Seleciona uma aba, fecha o menu mobile e rola suavemente para o topo da página.
   * 
   * @param tabId - Identificador da aba selecionada
   */
  const handleSelectTab = (tabId: TabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  return (
    <>
      {/* VERSÃO DESKTOP: Barra superior visível apenas em telas médias e grandes (md:block) */}
      <nav className="hidden md:block sticky top-0 z-30 bg-white border-b-3 border-[#1E1B2E] py-2 px-3 shadow-md">
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-5xl mx-auto">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#1E1B2E] text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                  isActive
                    ? 'bg-[#E6007E] text-white shadow-[3px_3px_0px_#1E1B2E]'
                    : tab.highlight
                    ? 'bg-[#00D287] text-[#1E1B2E] hover:bg-[#34EEA0] shadow-[2px_2px_0px_#1E1B2E]'
                    : 'bg-[#FFFDF9] text-[#1E1B2E] hover:bg-pink-50/70 shadow-[2px_2px_0px_#1E1B2E]'
                }`}
              >
                <span className="text-[10px] font-mono font-bold opacity-75">
                  {idx + 1}.
                </span>
                <Icon className={`w-3.5 h-3.5 ${
                  isActive ? 'text-white' : tab.highlight ? 'text-[#1E1B2E]' : 'text-[#E6007E]'
                }`} />
                <span>{tab.label}</span>

                {tab.badge && (
                  <span className="px-1.5 py-0.2 bg-[#E6007E] text-white text-[9px] font-mono border border-black shadow-[1px_1px_0px_#000]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* MODAL / GAVETA MOBILE DE TODAS AS ABAS DO PERFIL */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end p-3 animate-fadeIn">
          <div className="bg-[#FAF6EC] border-4 border-[#1E1B2E] p-4 shadow-[6px_6px_0px_#1E1B2E] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b-2 border-[#1E1B2E] pb-2 mb-3">
              <div>
                <span className="stamp stamp-urgent text-[10px]">Navegação Oficial</span>
                <h3 className="font-mono font-black text-sm uppercase text-[#1E1B2E] mt-0.5">
                  {perfil === 'publico' ? 'Seções Abertas ao Público' : 'Todas as 11 Seções do Bloco'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 border-2 border-[#1E1B2E] bg-white text-[#1E1B2E] hover:bg-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1 p-1">
              {tabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectTab(tab.id)}
                    className={`flex items-center gap-2 p-2.5 border-2 border-[#1E1B2E] text-left text-xs font-black uppercase transition-all cursor-pointer min-h-[48px] ${
                      isActive
                        ? 'bg-[#E6007E] text-white shadow-[2px_2px_0px_#1E1B2E]'
                        : tab.highlight
                        ? 'bg-[#00D287] text-[#1E1B2E] shadow-[1px_1px_0px_#1E1B2E]'
                        : 'bg-white text-[#1E1B2E] hover:bg-pink-50 shadow-[1px_1px_0px_#1E1B2E]'
                    }`}
                  >
                    <span className={`text-[11px] font-mono font-black px-1.5 py-0.5 border border-[#1E1B2E] ${
                      isActive ? 'bg-[#581C87] text-[#FBBF24]' : 'bg-stone-100 text-[#1E1B2E]'
                    }`}>
                      #{idx + 1}
                    </span>
                    <Icon className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : tab.highlight ? 'text-[#1E1B2E]' : 'text-[#E6007E]'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <span className="block truncate leading-tight">{tab.label}</span>
                      {tab.badge && (
                        <span className="inline-block mt-0.5 text-[9px] bg-red-600 text-white px-1 font-mono">
                          {tab.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* BARRA FIXA INFERIOR MOBILE EXCLUSIVA (Bottom Navigation Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-3 border-[#1E1B2E] shadow-[0_-3px_12px_rgba(0,0,0,0.18)]">
        <div className="flex items-center overflow-x-auto no-scrollbar px-1 py-1 gap-1">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`shrink-0 min-w-[62px] max-w-[76px] py-1.5 px-1 flex flex-col items-center justify-center relative transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#581C87] text-[#FBBF24] border-[#1E1B2E] shadow-[1px_1px_0px_#1E1B2E]'
                    : tab.highlight
                    ? 'bg-emerald-50 text-[#1E1B2E] border-stone-200'
                    : 'bg-white text-stone-700 border-transparent hover:bg-stone-50'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FBBF24]' : tab.highlight ? 'text-[#00A868]' : 'text-[#E6007E]'}`} />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[8px] font-black rounded-full px-1 leading-tight font-mono">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] font-black uppercase font-mono mt-0.5 truncate max-w-full ${
                  isActive ? 'text-[#FBBF24]' : 'text-stone-800'
                }`}>
                  {tab.label.replace(/^\d+\.\s*/, '')}
                </span>
                <span className="text-[7.5px] font-mono text-stone-400 leading-none">
                  #{idx + 1}
                </span>
              </button>
            );
          })}

          {/* Botão para Abrir Menu Completo em Grade */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`shrink-0 min-w-[56px] py-1.5 px-1 flex flex-col items-center justify-center relative cursor-pointer border transition-all ${
              mobileMenuOpen 
                ? 'bg-[#E6007E] text-white border-[#1E1B2E]' 
                : 'bg-stone-100 text-[#1E1B2E] border-stone-300'
            }`}
          >
            <Menu className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase font-mono mt-0.5">
              Grade
            </span>
            <span className="text-[7.5px] font-mono text-stone-500 leading-none">
              {tabs.length} abas
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
