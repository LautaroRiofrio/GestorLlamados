import React from 'react';

export function FormShell({ title, error, children }) {
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
