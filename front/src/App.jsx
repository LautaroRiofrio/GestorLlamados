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
    <main className="grid min-h-screen w-full grid-cols-1 bg-[#f5f7fb] text-[#182033] md:grid-cols-[260px_minmax(0,1fr)]">
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
