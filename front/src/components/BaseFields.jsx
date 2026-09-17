import React from 'react';

export function BaseFields({ value, setValue, states }) {
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
