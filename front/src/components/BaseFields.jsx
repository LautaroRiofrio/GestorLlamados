import React from 'react';

export function BaseFields({ value, setValue, states }) {
  return (
    <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <label className="grid gap-1.5 font-bold">
        Numero telefono
        <input
          className="min-h-[42px] w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[#182033] outline-blue-600"
          value={value?.phone || ''}
          onChange={(event) => setValue({ ...value, phone: event.target.value })}
          required
        />
      </label>
      <label className="grid gap-1.5 font-bold">
        DNI
        <input
          className="min-h-[42px] w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[#182033] outline-blue-600"
          value={value?.dni || ''}
          onChange={(event) => setValue({ ...value, dni: event.target.value })}
        />
      </label>
      <label className="grid gap-1.5 font-bold">
        Numero cuenta
        <input
          className="min-h-[42px] w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[#182033] outline-blue-600"
          value={value?.accountNumber || ''}
          onChange={(event) => setValue({ ...value, accountNumber: event.target.value })}
        />
      </label>
      <label className="grid gap-1.5 font-bold">
        Estado
        <select
          className="min-h-[42px] w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[#182033] outline-blue-600"
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
      <label className="grid gap-1.5 font-bold md:col-span-2">
        Detalle
        <textarea
          className="min-h-[42px] w-full min-w-0 resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[#182033] outline-blue-600"
          rows="5"
          value={value?.detail || ''}
          onChange={(event) => setValue({ ...value, detail: event.target.value })}
        />
      </label>
    </form>
  );
}
