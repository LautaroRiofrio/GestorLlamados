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
      <header className="topbar">
        <div>
          <h1>Historial</h1>
          <p>Llamados y rellamados ordenados por fecha de creacion.</p>
        </div>
      </header>

      <div className="search">
        <Search size={18} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por telefono, DNI, cuenta o estado"
        />
      </div>

      <section className="history-grid">
        <div>
          <SectionTitle title="Llamados" />
          <div className="list">
            {sortedCalls.length === 0 && <Empty text="No hay llamados en el historial." />}
            {sortedCalls.map((call) => (
              <div className="row history-row" key={call.id}>
                <div>
                  <strong>{call.phone}</strong>
                  <span>Creado: {formatDateTime(call.createdAt)}</span>
                </div>
                <div>
                  <span>{call.dni || 'Sin DNI'}</span>
                  <span>{call.accountNumber || 'Sin cuenta'}</span>
                </div>
                <div>
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
          <div className="list">
            {sortedCallbacks.length === 0 && <Empty text="No hay rellamados en el historial." />}
            {sortedCallbacks.map((callback) => (
              <div className="row history-row" key={callback.id}>
                <div>
                  <strong>{callback.phone}</strong>
                  <span>Creado: {formatDateTime(callback.createdAt)}</span>
                </div>
                <div>
                  <span>{callback.dni || 'Sin DNI'}</span>
                  <span>{callback.accountNumber || 'Sin cuenta'}</span>
                </div>
                <div>
                  <strong>{callback.state}</strong>
                  <span>Recontacto: {formatDateTime(callback.recontactAt)}</span>
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
