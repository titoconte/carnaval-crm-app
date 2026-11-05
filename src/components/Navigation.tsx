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
  ChevronDown, 
  ChevronUp, 
  LucideIcon 
} from 'lucide-react';

export type TabId = 
  | 'repertorio' 
  | 'letras' 
  | 'tarefas' 
  | 'elenco' 
  | 'enquetes' 
  | 'bar' 
  | 'rifa' 
  | 'desfile' 
  | 'calendario' 
  | 'inscricao' 
  | 'documentos' 
  | 'midia';

export interface TabItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
  badge?: string;
  highlight?: boolean;
}

/**
 * Retorna as abas visíveis no menu principal do aplicativo.
 * A aba 'Letras & Cifras' foi movida para dentro do Repertório.
 * Inclui as abas 'Documentos' e 'Mídia & Artes' (com cores do ano, Instagram e tema).
 * 
 * @param orfasCount - Quantidade de tarefas órfãs para exibição no badge
 * @returns Lista de abas a serem renderizadas na barra de navegação
 */
export function getVisibleNavigationTabs(orfasCount: number = 0): TabItem[] {
  return [
    { id: 'repertorio', label: 'Repertório', icon: Music },
    { id: 'tarefas', label: 'Mural de Tarefas', icon: ClipboardList, badge: orfasCount > 0 ? `${orfasCount} órfãs` : undefined },
    { id: 'elenco', label: 'Elenco & Naipes', icon: Users },
    { id: 'enquetes', label: 'Enquetes WhatsApp', icon: BarChart2 },
    { id: 'bar', label: 'Bar dos Ensaios', icon: Beer },
    { id: 'rifa', label: 'Rifa Online 🎟️', icon: Gift, highlight: true },
    { id: 'desfile', label: 'Tarefas em Andamento', icon: Truck },
    { id: 'calendario', label: 'Calendário', icon: Calendar },
    { id: 'inscricao', label: 'Inscrições', icon: UserPlus },
    { id: 'documentos', label: 'Documentos', icon: FolderDown },
    { id: 'midia', label: 'Mídia & Artes', icon: Palette }
  ];
}

interface NavigationProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  orfasCount: number;
}

/**
 * Menu de Navegação do Bloco Bicharada.
 * - Versão Desktop: Disposição expandida com quebra fluida (flex-wrap), exibindo todas as opções de forma clara.
 * - Versão Mobile: Barra de navegação fixa inferior de 1-toque + Gaveta completa de abas com rolagem instantânea para o topo.
 */
export default function Navigation({ activeTab, setActiveTab, orfasCount }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tabs = getVisibleNavigationTabs(orfasCount);
  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];
  const CurrentIcon = currentTab.icon;

  /**
   * Seleciona uma aba, fecha o menu mobile e rola suavemente para o topo limpo da página.
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
      <nav className="sticky top-0 z-30 bg-white border-b-3 border-[#1E1B2E] py-2 px-3 shadow-md">
        {/* VERSÃO DESKTOP: Todas as opções visíveis em layout flex-wrap elegante */}
        <div className="hidden md:flex flex-wrap items-center justify-center gap-2 max-w-5xl mx-auto">
          {tabs.map((tab) => {
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

        {/* VERSÃO MOBILE TOPO: Seletor Rápido e Botão para Abrir Todas as Abas */}
        <div className="md:hidden space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 bg-[#FFFDF9] border-2 border-[#1E1B2E] px-2.5 py-1 text-xs font-black uppercase shadow-[1px_1px_0px_#1E1B2E] truncate">
              <CurrentIcon className="w-3.5 h-3.5 text-[#E6007E] shrink-0" />
              <span className="truncate">{currentTab.label}</span>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#581C87] text-[#FBBF24] border-2 border-[#1E1B2E] text-xs font-black uppercase shadow-[2px_2px_0px_#1E1B2E] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shrink-0"
            >
              {mobileMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
              <span>{mobileMenuOpen ? 'Fechar' : 'Todas as Abas'}</span>
              {mobileMenuOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Barra de rolagem horizontal mobile rápida */}
          <div className="overflow-x-auto no-scrollbar pt-0.5">
            <div className="flex items-center gap-1.5 min-w-max pb-0.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectTab(tab.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 border-2 border-[#1E1B2E] text-[11px] font-black uppercase whitespace-nowrap cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#E6007E] text-white shadow-[2px_2px_0px_#1E1B2E]'
                        : 'bg-white text-[#1E1B2E] shadow-[1px_1px_0px_#1E1B2E]'
                    }`}
                  >
                    <Icon className={`w-3 h-3 ${isActive ? 'text-white' : 'text-[#E6007E]'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* MODAL / GAVETA MOBILE DE TODAS AS ABAS */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end p-3 animate-fadeIn">
          <div className="bg-[#FAF6EC] border-4 border-[#1E1B2E] p-4 shadow-[6px_6px_0px_#1E1B2E] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b-2 border-[#1E1B2E] pb-2 mb-3">
              <div>
                <span className="stamp stamp-urgent text-[10px]">Navegação Oficial</span>
                <h3 className="font-mono font-black text-sm uppercase text-[#1E1B2E] mt-0.5">
                  Todas as Seções do Bloco
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
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectTab(tab.id)}
                    className={`flex items-center gap-2 p-3 border-2 border-[#1E1B2E] text-left text-xs font-black uppercase transition-all cursor-pointer min-h-[48px] ${
                      isActive
                        ? 'bg-[#E6007E] text-white shadow-[2px_2px_0px_#1E1B2E]'
                        : tab.highlight
                        ? 'bg-[#00D287] text-[#1E1B2E] shadow-[1px_1px_0px_#1E1B2E]'
                        : 'bg-white text-[#1E1B2E] hover:bg-pink-50 shadow-[1px_1px_0px_#1E1B2E]'
                    }`}
                  >
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

      {/* BARRA FIXA INFERIOR MOBILE (Bottom Navigation Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-3 border-[#1E1B2E] shadow-[0_-3px_10px_rgba(0,0,0,0.15)] flex items-stretch justify-around px-1 py-1">
        {[
          { id: 'repertorio', label: 'Músicas', icon: Music },
          { id: 'tarefas', label: 'Tarefas', icon: ClipboardList, badge: orfasCount > 0 ? `${orfasCount}` : undefined },
          { id: 'elenco', label: 'Elenco', icon: Users },
          { id: 'rifa', label: 'Rifa', icon: Gift, highlight: true },
          { id: 'documentos', label: 'Docs', icon: FolderDown },
          { id: 'midia', label: 'Mídia', icon: Palette }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectTab(tab.id as TabId)}
              className={`flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center relative transition-colors cursor-pointer rounded-xs min-h-[44px] ${
                isActive ? 'bg-[#FAF5FF] text-[#E6007E]' : 'text-[#1E1B2E] hover:bg-stone-50'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#E6007E] scale-110' : tab.highlight ? 'text-[#00A868]' : 'text-[#1E1B2E]'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[8px] font-black rounded-full px-1 leading-tight font-mono">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-black uppercase font-mono mt-0.5 truncate max-w-full ${
                isActive ? 'text-[#E6007E]' : 'text-stone-700'
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-4 h-0.5 bg-[#E6007E] mt-0.5 rounded-full" />
              )}
            </button>
          );
        })}

        {/* Botão de Menu Mais */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center relative cursor-pointer min-h-[44px] ${
            mobileMenuOpen ? 'bg-[#581C87] text-[#FBBF24]' : 'text-[#1E1B2E] hover:bg-stone-50'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase font-mono mt-0.5">
            Mais
          </span>
        </button>
      </div>
    </>
  );
}
