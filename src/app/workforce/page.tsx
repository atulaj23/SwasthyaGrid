'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';

export default function Workforce() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { fetch('/api/dashboard').then(r => r.json()).then(setD); }, []);
  const staff   = d?.phcs.reduce((a: number, p: any) => a + p.staff, 0) ?? 0;
  const present = d?.phcs.reduce((a: number, p: any) => a + p.present, 0) ?? 0;
  const pct     = staff ? Math.round(present / staff * 100) : 0;

  return (
    <Shell title="Workforce availability" sub="Attendance and staffing readiness across the network">
      <div className="eyebrow">People operations</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em', margin: '4px 0 8px' }}>Workforce readiness</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
        Identify understaffed PHCs before demand pressure compounds.
      </p>

      <div className="grid3" style={{ marginBottom: 20 }}>
        <div className="panel stat">
          <label>Total staff</label>
          <strong>{staff.toLocaleString()}</strong>
          <small>across all PHCs</small>
        </div>
        <div className="panel stat">
          <label>Present today</label>
          <strong>{present.toLocaleString()}</strong>
          <small>reported attendance</small>
        </div>
        <div className={'panel stat ' + (pct < 75 ? 'kpi-red' : pct < 85 ? 'kpi-amber' : '')}>
          <label>Attendance rate</label>
          <strong>{pct}%</strong>
          <small>80% operational standard</small>
        </div>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="panelhead" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <h3>Facility workforce status</h3>
          <span className="panel-meta">{d?.phcs.length ?? 0} PHCs</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>PHC</th><th>Country</th><th>Staff</th>
                <th>Present</th><th>Absent</th><th>Attendance</th><th>Signal</th>
              </tr>
            </thead>
            <tbody>
              {(d?.phcs ?? []).map((p: any) => {
                const att = Math.round(p.present / p.staff * 100);
                return (
                  <tr key={p.id}>
                    <td><b>{p.name}</b><br /><small style={{ color: 'var(--muted)' }}>{p.district} · {p.region}</small></td>
                    <td><span className="alert-country-tag">{p.code}</span></td>
                    <td>{p.staff}</td>
                    <td>{p.present}</td>
                    <td>{p.staff - p.present}</td>
                    <td className={att < 75 ? 'critical' : att < 90 ? 'warning' : ''}>{att}%</td>
                    <td>
                      <span className={'badge ' + (att < 75 ? 'red' : att < 90 ? 'amber' : '')}>
                        {att < 75 ? 'CRITICAL' : att < 90 ? 'WARNING' : 'NORMAL'}
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
