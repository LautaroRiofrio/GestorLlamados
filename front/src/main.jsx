import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart3, CalendarClock, Check, Edit3, Phone, Plus, Search, Trash2 } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from './api';
import './styles.css';

const emptyForm = {
  phone: '',
  dni: '',
  accountNumber: '',
  state: '',
  detail: ''
};

const colors = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#64748b'];

function App() {
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

function Home({
  callbacks,
  calls,
  metrics,
  search,
  setSearch,
  onRegister,
  onEditCall,
  onDeleteCall,
  onEditCallback,
  onDeleteCallback
}) {
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
                  onDelete={() => onDeleteCallback(callback)}
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
                  onDelete={() => onDeleteCall(call)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function MetricSummary({ metrics }) {
  const items = [
    ['Dia', metrics?.calls?.day?.total || 0],
    ['Semana', metrics?.calls?.week?.total || 0],
    ['Mes', metrics?.calls?.month?.total || 0],
    ['Rellamados pendientes', metrics?.callbacks?.pending || 0]
  ];

  return (
    <section className="metrics-grid">
      {items.map(([label, value]) => (
        <div className="metric" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </section>
  );
}

function Metrics({ metrics, calls }) {
  return (
    <>
      <header className="topbar">
        <div>
          <h1>Metricas</h1>
          <p>Resumen detallado de llamados y rellamados.</p>
        </div>
      </header>
      <MetricSummary metrics={metrics} />
      <section className="split">
        <div>
          <SectionTitle title="Llamados del mes por estado" />
          <PieBlock data={metrics?.calls?.byStateMonth || []} />
        </div>
        <div>
          <SectionTitle title="Detalle operativo" />
          <div className="table">
            <div><span>Ventas hoy</span><strong>{metrics?.calls?.day?.ventas || 0}</strong></div>
            <div><span>No ventas hoy</span><strong>{metrics?.calls?.day?.noVentas || 0}</strong></div>
            <div><span>Ventas semana</span><strong>{metrics?.calls?.week?.ventas || 0}</strong></div>
            <div><span>Ventas mes</span><strong>{metrics?.calls?.month?.ventas || 0}</strong></div>
            <div><span>Rellamados vencidos hoy</span><strong>{metrics?.callbacks?.dueToday || 0}</strong></div>
            <div><span>Total en busqueda</span><strong>{calls.length}</strong></div>
          </div>
        </div>
      </section>
    </>
  );
}

function CallForm({
  title = 'Registrar llamado',
  options,
  value,
  setValue,
  onSaved,
  onContinue,
  onRegisterCallback,
  editing = false
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedCall, setSavedCall] = useState(null);

  async function submit(event) {
    event.preventDefault();
    const confirmed = window.confirm('¿Confirmás que querés guardar este llamado?');
    if (!confirmed) return;

    setSaving(true);
    setError('');
    try {
      const call = editing ? await api.updateCall(value.id, value) : await api.createCall(value);
      setSavedCall(call);
      await onSaved(call);
    } catch (err) {
      setError(firstError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormShell title={title} error={error}>
      <BaseFields value={value} setValue={setValue} states={options.callStates} />
      {savedCall && !editing && (
        <div className="success">
          Llamado guardado para {savedCall.phone}. Ahora podés continuar o registrar un rellamado con estos datos.
        </div>
      )}
      {!savedCall || editing ? (
        <div className="actions">
          <button className="primary" onClick={submit} disabled={saving}>
            <Check size={18} /> {editing ? 'Actualizar llamado' : 'Guardar llamado'}
          </button>
        </div>
      ) : (
        <div className="actions">
          <button className="secondary" type="button" onClick={onContinue}>
            Continuar
          </button>
          <button className="primary" type="button" onClick={() => onRegisterCallback(savedCall)}>
            Registrar rellamado
          </button>
        </div>
      )}
    </FormShell>
  );
}

function RowActions({ onEdit, onDelete }) {
  return (
    <div className="row-actions">
      <button className="icon-button" type="button" onClick={onEdit} title="Editar">
        <Edit3 size={17} />
      </button>
      <button className="icon-button danger" type="button" onClick={onDelete} title="Eliminar">
        <Trash2 size={17} />
      </button>
    </div>
  );
}

function CallbackForm({ title, options, value, setValue, onSaved, editing = false }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const recontact = splitRecontactAt(value?.recontactAt);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.updateCallback(value.id, value);
      } else {
        await api.createCallback(value);
      }
      await onSaved();
    } catch (err) {
      setError(firstError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormShell title={title} error={error}>
      <BaseFields value={value} setValue={setValue} states={options.callbackStates} />
      <div className="datetime-pair">
        <label>
          Fecha de recontacto
          <input
            type="date"
            value={recontact.date}
            onChange={(event) =>
              setValue({ ...value, recontactAt: combineRecontactAt(event.target.value, recontact.time) })
            }
            required
          />
        </label>
        <label>
          Hora
          <select
            value={recontact.time}
            onChange={(event) =>
              setValue({ ...value, recontactAt: combineRecontactAt(recontact.date, event.target.value) })
            }
            required
          >
            {timeSlots().map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="actions">
        <button className="primary" onClick={submit} disabled={saving}>
          <Check size={18} /> Guardar rellamado
        </button>
      </div>
    </FormShell>
  );
}

function BaseFields({ value, setValue, states }) {
  return (
    <form className="form">
      <label>
        Numero telefono
        <input
          value={value?.phone || ''}
          onChange={(event) => setValue({ ...value, phone: event.target.value })}
          required
        />
      </label>
      <label>
        DNI
        <input value={value?.dni || ''} onChange={(event) => setValue({ ...value, dni: event.target.value })} />
      </label>
      <label>
        Numero cuenta
        <input
          value={value?.accountNumber || ''}
          onChange={(event) => setValue({ ...value, accountNumber: event.target.value })}
        />
      </label>
      <label>
        Estado
        <select
          value={value?.state || ''}
          onChange={(event) => setValue({ ...value, state: event.target.value })}
          required
        >
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </label>
      <label className="full">
        Detalle
        <textarea
          rows="5"
          value={value?.detail || ''}
          onChange={(event) => setValue({ ...value, detail: event.target.value })}
        />
      </label>
    </form>
  );
}

function FormShell({ title, error, children }) {
  return (
    <>
      <header className="topbar">
        <div>
          <h1>{title}</h1>
          <p>Completa los campos obligatorios para guardar el registro.</p>
        </div>
      </header>
      <section className="panel">
        {error && <div className="error">{error}</div>}
        {children}
      </section>
    </>
  );
}

function PieBlock({ data }) {
  const filtered = data.filter((item) => item.total > 0);
  if (filtered.length === 0) return <Empty text="Todavia no hay datos para graficar." />;

  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={filtered} dataKey="total" nameKey="state" outerRadius={95} label>
            {filtered.map((entry, index) => (
              <Cell key={entry.state} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function SectionTitle({ title }) {
  return <h2>{title}</h2>;
}

function Empty({ text }) {
  return <div className="empty">{text}</div>;
}

function defaultRecontactAt() {
  const date = new Date();
  date.setMinutes(date.getMinutes() < 30 ? 30 : 60, 0, 0);
  return toLocalInputValue(date.toISOString());
}

function splitRecontactAt(value) {
  const normalized = toLocalInputValue(value || defaultRecontactAt());
  const [date, time] = normalized.split('T');
  return { date, time: normalizeSlot(time) };
}

function combineRecontactAt(date, time) {
  if (!date || !time) return '';
  return `${date}T${normalizeSlot(time)}`;
}

function normalizeSlot(time) {
  if (!time) return '09:00';
  const [hour, minute] = time.split(':').map(Number);
  const nextMinute = minute < 30 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${nextMinute}`;
}

function timeSlots() {
  const slots = [];
  for (let hour = 0; hour < 24; hour += 1) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    slots.push(`${String(hour).padStart(2, '0')}:30`);
  }
  return slots;
}

function toLocalInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value));
}

function firstError(error) {
  if (error?.errors) return Object.values(error.errors)[0];
  return error?.message || 'No se pudo guardar.';
}

createRoot(document.getElementById('root')).render(<App />);
