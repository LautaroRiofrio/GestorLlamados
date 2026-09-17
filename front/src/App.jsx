import React, { useEffect, useState } from 'react';
import { BarChart3, CalendarClock, Phone, Plus } from 'lucide-react';
import { api } from './api';
import { CallbackForm } from './components/CallbackForm';
import { CallForm } from './components/CallForm';
import { defaultRecontactAt } from './utils/date';
import { Home } from './views/Home';
import { Metrics } from './views/Metrics';

const emptyForm = {
  phone: '',
  dni: '',
  accountNumber: '',
  state: '',
  detail: ''
};

export function App() {
  const [view, setView] = useState('home');
  const [options, setOptions] = useState({ callStates: [], callbackStates: [] });
  const [search, setSearch] = useState('');
  const [callbacks, setCallbacks] = useState([]);
  const [calls, setCalls] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [draftCall, setDraftCall] = useState(emptyForm);
  const [editingCall, setEditingCall] = useState(null);
  const [editingCallback, setEditingCallback] = useState(null);

  async function loadData() {
    const [nextOptions, nextCallbacksPage, nextCallsPage, nextMetrics] = await Promise.all([
      api.options(),
      api.callbacks({ pending: true, q: search }),
      api.calls({ q: search }),
      api.metrics()
    ]);
    setOptions(nextOptions);
    setCallbacks(nextCallbacksPage.items || []);
    setCalls(nextCallsPage.items || []);
    setMetrics(nextMetrics);
  }

  useEffect(() => {
    loadData().catch(console.error);
  }, [search]);

  function goRegisterCall() {
    setDraftCall({ ...emptyForm, state: options.callStates[0] || '' });
    setView('call');
  }

  function goRegisterCallback(source = draftCall) {
    setEditingCallback({
      ...source,
      state: 'pendiente',
      recontactAt: defaultRecontactAt(),
      sourceCallId: source.id || null
    });
    setView('callback');
  }

  function goEditCallback(callback) {
    setEditingCallback(callback);
    setView('editCallback');
  }

  function goEditCall(call) {
    setEditingCall(call);
    setView('editCall');
  }

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
    <main className="app">
      <aside className="sidebar">
        <div className="brand">
          <Phone size={22} />
          <span>Gestor llamados</span>
        </div>
        <button className={view === 'home' ? 'nav active' : 'nav'} onClick={() => setView('home')}>
          <CalendarClock size={18} /> Principal
        </button>
        <button className={view === 'metrics' ? 'nav active' : 'nav'} onClick={() => setView('metrics')}>
          <BarChart3 size={18} /> Metricas
        </button>
        <button className="primary" onClick={goRegisterCall}>
          <Plus size={18} /> Registrar llamado
        </button>
      </aside>

      <section className="content">
        {view === 'home' && (
          <Home
            callbacks={callbacks}
            calls={calls}
            metrics={metrics}
            search={search}
            setSearch={setSearch}
            onRegister={goRegisterCall}
            onEditCall={goEditCall}
            onDeleteCall={deleteCall}
            onEditCallback={goEditCallback}
            onDeleteCallback={deleteCallback}
          />
        )}
        {view === 'metrics' && <Metrics metrics={metrics} calls={calls} />}
        {view === 'call' && (
          <CallForm
            options={options}
            value={draftCall}
            setValue={setDraftCall}
            onSaved={async (call) => {
              setDraftCall(call);
              await loadData();
            }}
            onContinue={() => setView('home')}
            onRegisterCallback={(call) => goRegisterCallback(call)}
          />
        )}
        {view === 'editCall' && (
          <CallForm
            title="Editar llamado"
            options={options}
            value={editingCall}
            setValue={setEditingCall}
            onSaved={async () => {
              await loadData();
              setView('home');
            }}
            onContinue={() => setView('home')}
            editing
          />
        )}
        {view === 'callback' && (
          <CallbackForm
            title="Registrar rellamado"
            options={options}
            value={editingCallback}
            setValue={setEditingCallback}
            onSaved={async () => {
              await loadData();
              setView('home');
            }}
          />
        )}
        {view === 'editCallback' && (
          <CallbackForm
            title="Editar rellamado"
            options={options}
            value={editingCallback}
            setValue={setEditingCallback}
            onSaved={async () => {
              await loadData();
              setView('home');
            }}
            editing
          />
        )}
      </section>
    </main>
  );
}
