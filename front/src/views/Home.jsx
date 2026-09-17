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
      <header className="topbar">
        <div>
          <h1>Principal</h1>
          <p>Rellamados pendientes, actividad reciente y metricas rapidas.</p>
        </div>
        <button className="primary" onClick={onRegister}>
          <Plus size={18} /> Registrar llamado
        </button>
      </header>

      <div className="search">
        <Search size={18} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por telefono, DNI, cuenta o estado"
        />
      </div>

      <MetricSummary metrics={metrics} />

      <section className="split">
        <div>
          <SectionTitle title="Rellamados pendientes" />
          <div className="list">
            {callbacks.length === 0 && <Empty text="No hay rellamados pendientes." />}
            {callbacks.map((callback) => (
              <div className="row" key={callback.id}>
                <div>
                  <strong>{callback.phone}</strong>
                  <span>{formatDateTime(callback.recontactAt)}</span>
                </div>
                <div>
                  <span>{callback.dni || 'Sin DNI'}</span>
                  <span>{callback.accountNumber || 'Sin cuenta'}</span>
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
          <div className="compact-list">
            {calls.slice(0, 6).map((call) => (
              <div className="compact-row" key={call.id}>
                <span>
                  {call.phone}
                  <small>{call.dni || 'Sin DNI'}</small>
                </span>
                <strong>{call.state}</strong>
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
