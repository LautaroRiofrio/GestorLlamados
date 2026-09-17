import React, { useEffect, useState } from 'react';
import { api } from './api';
import { AppContent } from './components/AppContent';
import { AppSidebar } from './components/AppSidebar';
import { defaultRecontactAt } from './utils/date';

export function App() {
  const [route, setRoute] = useState({ name: 'home' });
  const [options, setOptions] = useState({ callStates: [], callbackStates: [] });

  async function loadOptions() {
    const nextOptions = await api.options();
    setOptions(nextOptions);
  }

  useEffect(() => {
    loadOptions().catch(console.error);
  }, []);

  function goHome() {
    setRoute({ name: 'home' });
  }

  function goRegisterCall() {
    setRoute({ name: 'call' });
  }

  function goRegisterCallback(source) {
    setRoute({
      name: 'callback',
      callback: {
        ...source,
        state: 'pendiente',
        recontactAt: defaultRecontactAt(),
        sourceCallId: source.id || null
      }
    });
  }

  function goEditCallback(callback) {
    setRoute({ name: 'editCallback', callback });
  }

  function goEditCall(call) {
    setRoute({ name: 'editCall', call });
  }

  return (
    <main className="app">
      <AppSidebar view={route.name} onNavigate={(name) => setRoute({ name })} onRegisterCall={goRegisterCall} />
      <AppContent
        route={route}
        options={options}
        onRegisterCall={goRegisterCall}
        onRegisterCallback={goRegisterCallback}
        onEditCall={goEditCall}
        onEditCallback={goEditCallback}
        onFormDone={goHome}
      />
    </main>
  );
}
