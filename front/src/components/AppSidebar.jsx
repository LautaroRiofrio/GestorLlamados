import React from 'react';
import { BarChart3, CalendarClock, Phone, Plus } from 'lucide-react';

export function AppSidebar({ view, onNavigate, onRegisterCall }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <Phone size={22} />
        <span>Gestor llamados</span>
      </div>
      <button className={view === 'home' ? 'nav active' : 'nav'} onClick={() => onNavigate('home')}>
        <CalendarClock size={18} /> Principal
      </button>
      <button className={view === 'metrics' ? 'nav active' : 'nav'} onClick={() => onNavigate('metrics')}>
        <BarChart3 size={18} /> Metricas
      </button>
      <button className="primary" onClick={onRegisterCall}>
        <Plus size={18} /> Registrar llamado
      </button>
    </aside>
  );
}
