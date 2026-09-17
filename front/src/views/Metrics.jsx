import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { MetricSummary } from '../components/MetricSummary';
import { PieBlock } from '../components/PieBlock';
import { SectionTitle } from '../components/SectionTitle';

export function Metrics() {
  const [metrics, setMetrics] = useState(null);
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    async function loadData() {
      const [nextMetrics, nextCallsPage] = await Promise.all([api.metrics(), api.calls()]);
      setMetrics(nextMetrics);
      setCalls(nextCallsPage.items || []);
    }

    loadData().catch(console.error);
  }, []);

  return (
    <>
      <header className="mb-5 flex min-w-0 flex-col items-stretch gap-4 md:mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[26px] font-bold leading-tight md:text-[32px]">Metricas</h1>
          <p className="mt-1.5 text-sm text-slate-500 md:text-base">Resumen detallado de llamados y rellamados.</p>
        </div>
      </header>
      <MetricSummary metrics={metrics} />
      <section className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div>
          <SectionTitle title="Llamados del mes por estado" />
          <PieBlock data={metrics?.calls?.byStateMonth || []} />
        </div>
        <div>
          <SectionTitle title="Detalle operativo" />
          <div className="grid rounded-lg border border-slate-200 bg-white">
            <div className="flex flex-col items-start justify-between gap-1 border-b border-slate-200 px-4 py-3.5 sm:flex-row sm:gap-3"><span className="text-slate-500">Ventas hoy</span><strong>{metrics?.calls?.day?.ventas || 0}</strong></div>
            <div className="flex flex-col items-start justify-between gap-1 border-b border-slate-200 px-4 py-3.5 sm:flex-row sm:gap-3"><span className="text-slate-500">No ventas hoy</span><strong>{metrics?.calls?.day?.noVentas || 0}</strong></div>
            <div className="flex flex-col items-start justify-between gap-1 border-b border-slate-200 px-4 py-3.5 sm:flex-row sm:gap-3"><span className="text-slate-500">Ventas semana</span><strong>{metrics?.calls?.week?.ventas || 0}</strong></div>
            <div className="flex flex-col items-start justify-between gap-1 border-b border-slate-200 px-4 py-3.5 sm:flex-row sm:gap-3"><span className="text-slate-500">Ventas mes</span><strong>{metrics?.calls?.month?.ventas || 0}</strong></div>
            <div className="flex flex-col items-start justify-between gap-1 border-b border-slate-200 px-4 py-3.5 sm:flex-row sm:gap-3"><span className="text-slate-500">Rellamados vencidos hoy</span><strong>{metrics?.callbacks?.dueToday || 0}</strong></div>
            <div className="flex flex-col items-start justify-between gap-1 px-4 py-3.5 sm:flex-row sm:gap-3"><span className="text-slate-500">Total en busqueda</span><strong>{calls.length}</strong></div>
          </div>
        </div>
      </section>
    </>
  );
}
