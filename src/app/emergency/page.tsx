'use client';
import { useEffect, useState } from 'react';
import { Flame, RefreshCw } from 'lucide-react';
import Shell from '@/components/Shell';

export default function Emergency() {
  const [active,   setActive]   = useState(false);
  const [scenario, setScenario] = useState('flood');
  const [state,    setState]    = useState<any>(null);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => {
      setActive(d.emergency.active);
      setScenario(d.emergency.scenario || 'flood');
      setState(d);
    });
  }, []);

  const run = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active, scenario }),
      });
      const d = await r.json();
      setState(d);
      setActive(d.emergency.active);
    } finally {
      setLoading(false);
    }
  };

  const phcs    = state?.phcs ?? [];
  const network = state?.network;

  return (
    <Shell
      title={active ? 'Emergency response mode' : 'Emergency readiness'}
      sub="Scenario simulation changes demand, capacity and warning conditions"
      actions={
        <span className={'demo ' + (active ? 'emergencyDemo' : '')}>
          {active ? 'EMERGENCY ACTIVE' : 'NORMAL OPS'} · SIMULATED
        </span>
      }
    >
      <div className="eyebrow">Respond</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em', margin: '4px 0 8px' }}>
        {active ? 'Emergency response mode' : 'Emergency readiness'}
      </h2>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
        Activate a scenario to recalculate the operating picture across the network.
      </p>

      {active && (
        <div className="emergencyBand" style={{ marginBottom: 20 }}>
          <span className="emergencyMark">!</span>
          <div className="emergency-body">
            <b>EMERGENCY RESPONSE MODE ACTIVE</b>
            <span>{scenario.toUpperCase()} · demand ×{state?.emergency?.multiplier?.toFixed(1)} · readiness {state?.emergency?.readiness}/100</span>
          </div>
        </div>
      )}

      <div className="grid2" style={{ marginBottom: 20 }}>
        <div className="panel">
          <div className="panelhead">
            <h3><Flame size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />Scenario control</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>
              Scenario type
              <select
                className="control"
                value={scenario}
                onChange={e => setScenario(e.target.value)}
                style={{ display: 'block', marginTop: 4, width: '100%' }}
              >
                <option value="flood">Flood</option>
                <option value="dengue">Dengue outbreak</option>
                <option value="respiratory">Respiratory surge</option>
                <option value="general">General emergency</option>
              </select>
            </label>
            <button
              className={'btn ' + (active ? 'danger' : '')}
              onClick={run}
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? <RefreshCw size={13} className="spin" /> : <Flame size={13} />}
              {active ? 'Deactivate response mode' : 'Activate scenario'}
            </button>
            <div className="notice" style={{ fontSize: 11 }}>
              Activating a scenario changes demand multipliers, warning thresholds and readiness scores across the entire BRICS network for demonstration purposes.
            </div>
          </div>
        </div>

        {network && (
          <div className="panel">
            <div className="panelhead"><h3>Network impact</h3></div>
            <div className="metricgrid">
              <div className="metric">
                <label>Total PHCs</label>
                <strong>{network.total}</strong>
              </div>
              <div className="metric">
                <label>Critical</label>
                <strong className="critical">{network.critical}</strong>
              </div>
              <div className="metric">
                <label>Bed pressure</label>
                <strong className="warning">{network.bedPressure}</strong>
              </div>
              <div className="metric">
                <label>Stock-out risks</label>
                <strong className="critical">{network.stockoutRisks}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {phcs.length > 0 && (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="panelhead" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <h3>Affected PHC status</h3>
            <span className={'panel-meta' + (active ? ' has-alerts' : '')}>{phcs.filter((p: any) => p.status === 'CRITICAL').length} critical</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr><th>PHC</th><th>Country</th><th>Status</th><th>Bed occ.</th><th>Staff</th><th>Medicine</th></tr>
              </thead>
              <tbody>
                {phcs.filter((p: any) => p.status !== 'NORMAL').slice(0, 20).map((p: any) => (
                  <tr key={p.id}>
                    <td><b>{p.name}</b><br /><small style={{ color: 'var(--muted)' }}>{p.district}</small></td>
                    <td><span className="alert-country-tag">{p.code}</span></td>
                    <td><span className={'badge ' + (p.status === 'CRITICAL' ? 'red' : 'amber')}>{p.status}</span></td>
                    <td className={p.occupied / p.beds > .85 ? 'critical' : p.occupied / p.beds > .7 ? 'warning' : ''}>
                      {Math.round(p.occupied / p.beds * 100)}%
                    </td>
                    <td>{Math.round(p.present / p.staff * 100)}%</td>
                    <td>{p.medicine}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Shell>
  );
}
