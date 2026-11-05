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
 * Inclui as abas 'Documentos' e 'Mídia & Artes' (com cores do ano e Instagram).
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
 * - Versão Mobile: Menu acessível com gaveta completa de abas em grade e rolagem tátil suave, rolando automaticamente até as informações.
 */
export default function Navigation({ activeTab, setActiveTab, orfasCount }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tabs = getVisibleNavigationTabs(orfasCount);
  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];
  const CurrentIcon = currentTab.icon;

  /**
   * Seleciona uma aba, fecha o menu mobile e rola suavemente até o container de conteúdo.
   */
  const handleSelectTab = (tabId: TabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      const el = document.getElementById('conteudo-principal');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
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

      {/* VERSÃO MOBILE: Seletor Rápido e Gaveta Completa com Botões Fáceis de Clicar */}
      <div className="md:hidden space-y-1.5">
        {/* Barra superior de status mobile com botão para abrir todas as abas */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 bg-[#FFFDF9] border-2 border-[#1E1B2E] px-2.5 py-1 text-xs font-black uppercase shadow-[1px_1px_0px_#1E1B2E] truncate">
            <CurrentIcon className="w-3.5 h-3.5 text-[#E6007E] shrink-0" />
            <span className="truncate">{currentTab.label}</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#581C87] text-[#FBBF24] border-2 border-[#1E1B2E] text-xs font-black uppercase shadow-[2px_2px_0px_#1E1B2E] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shrink-0"
          >
            {mobileMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
            <span>{mobileMenuOpen ? 'Fechar' : 'Todas as Abas'}</span>
            {mobileMenuOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Gaveta Aberta: Grade com todas as abas em botões confortáveis */}
        {mobileMenuOpen && (
          <div className="pt-2 pb-1 border-t-2 border-dashed border-stone-300">
            <div className="grid grid-cols-2 gap-1.5 max-h-[60vh] overflow-y-auto p-1 bg-stone-50 border-2 border-[#1E1B2E]">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectTab(tab.id)}
                    className={`flex items-center gap-2 p-2.5 border-2 border-[#1E1B2E] text-left text-xs font-black uppercase transition-all cursor-pointer min-h-[44px] ${
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
        )}

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
  );
}
