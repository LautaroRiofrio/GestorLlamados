import React from 'react';

export function FormShell({ title, error, children }) {
  return (
    <>
      <header className="mb-5 flex min-w-0 flex-col items-stretch gap-4 md:mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[26px] font-bold leading-tight md:text-[32px]">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-500 md:text-base">Completa los campos obligatorios para guardar el registro.</p>
        </div>
      </header>
      <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-3.5 md:p-5">
        {error && <div className="mb-3.5 rounded-lg bg-red-100 p-3.5 text-red-800">{error}</div>}
        {children}
      </section>
    </>
  );
}
