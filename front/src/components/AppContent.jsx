import React, { useEffect, useState } from 'react';
import { CallbackForm } from './CallbackForm';
import { CallForm } from './CallForm';
import { History } from '../views/History';
import { Home } from '../views/Home';
import { Metrics } from '../views/Metrics';

const emptyForm = {
  phone: '',
  dni: '',
  accountNumber: '',
  state: '',
  detail: ''
};

export function AppContent({
  route,
  options,
  onRegisterCall,
  onRegisterCallback,
  onEditCall,
  onEditCallback,
  onFormDone
}) {
  const view = route.name;

  return (
    <section className="min-w-0 w-full max-w-none p-4 sm:p-5 md:max-w-[1280px] md:p-8">
      {view === 'home' && (
        <Home
          onRegister={onRegisterCall}
          onEditCall={onEditCall}
          onEditCallback={onEditCallback}
        />
      )}
      {view === 'metrics' && <Metrics />}
      {view === 'history' && (
        <History
          onEditCall={onEditCall}
          onEditCallback={onEditCallback}
        />
      )}
      {view === 'call' && <RegisterCallView options={options} onSaved={onFormDone} onRegisterCallback={onRegisterCallback} />}
      {view === 'editCall' && <EditCallView call={route.call} options={options} onSaved={onFormDone} />}
      {view === 'callback' && <CallbackView callback={route.callback} options={options} onSaved={onFormDone} />}
      {view === 'editCallback' && (
        <CallbackView callback={route.callback} options={options} onSaved={onFormDone} editing />
      )}
    </section>
  );
}

function RegisterCallView({ options, onSaved, onRegisterCallback }) {
  const [draftCall, setDraftCall] = useState({ ...emptyForm, state: options.callStates[0] || '' });

  useEffect(() => {
    if (!draftCall.state && options.callStates.length > 0) {
      setDraftCall((current) => ({ ...current, state: current.state || options.callStates[0] }));
    }
  }, [draftCall.state, options.callStates]);

  return (
    <CallForm
      options={options}
      value={draftCall}
      setValue={setDraftCall}
      onSaved={setDraftCall}
      onContinue={onSaved}
      onRegisterCallback={onRegisterCallback}
    />
  );
}

function EditCallView({ call, options, onSaved }) {
  const [editingCall, setEditingCall] = useState(call);

  return (
    <CallForm
      title="Editar llamado"
      options={options}
      value={editingCall}
      setValue={setEditingCall}
      onSaved={onSaved}
      onContinue={onSaved}
      editing
    />
  );
}

function CallbackView({ callback, options, onSaved, editing = false }) {
  const [editingCallback, setEditingCallback] = useState(callback);

  return (
    <CallbackForm
      title={editing ? 'Editar rellamado' : 'Registrar rellamado'}
      options={options}
      value={editingCallback}
      setValue={setEditingCallback}
      onSaved={onSaved}
      editing={editing}
    />
  );
}
