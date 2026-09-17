import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { api } from '../api';
import { Empty } from '../components/Empty';
import { MetricSummary } from '../components/MetricSummary';
import { PieBlock } from '../components/PieBlock';
import { RowActions } from '../components/RowActions';
import { SectionTitle } from '../components/SectionTitle';
import { formatDateTime } from '../utils/date';

export function Home({
  onRegister,
  onEditCall,
  onEditCallback
}) {
  const [search, setSearch] = useState('');
  const [callbacks, setCallbacks] = useState([]);
  const [calls, setCalls] = useState([]);
  const [metrics, setMetrics] = useState(null);

  async function loadData() {
    const [nextCallbacksPage, nextCallsPage, nextMetrics] = await Promise.all([
      api.callbacks({ pending: true, q: search }),
      api.calls({ q: search }),
      api.metrics()
    ]);
    setCallbacks(nextCallbacksPage.items || []);
    setCalls(nextCallsPage.items || []);
    setMetrics(nextMetrics);
  }

  useEffect(() => {
    loadData().catch(console.error);
  }, [search]);

  async function deleteCall(call) {
    const confirmed = window.confirm(`¿Eliminar el llamado de ${call.phone}?`);
    if (!confirmed) return;
    await api.deleteCall(call.id);
    await loadData();
  }

  async function deleteCallback(callback) {
    const confirmed = window.confirm(`¿Eliminar el rellamado de ${callback.phone}?`);
    if (!confirmed) return;
    await api.deleteCallback(callback.id);
    await loadData();
  }

  return (
    <>
      <header className="mb-5 flex min-w-0 flex-col items-stretch gap-4 md:mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[26px] font-bold leading-tight md:text-[32px]">Principal</h1>
          <p className="mt-1.5 text-sm text-slate-500 md:text-base">Rellamados pendientes, actividad reciente y metricas rapidas.</p>
        </div>
        <button
          className="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-blue-600 px-3.5 py-2.5 font-bold text-white transition hover:bg-blue-700"
          onClick={onRegister}
        >
          <Plus size={18} /> Registrar llamado
        </button>
      </header>

      <div className="flex min-h-[46px] min-w-0 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 sm:h-12 sm:py-0">
        <Search size={18} />
        <input
          className="w-full min-w-0 border-0 bg-transparent outline-0"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por telefono, DNI, cuenta o estado"
        />
      </div>

      <MetricSummary metrics={metrics} />

      <section className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div>
          <SectionTitle title="Rellamados pendientes" />
          <div className="grid gap-2.5">
            {callbacks.length === 0 && <Empty text="No hay rellamados pendientes." />}
            {callbacks.map((callback) => (
              <div
                className="grid min-w-0 grid-cols-1 items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3.5 text-left transition hover:border-blue-600 sm:grid-cols-[1fr_auto] md:grid-cols-[1.1fr_1fr_auto] md:gap-3.5"
                key={callback.id}
              >
                <div className="grid min-w-0 gap-1">
                  <strong>{callback.phone}</strong>
                  <span className="[overflow-wrap:anywhere] text-sm text-slate-500">{formatDateTime(callback.recontactAt)}</span>
                </div>
                <div className="grid min-w-0 gap-1 sm:col-span-2 md:col-span-1">
                  <span className="[overflow-wrap:anywhere] text-sm text-slate-500">{callback.dni || 'Sin DNI'}</span>
                  <span className="[overflow-wrap:anywhere] text-sm text-slate-500">{callback.accountNumber || 'Sin cuenta'}</span>
                </div>
                <RowActions
                  onEdit={() => onEditCallback(callback)}
                  onDelete={() => deleteCallback(callback)}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionTitle title="Estados de llamados de hoy" />
          <PieBlock data={metrics?.calls?.byStateToday || []} />
          <SectionTitle title="Ultimos llamados" />
          <div className="grid gap-2">
            {calls.slice(0, 6).map((call) => (
              <div
                className="grid min-w-0 grid-cols-1 items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_auto_auto]"
                key={call.id}
              >
                <span className="min-w-0 [overflow-wrap:anywhere] text-slate-500">
                  {call.phone}
                  <small className="mt-1 block text-xs text-slate-400">{call.dni || 'Sin DNI'}</small>
                </span>
                <strong className="min-w-0 justify-self-start [overflow-wrap:anywhere]">{call.state}</strong>
                <RowActions
                  onEdit={() => onEditCall(call)}
                  onDelete={() => deleteCall(call)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
