import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { api } from '../api';
import { firstError } from '../utils/errors';
import { BaseFields } from './BaseFields';
import { FormShell } from './FormShell';

export function CallForm({
  title = 'Registrar llamado',
  options,
  value,
  setValue,
  onSaved,
  onContinue,
  onRegisterCallback,
  editing = false
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedCall, setSavedCall] = useState(null);

  async function submit(event) {
    event.preventDefault();
    const confirmed = window.confirm('¿Confirmás que querés guardar este llamado?');
    if (!confirmed) return;

    setSaving(true);
    setError('');
    try {
      const call = editing ? await api.updateCall(value.id, value) : await api.createCall(value);
      setSavedCall(call);
      await onSaved(call);
    } catch (err) {
      setError(firstError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormShell title={title} error={error}>
      <BaseFields value={value} setValue={setValue} states={options.callStates} />
      {savedCall && !editing && (
        <div className="mt-4 rounded-lg bg-green-100 p-3.5 text-green-800">
          Llamado guardado para {savedCall.phone}. Ahora podés continuar o registrar un rellamado con estos datos.
        </div>
      )}
      {!savedCall || editing ? (
        <div className="mt-5 flex flex-col justify-end gap-2.5 md:flex-row">
          <button
            className="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-blue-600 px-3.5 py-2.5 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={submit}
            disabled={saving}
          >
            <Check size={18} /> {editing ? 'Actualizar llamado' : 'Guardar llamado'}
          </button>
        </div>
      ) : (
        <div className="mt-5 flex flex-col justify-end gap-2.5 md:flex-row">
          <button
            className="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-slate-200 px-3.5 py-2.5 font-bold text-slate-900 transition hover:bg-slate-300"
            type="button"
            onClick={onContinue}
          >
            Continuar
          </button>
          <button
            className="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-blue-600 px-3.5 py-2.5 font-bold text-white transition hover:bg-blue-700"
            type="button"
            onClick={() => onRegisterCallback(savedCall)}
          >
            Registrar rellamado
          </button>
        </div>
      )}
    </FormShell>
  );
}
