import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { api } from '../api';
import { combineRecontactAt, splitRecontactAt, timeSlots } from '../utils/date';
import { firstError } from '../utils/errors';
import { BaseFields } from './BaseFields';
import { FormShell } from './FormShell';

export function CallbackForm({ title, options, value, setValue, onSaved, editing = false }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const recontact = splitRecontactAt(value?.recontactAt);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.updateCallback(value.id, value);
      } else {
        await api.createCallback(value);
      }
      await onSaved();
    } catch (err) {
      setError(firstError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormShell title={title} error={error}>
      <BaseFields value={value} setValue={setValue} states={options.callbackStates} />
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="grid gap-1.5 font-bold">
          Fecha de recontacto
          <input
            className="min-h-[42px] w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[#182033] outline-blue-600"
            type="date"
            value={recontact.date}
            onChange={(event) =>
              setValue({ ...value, recontactAt: combineRecontactAt(event.target.value, recontact.time) })
            }
            required
          />
        </label>
        <label className="grid gap-1.5 font-bold">
          Hora
          <select
            className="min-h-[42px] w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[#182033] outline-blue-600"
            value={recontact.time}
            onChange={(event) =>
              setValue({ ...value, recontactAt: combineRecontactAt(recontact.date, event.target.value) })
            }
            required
          >
            {timeSlots().map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-5 flex flex-col justify-end gap-2.5 md:flex-row">
        <button
          className="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-blue-600 px-3.5 py-2.5 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={submit}
          disabled={saving}
        >
          <Check size={18} /> Guardar rellamado
        </button>
      </div>
    </FormShell>
  );
}
