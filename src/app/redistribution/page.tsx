'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, Check, X, Truck } from 'lucide-react';
import Shell from '@/components/Shell';

type R = { id: string; source: any; destination: any; medicine: string; quantity: number; distanceKm: number; impact: string; confidence: number };

export default function Redistribution() {
  const [rows, setRows]     = useState<R[]>([]);
  const [status, setStatus] = useState<Record<string, string>>({});
  const [error, setError]   = useState('');

  const approve = async (id: string) => {
    const r = await fetch('/api/redistribution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'ACCEPT' }),
    });
    if (r.ok) setStatus(s => ({ ...s, [id]: 'ACCEPTED · SIMULATED' }));
    else setError((await r.json()).error || 'Approval failed.');
  };

  useEffect(() => {
    fetch('/api/redistribution')
      .then(r => r.json())
      .then(setRows)
      .catch(() => setError('Recommendation service unavailable.'));
  }, []);

  return (
    <Shell title="Redistribution intelligence" sub="From AI recommendation to accountable operator approval">
      <div className="eyebrow">Recommend → human approval</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em', margin: '4px 0 8px' }}>Redistribution intelligence</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
        Recommendations are calculated from current stock, projected demand, reserve levels and simulated proximity.
      </p>

      {error && <div className="notice" style={{ marginBottom: 16 }}>{error}</div>}
      {!error && !rows.length && (
        <div className="panel bigcard">
          No transfer recommendations are currently indicated for the selected network state.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {rows.map(r => (
          <div className="panel" key={r.id}>
            <div className="panelhead">
              <h3><Truck size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />Transfer recommendation · {r.medicine}</h3>
              <span className={'badge ' + (status[r.id] ? '' : 'amber')}>{status[r.id] || 'PENDING REVIEW'}</span>
            </div>
            <div className="flow">
              <div className="flowbox">
                <div className="eyebrow">Source · surplus</div>
                <strong>{r.source.name}</strong>
                <span>{r.source.district} · {r.source.stock} units</span>
              </div>
              <div className="arrow"><ArrowRight /></div>
              <div className="flowbox">
                <div className="eyebrow">Destination · shortage</div>
                <strong>{r.destination.name}</strong>
                <span>{r.destination.district} · {r.destination.stock} units</span>
              </div>
            </div>
            <div className="minirow"><span>Quantity to transfer</span><b className="mono">{r.quantity} units</b></div>
            <div className="minirow"><span>Est. distance</span><b className="mono">{r.distanceKm} km</b></div>
            <div className="minirow"><span>Projected impact</span><b style={{ color: 'var(--teal)' }}>{r.impact}</b></div>
            <div className="minirow"><span>AI confidence</span><b>{r.confidence}%</b></div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              {!status[r.id] && (
                <button className="btn" onClick={() => approve(r.id)}>
                  <Check size={13} /> Approve transfer
                </button>
              )}
              <span className="notice" style={{ fontSize: 11, padding: '4px 10px' }}>
                Human approval required. AI recommendation only.
              </span>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}
