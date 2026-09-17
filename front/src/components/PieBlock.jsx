import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Empty } from './Empty';

const colors = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#64748b'];

export function PieBlock({ data }) {
  const filtered = data.filter((item) => item.total > 0);
  if (filtered.length === 0) return <Empty text="Todavia no hay datos para graficar." />;

  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={filtered} dataKey="total" nameKey="state" outerRadius={95} label>
            {filtered.map((entry, index) => (
              <Cell key={entry.state} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
