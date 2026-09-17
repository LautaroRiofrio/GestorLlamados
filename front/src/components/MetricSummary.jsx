import React from 'react';

export function MetricSummary({ metrics }) {
  const items = [
    ['Dia', metrics?.calls?.day?.total || 0],
    ['Semana', metrics?.calls?.week?.total || 0],
    ['Mes', metrics?.calls?.month?.total || 0],
    ['Rellamados pendientes', metrics?.callbacks?.pending || 0]
  ];

  return (
    <section className="my-5 grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3.5 xl:grid-cols-4">
      {items.map(([label, value]) => (
        <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-3.5 md:p-4" key={label}>
          <span className="text-slate-500">{label}</span>
          <strong className="mt-1.5 block text-[26px] leading-tight md:text-3xl">{value}</strong>
        </div>
      ))}
    </section>
  );
}
