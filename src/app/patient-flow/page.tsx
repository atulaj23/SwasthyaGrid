'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';

export default function PatientFlow() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { fetch('/api/dashboard').then(r => r.json()).then(setD); }, []);
  const today = d?.phcs.reduce((a: number, p: any) => a + p.footfall, 0) ?? 0;
  const base  = d?.phcs.reduce((a: number, p: any) => a + p.baseline, 0) ?? 1;
  const delta = Math.round((today / base - 1) * 100);

  return (
    <Shell title="Patient flow" sub="Footfall, baseline and surge signals across the BRICS network">
      <div className="eyebrow">Demand sensing</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em', margin: '4px 0 8px' }}>Patient flow</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
        Understand where patient volume is moving above the operational baseline.
      </p>

      <div className="grid3" style={{ marginBottom: 20 }}>
        <div className="panel stat">
          <label>Today's footfall</label>
          <strong>{today.toLocaleString()}</strong>
          <small>all PHCs combined</small>
        </div>
        <div className="panel stat">
          <label>Network baseline</label>
          <strong>{base.toLocaleString()}</strong>
          <small>expected daily volume</small>
        </div>
        <div className={'panel stat ' + (delta > 25 ? 'kpi-red' : delta > 10 ? 'kpi-amber' : '')}>
          <label>vs baseline</label>
          <strong>{delta > 0 ? '+' : ''}{delta}%</strong>
          <small>threshold: +25%</small>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panelhead">
          <h3>Operational interpretation</h3>
        </div>
        <div className="notice">
          <b>Patient volume {delta > 0 ? '+' : ''}{delta}% {delta > 0 ? 'above' : 'below'} baseline</b><br />
          {delta > 25
            ? 'Surge detected. Review medicine, bed and staff readiness together before reallocating resources.'
            : delta > 10
            ? 'Elevated volume. Monitor trends and prepare contingency plans.'
            : 'Volume within normal operating range. Continue routine monitoring.'
          }
        </div>
        {/* Bar chart */}
        <div className="bars" style={{ height: 180, marginTop: 20 }}>
          {(d?.phcs ?? []).slice(0, 20).map((p: any) => (
            <i
              key={p.id}
              className={'bar ' + (p.footfall / p.baseline > 1.25 ? 'hot' : '')}
              title={`${p.name}: ${Math.round(p.footfall / p.baseline * 100)}% of baseline`}
              style={{ height: Math.min(100, p.footfall / p.baseline * 60) + '%' }}
            />
          ))}
        </div>
        <p style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 8 }}>
          Each bar = one PHC. Red = above 125% of local baseline. Showing first 20.
        </p>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="panelhead" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <h3>Facility patient flow detail</h3>
          <span className="panel-meta">{d?.phcs.length ?? 0} PHCs</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>PHC</th><th>Country</th><th>Today</th><th>Baseline</th><th>vs Baseline</th><th>Signal</th>
              </tr>
            </thead>
            <tbody>
              {[...(d?.phcs ?? [])].sort((a: any, b: any) => b.footfall / b.baseline - a.footfall / a.baseline).map((p: any) => {
                const ratio = Math.round(p.footfall / p.baseline * 100);
                const surge = p.footfall > p.baseline * 1.25;
                return (
                  <tr key={p.id}>
                    <td><b>{p.name}</b><br /><small style={{ color: 'var(--muted)' }}>{p.district} · {p.region}</small></td>
                    <td><span className="alert-country-tag">{p.code}</span></td>
                    <td>{p.footfall}</td>
                    <td>{p.baseline}</td>
                    <td className={surge ? 'critical' : ratio > 110 ? 'warning' : ''}>{ratio}%</td>
                    <td>
                      <span className={'badge ' + (surge ? 'red' : ratio > 110 ? 'amber' : '')}>
                        {surge ? 'SURGE' : ratio > 110 ? 'ELEVATED' : 'NORMAL'}
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
