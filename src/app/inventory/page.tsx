'use client';
import { useEffect, useState } from 'react';
import { Search, Boxes } from 'lucide-react';
import Shell from '@/components/Shell';

export default function Inventory() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ]       = useState('');

  useEffect(() => {
    fetch('/api/phcs').then(r => r.json()).then((phcs: any[]) => {
      setRows(phcs.flatMap(p =>
        [1, 2, 3].map(i => ({
          ...p,
          id: `${p.id}-${i}`,
          medicine: i === 1 ? 'ORS' : i === 2 ? 'Paracetamol' : 'Amoxicillin',
          stock:    i === 1 ? p.stock : Math.round(p.stock * 1.4),
          daily:    i === 1 ? p.dailyUse : 9 + i,
        }))
      ));
    });
  }, []);

  const shown = rows.filter(r =>
    (r.name + r.medicine + r.district + r.region + r.country)
      .toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Shell title="Medicine intelligence" sub="Stock, consumption and days remaining">
      <div className="eyebrow">Resource visibility</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em', margin: '4px 0 8px' }}>Medicine intelligence</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
        Inventory position and forecast risk across the monitored PHC network.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div className="searchbox">
          <input
            placeholder="Search PHC, medicine, district or country…"
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{ width: 280 }}
          />
        </div>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{shown.length} records</span>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>PHC</th><th>Country</th><th>Medicine</th>
                <th>Current stock</th><th>Daily use</th><th>Days left</th><th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {shown.slice(0, 60).map(r => {
                const d = Math.round(r.stock / r.daily);
                return (
                  <tr key={r.id}>
                    <td><b>{r.name}</b><br /><small style={{ color: 'var(--muted)' }}>{r.district} · {r.region}</small></td>
                    <td><span className="alert-country-tag">{r.code}</span></td>
                    <td>{r.medicine}</td>
                    <td className="mono">{r.stock}</td>
                    <td className="mono">{r.daily}</td>
                    <td className={d < 7 ? 'critical' : d < 14 ? 'warning' : 'normal'}>{d}</td>
                    <td>
                      <span className={'badge ' + (d < 7 ? 'red' : d < 14 ? 'amber' : '')}>
                        {d < 7 ? 'CRITICAL' : d < 14 ? 'WARNING' : 'NORMAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
