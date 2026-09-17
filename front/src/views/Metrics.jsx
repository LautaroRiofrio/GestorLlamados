import React from 'react';
import { MetricSummary } from '../components/MetricSummary';
import { PieBlock } from '../components/PieBlock';
import { SectionTitle } from '../components/SectionTitle';

export function Metrics({ metrics, calls }) {
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
