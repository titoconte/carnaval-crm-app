'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';
import { EventoCalendario } from '../data/blocoData';

interface CalendarViewProps {
  eventos: EventoCalendario[];
}

/**
 * Calendário em Estilo Folhinha / Almanaque de Carnaval.
 */
export default function CalendarView({ eventos }: CalendarViewProps) {
  const [filtro, setFiltro] = useState<string>('Todos');

  const eventosFiltrados = filtro === 'Todos'
    ? eventos
    : eventos.filter(e => e.tipo === filtro);

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-[#FAF6EC] border-2 border-[#1A181B] p-4 shadow-[3px_3px_0px_#1A181B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black uppercase text-[#1A181B] flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#E6007E]" />
            <span>Almanaque de Ensaios & Datas</span>
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Segundas e sextas-feiras rumo ao desfile na Praça Oliva.
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {(['Todos', 'Ensaio', 'Reunião presencial', 'Oficina de Fantasias', 'Desfile Oficial'] as const).map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltro(tipo)}
              className={`px-3 py-1.5 border-2 border-[#1A181B] font-mono text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#1A181B] ${
                filtro === tipo
                  ? 'bg-[#E6007E] text-white'
                  : 'bg-white text-[#1A181B] hover:bg-stone-100'
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      {/* Lista Estilo Folhinha */}
      <div className="space-y-3">
        {eventosFiltrados.map((ev) => {
          const isDesfile = ev.tipo === 'Desfile Oficial';

          return (
            <div
              key={ev.id}
              className={`p-4 border-2 border-[#1A181B] shadow-[3px_3px_0px_#1A181B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                isDesfile
                  ? 'bg-[#FBBF24] border-[#1A181B] shadow-[4px_4px_0px_#1A181B] rotate-[-0.5deg]'
                  : 'bg-white hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Bloco de Data */}
                <div className="w-14 h-14 bg-[#F4EEDF] border-2 border-[#1A181B] flex flex-col items-center justify-center font-mono font-black shrink-0 shadow-[2px_2px_0px_#1A181B]">
                  <span className="text-[10px] uppercase text-[#E6007E]">{ev.diaSemana}</span>
                  <span className="text-base leading-none text-[#1A181B]">{ev.data.split('-')[2]}</span>
                  <span className="text-[9px] uppercase text-stone-500">
                    {ev.data.split('-')[1] === '10' ? 'Out' :
                     ev.data.split('-')[1] === '11' ? 'Nov' :
                     ev.data.split('-')[1] === '12' ? 'Dez' :
                     ev.data.split('-')[1] === '01' ? 'Jan' : 'Fev'}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="stamp stamp-confirmed text-[9px] font-mono">
                      {ev.tipo}
                    </span>
                    <span className="text-xs font-mono font-bold text-stone-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {ev.horario}
                    </span>
                  </div>

                  <h3 className="font-mono font-black text-base text-[#1A181B] mt-1">
                    {ev.tipo} — {ev.local}
                  </h3>

                  {ev.observacoes && (
                    <p className="text-xs text-stone-600 font-serif mt-0.5">
                      {ev.observacoes}
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0 font-mono text-xs font-bold text-[#581C87] flex items-center gap-1 bg-[#F4EEDF] px-2.5 py-1 border border-black">
                <MapPin className="w-3.5 h-3.5 text-[#E6007E]" />
                <span>{ev.local}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
