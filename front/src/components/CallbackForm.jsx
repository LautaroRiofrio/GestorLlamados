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
      <div className="datetime-pair">
        <label>
          Fecha de recontacto
          <input
            type="date"
            value={recontact.date}
            onChange={(event) =>
              setValue({ ...value, recontactAt: combineRecontactAt(event.target.value, recontact.time) })
            }
            required
          />
        </label>
        <label>
          Hora
          <select
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
      <div className="actions">
        <button className="primary" onClick={submit} disabled={saving}>
          <Check size={18} /> Guardar rellamado
        </button>
      </div>
    </FormShell>
  );
}
