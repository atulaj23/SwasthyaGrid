'use client';
import { useEffect, useState } from 'react';
import { Play, ShieldCheck, Globe2 } from 'lucide-react';
import Shell from '@/components/Shell';

export default function Federated() {
  const [s, setS] = useState<any>(null);
  const load = () => fetch('/api/federated').then(r => r.json()).then(setS);
  useEffect(() => { load(); }, []);

  if (!s) return (
    <Shell title="BRICS federated AI" sub="Collaborative modelling without moving raw healthcare data">
      <div className="panel bigcard">Loading federated ring…</div>
    </Shell>
  );

  return (
    <Shell
      title="BRICS federated AI"
      sub="Collaborative modelling without moving raw healthcare data"
      actions={
        <button
          className="btn"
          onClick={() => fetch('/api/federated', { method: 'POST' }).then(r => r.json()).then(setS)}
        >
          <Play size={13} /> Start training round
        </button>
      }
    >
      <div className="eyebrow">Intelligence · federated learning</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em', margin: '4px 0 8px' }}>Local models. Shared resilience.</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
        A simulated FedAvg demonstration. Only model updates are shared; no real BRICS system is connected.
      </p>

      {/* Global accuracy */}
      <div className="kpistrip" style={{ marginBottom: 20 }}>
        <div className="kpi">
          <label>Global model</label>
          <strong>{s.global}%</strong>
          <small>accuracy</small>
        </div>
        <div className="kpi kpi-divider">
          <label>Training round</label>
          <strong>{s.round}</strong>
          <small>federated aggregation</small>
        </div>
        <div className="kpi kpi-divider">
          <label>Active nodes</label>
          <strong>5</strong>
          <small>IN · BR · RU · CN · ZA</small>
        </div>
        <div className="kpi kpi-divider">
          <label>Privacy model</label>
          <strong>FedAvg</strong>
          <small>data stays local</small>
        </div>
      </div>

      {/* Node cards */}
      <div className="grid2" style={{ marginBottom: 20 }}>
        {s.nodes.map((n: any, i: number) => (
          <div key={i} className="panel">
            <div className="panelhead">
              <h3><Globe2 size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />{n.country}</h3>
              <span className={'badge ' + (n.status === 'COMPLETED' ? '' : 'amber')}>{n.status}</span>
            </div>
            <div className="minirow"><span>Local accuracy</span><b>{n.accuracy}%</b></div>
            <div className="minirow"><span>Samples</span><b className="mono">{(n.samples ?? n.records ?? 0).toLocaleString()}</b></div>
            <div className="minirow"><span>Node status</span><b>{n.status}</b></div>
            <div className="progress" style={{ marginTop: 8 }}>
              <i style={{ width: n.accuracy + '%', background: 'var(--teal)' }} />
            </div>
          </div>
        ))}
      </div>

      {/* History sparkline */}
      {s.history.length > 1 && (
        <div className="panel">
          <div className="panelhead"><h3>Accuracy history</h3><span className="panel-meta">Round {s.round}</span></div>
          <div className="linechart" style={{ height: 100 }}>
            <svg viewBox="0 0 300 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <polyline
                points={s.history.map((v: number, i: number) =>
                  `${(i / (s.history.length - 1)) * 300},${100 - (v / 100) * 90}`
                ).join(' ')}
                fill="none" stroke="#176b60" strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      )}

      <div className="notice" style={{ marginTop: 20, fontSize: 11 }}>
        <b>SIMULATED FEDERATED LEARNING:</b> This demo uses a FedAvg-style protocol simulation. No real healthcare data is transmitted. In a real deployment, only encrypted model gradient updates would be shared between country nodes.
      </div>
    </Shell>
  );
}
