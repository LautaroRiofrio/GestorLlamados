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
        <div className="success">
          Llamado guardado para {savedCall.phone}. Ahora podés continuar o registrar un rellamado con estos datos.
        </div>
      )}
      {!savedCall || editing ? (
        <div className="actions">
          <button className="primary" onClick={submit} disabled={saving}>
            <Check size={18} /> {editing ? 'Actualizar llamado' : 'Guardar llamado'}
          </button>
        </div>
      ) : (
        <div className="actions">
          <button className="secondary" type="button" onClick={onContinue}>
            Continuar
          </button>
          <button className="primary" type="button" onClick={() => onRegisterCallback(savedCall)}>
            Registrar rellamado
          </button>
        </div>
      )}
    </FormShell>
  );
}
