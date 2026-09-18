import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../api';
import { Empty } from '../components/Empty';
import { RowActions } from '../components/RowActions';
import { SectionTitle } from '../components/SectionTitle';
import { formatDateTime } from '../utils/date';

function byCreatedAtDesc(left, right) {
  return new Date(right.createdAt) - new Date(left.createdAt);
}

export function History({ onEditCall, onEditCallback }) {
  const [search, setSearch] = useState('');
  const [calls, setCalls] = useState([]);
  const [callbacks, setCallbacks] = useState([]);

  async function loadData() {
    const [nextCallsPage, nextCallbacksPage] = await Promise.all([
      api.calls({ q: search, limit: 100 }),
      api.callbacks({ q: search, sort: 'createdAt', limit: 100 })
    ]);

    setCalls(nextCallsPage.items || []);
    setCallbacks(nextCallbacksPage.items || []);
  }

  useEffect(() => {
    loadData().catch(console.error);
  }, [search]);

  const sortedCalls = useMemo(() => [...calls].sort(byCreatedAtDesc), [calls]);
  const sortedCallbacks = useMemo(() => [...callbacks].sort(byCreatedAtDesc), [callbacks]);

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
          <h1 className="text-[26px] font-bold leading-tight md:text-[32px]">Historial</h1>
          <p className="mt-1.5 text-sm text-slate-500 md:text-base">Llamados y rellamados ordenados por fecha de creacion.</p>
        </div>
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

      <section className="mt-5 grid min-w-0 gap-4">
        <div>
          <SectionTitle title="Llamados"/>
          <div className="grid gap-2.5">
            {sortedCalls.length === 0 && <Empty text="No hay llamados en el historial." />}
            {sortedCalls.map((call) => (
              <div
                className=" grid min-w-0 grid-cols-1 items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3.5 text-left transition hover:border-blue-600 sm:grid-cols-[1fr_auto] md:grid-cols-[1fr_1fr_1fr_auto] md:gap-3.5 "
                key={call.id}
              >
                <div className="grid min-w-0 gap-1 ">
                  <strong>{call.phone}</strong>
                  <span className="[overflow-wrap:anywhere] text-sm text-slate-500">Creado: {formatDateTime(call.createdAt)}</span>
                </div>
                <div className="grid min-w-0 gap-1 sm:col-span-2 md:col-span-1">
                  <span className="[overflow-wrap:anywhere] text-sm text-slate-500">{call.dni || 'Sin DNI'}</span>
                  <span className="[overflow-wrap:anywhere] text-sm text-slate-500">{call.accountNumber || 'Sin cuenta'}</span>
                </div>
                <div className="grid min-w-0 gap-1 sm:col-span-2 md:col-span-1">
                  <strong>{call.state}</strong>
                  {/* <span>{call.detail || 'Sin detalle'}</span> */}
                </div>
                <RowActions
                  onEdit={() => onEditCall(call)}
                  onDelete={() => deleteCall(call)}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle title="Rellamados" />
          <div className="grid gap-2.5">
            {sortedCallbacks.length === 0 && <Empty text="No hay rellamados en el historial." />}
            {sortedCallbacks.map((callback) => (
              <div
                className="grid min-w-0 grid-cols-1 items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3.5 text-left transition hover:border-blue-600 sm:grid-cols-[1fr_auto] md:grid-cols-[1fr_1fr_1fr_auto] md:gap-3.5"
                key={callback.id}
              >
                <div className="grid min-w-0 gap-1">
                  <strong>{callback.phone}</strong>
                  <span className="[overflow-wrap:anywhere] text-sm text-slate-500">Creado: {formatDateTime(callback.createdAt)}</span>
                </div>
                <div className="grid min-w-0 gap-1 sm:col-span-2 md:col-span-1">
                  <span className="[overflow-wrap:anywhere] text-sm text-slate-500">{callback.dni || 'Sin DNI'}</span>
                  <span className="[overflow-wrap:anywhere] text-sm text-slate-500">{callback.accountNumber || 'Sin cuenta'}</span>
                </div>
                <div className="grid min-w-0 gap-1 sm:col-span-2 md:col-span-1">
                  <strong>{callback.state}</strong>
                  <span className="[overflow-wrap:anywhere] text-sm text-slate-500">Recontacto: {formatDateTime(callback.recontactAt)}</span>
                </div>
                <RowActions
                  onEdit={() => onEditCallback(callback)}
                  onDelete={() => deleteCallback(callback)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
