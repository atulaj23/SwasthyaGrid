'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';

export default function Beds() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { fetch('/api/dashboard').then(r => r.json()).then(setD); }, []);
  const total = d?.phcs.reduce((a: number, p: any) => a + p.beds, 0) ?? 0;
  const occ   = d?.phcs.reduce((a: number, p: any) => a + p.occupied, 0) ?? 0;
  const bedPct = total ? Math.round(occ / total * 100) : 0;

  return (
    <Shell title="Bed capacity" sub="Capacity pressure across the PHC network">
      <div className="eyebrow">Network capacity</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em', margin: '4px 0 8px' }}>Bed capacity</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
        Monitor available capacity before local pressure becomes a system constraint.
      </p>

      <div className="grid3" style={{ marginBottom: 20 }}>
        <div className="panel stat">
          <label>Total beds</label>
          <strong>{total.toLocaleString()}</strong>
          <small>BRICS network</small>
        </div>
        <div className={'panel stat ' + (bedPct > 85 ? 'kpi-red' : bedPct > 70 ? 'kpi-amber' : '')}>
          <label>Occupied</label>
          <strong>{occ.toLocaleString()}</strong>
          <small>{bedPct}% occupancy rate</small>
        </div>
        <div className="panel stat">
          <label>Available</label>
          <strong>{(total - occ).toLocaleString()}</strong>
          <small>free beds</small>
        </div>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="panelhead" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <h3>Facility bed status</h3>
          <span className="panel-meta">{d?.phcs.length ?? 0} PHCs</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>PHC</th><th>Country</th><th>Total</th>
                <th>Occupied</th><th>Available</th><th>Occupancy</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(d?.phcs ?? []).map((p: any) => {
                const pct = Math.round(p.occupied / p.beds * 100);
                return (
                  <tr key={p.id}>
                    <td><b>{p.name}</b><br /><small style={{ color: 'var(--muted)' }}>{p.district} · {p.region}</small></td>
                    <td><span className="alert-country-tag">{p.code}</span></td>
                    <td>{p.beds}</td>
                    <td>{p.occupied}</td>
                    <td>{p.beds - p.occupied}</td>
                    <td className={pct > 85 ? 'critical' : pct > 70 ? 'warning' : ''}>{pct}%</td>
                    <td>
                      <span className={'badge ' + (pct > 85 ? 'red' : pct > 70 ? 'amber' : '')}>
                        {pct > 85 ? 'CRITICAL' : pct > 70 ? 'WARNING' : 'NORMAL'}
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
