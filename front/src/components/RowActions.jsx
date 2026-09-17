import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';

export function RowActions({ onEdit, onDelete }) {
  return (
    <div className="row-actions">
      <button className="icon-button" type="button" onClick={onEdit} title="Editar">
        <Edit3 size={17} />
      </button>
      <button className="icon-button danger" type="button" onClick={onDelete} title="Eliminar">
        <Trash2 size={17} />
      </button>
    </div>
  );
}
