import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';

export function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-1.5 max-[560px]:justify-stretch">
      <button
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:border-blue-600 hover:text-blue-600 max-[560px]:flex-1"
        type="button"
        onClick={onEdit}
        title="Editar"
      >
        <Edit3 size={17} />
      </button>
      <button
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:border-red-600 hover:text-red-600 max-[560px]:flex-1"
        type="button"
        onClick={onDelete}
        title="Eliminar"
      >
        <Trash2 size={17} />
      </button>
    </div>
  );
}
