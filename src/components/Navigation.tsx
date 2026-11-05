'use client';

import React from 'react';
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
  | 'inscricao';

export interface TabItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
  badge?: string;
  highlight?: boolean;
}

/**
 * Retorna as abas visíveis no menu principal do aplicativo.
 * A aba 'Letras & Cifras' foi removida do menu e agora é acessada via Repertório.
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
    { id: 'inscricao', label: 'Inscrições', icon: UserPlus }
  ];
}

interface NavigationProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  orfasCount: number;
}

/**
 * Menu de Navegação Horizontal com as Cores Vivas Oficiais do Bloco Bicharada.
 */
export default function Navigation({ activeTab, setActiveTab, orfasCount }: NavigationProps) {
  const tabs = getVisibleNavigationTabs(orfasCount);

  return (
    <nav className="sticky top-0 z-30 bg-white border-b-3 border-[#1E1B2E] py-2.5 px-3 shadow-md">
      <div className="max-w-5xl mx-auto overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 border-2 border-[#1E1B2E] text-xs font-black uppercase transition-all whitespace-nowrap active:translate-x-0.5 active:translate-y-0.5 ${
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
      </div>
    </nav>
  );
}
