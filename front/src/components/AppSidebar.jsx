import React from 'react';
import { BarChart3, CalendarClock, History, Phone, Plus } from 'lucide-react';

export function AppSidebar({ view, onNavigate, onRegisterCall }) {
  const navClass = (name) =>
    [
      'inline-flex min-h-[38px] min-w-0 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 px-3 py-2 font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white sm:min-h-11 sm:px-2 md:min-h-[42px] md:justify-start md:px-3.5 md:py-2.5',
      view === name ? 'bg-slate-800 text-white' : 'bg-transparent'
    ].join(' ');

  return (
    <aside className="static z-10 grid grid-cols-1 gap-2 bg-slate-900 p-3 text-white sm:grid-cols-3 md:sticky md:top-0 md:flex md:min-w-0 md:flex-col md:gap-3 md:p-6 md:px-[18px]">
      <div className="col-span-full mb-0 flex min-w-0 items-center justify-center gap-2.5 text-[17px] font-extrabold md:mb-[18px] md:justify-start md:text-[19px]">
        <Phone size={22} className="shrink-0" />
        <span className="truncate">Gestor llamados</span>
      </div>
      <button className={navClass('home')} onClick={() => onNavigate('home')}>
        <CalendarClock size={18} className="shrink-0" /> Principal
      </button>
      <button className={navClass('metrics')} onClick={() => onNavigate('metrics')}>
        <BarChart3 size={18} className="shrink-0" /> Metricas
      </button>
      <button className={navClass('history')} onClick={() => onNavigate('history')}>
        <History size={18} className="shrink-0" /> Historial
      </button>
      <button
        className="inline-flex min-h-11 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-blue-600 px-2 py-2 font-bold text-white transition hover:bg-blue-700 md:min-h-[42px] md:px-3.5 md:py-2.5"
        onClick={onRegisterCall}
      >
        <Plus size={18} className="shrink-0" /> Registrar llamado
      </button>
    </aside>
  );
}
