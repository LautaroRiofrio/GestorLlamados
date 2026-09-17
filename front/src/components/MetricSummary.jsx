import React from 'react';

export function MetricSummary({ metrics }) {
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
