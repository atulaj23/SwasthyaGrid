'use client';
import { useEffect, useState } from 'react';
import { BrainCircuit, RefreshCw } from 'lucide-react';
import Shell from '@/components/Shell';

type F = {
  phcName: string; medicine: string; currentStock: number;
  dailyConsumption: number; forecast: number[];
  projectedDemand: number; deficit: number;
  daysRemaining: number | null; risk: string; explanation: string;
};

export default function Forecasting() {
  const [h, setH]         = useState(7);
  const [f, setF]         = useState<F | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    fetch(`/api/forecast?phcId=2&horizon=${h}`)
      .then(r => { if (!r.ok) throw Error(); return r.json(); })
      .then(setF)
      .catch(() => setError('Forecast service unavailable. Retry the request.'));
  };

  useEffect(load, [h]);

  return (
    <Shell title="Explainable demand forecast" sub="Mathematical projection for operational planning — not a clinical prediction.">
      <div className="eyebrow">Predict</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em', margin: '4px 0 8px' }}>Explainable demand forecast</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
        Mathematical projection for operational planning — not a clinical prediction.
      </p>

      {error ? (
        <div className="panel bigcard">
          <h3>Unable to calculate forecast</h3>
          <p>{error}</p>
          <button className="btn" onClick={load} style={{ marginTop: 12 }}>Retry</button>
        </div>
      ) : !f ? (
        <div className="panel bigcard">
          <RefreshCw size={16} className="spin" style={{ marginRight: 8 }} />
          Calculating from operational telemetry…
        </div>
      ) : (
        <>
          {/* KPI strip */}
          <div className="kpistrip" style={{ marginBottom: 20 }}>
            <div className="kpi">
              <label>Current stock</label>
              <strong>{f.currentStock}</strong>
              <small>units</small>
            </div>
            <div className="kpi kpi-divider">
              <label>Projected {h}-day demand</label>
              <strong>{f.projectedDemand}</strong>
              <small>units</small>
            </div>
            <div className={'kpi kpi-divider' + (f.deficit > 0 ? ' kpi-red' : '')}>
              <label>Expected deficit</label>
              <strong className={f.deficit > 0 ? 'critical' : 'normal'}>{f.deficit}</strong>
              <small>units</small>
            </div>
            <div className={'kpi kpi-divider' + (f.daysRemaining !== null && f.daysRemaining < 7 ? ' kpi-red' : f.daysRemaining !== null && f.daysRemaining < 14 ? ' kpi-amber' : '')}>
              <label>Stock-out in</label>
              <strong className={f.daysRemaining !== null && f.daysRemaining < 7 ? 'critical' : 'warning'}>
                {f.daysRemaining === null ? '—' : f.daysRemaining}
              </strong>
              <small>{f.daysRemaining !== null ? 'days' : 'not projected'}</small>
            </div>
          </div>

          <div className="grid2" style={{ marginBottom: 20 }}>
            {/* Forecast result */}
            <div className="panel">
              <div className="panelhead">
                <h3><BrainCircuit size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />{f.phcName} · {f.medicine}</h3>
                <span className={'badge ' + (f.risk === 'CRITICAL' ? 'red' : f.risk === 'WARNING' ? 'amber' : '')}>{f.risk}</span>
              </div>
              <div className="minirow"><span>Daily consumption</span><b className="mono">{f.dailyConsumption} units/day</b></div>
              <div className="minirow"><span>Projected demand ({h}d)</span><b className="mono">{f.projectedDemand} units</b></div>
              <div className="minirow"><span>Expected deficit</span><b className={f.deficit > 0 ? 'critical' : 'normal'}>{f.deficit} units</b></div>
              <div className="minirow"><span>Stock-out</span><b className={f.daysRemaining !== null && f.daysRemaining < 7 ? 'critical' : 'warning'}>{f.daysRemaining === null ? 'Not projected' : `${f.daysRemaining} days`}</b></div>
              <div style={{ marginTop: 10 }}>
                <span className={'badge ' + (f.risk === 'CRITICAL' ? 'red' : f.risk === 'WARNING' ? 'amber' : '')}>
                  {f.risk} · HUMAN VERIFICATION REQUIRED
                </span>
              </div>
            </div>

            {/* Horizon selector */}
            <div className="panel">
              <div className="panelhead"><h3>Forecast horizon</h3></div>
              <div className="controls" style={{ marginBottom: 16 }}>
                {[7, 14, 21, 30].map(d => (
                  <button
                    key={d}
                    className={'btn ' + (h === d ? '' : 'secondary')}
                    style={{ padding: '5px 12px', fontSize: 12 }}
                    onClick={() => setH(d)}
                  >
                    {d} days
                  </button>
                ))}
              </div>

              {/* Forecast bars */}
              <div className="bars" style={{ height: 120 }}>
                {f.forecast.map((v, i) => {
                  const pct = Math.min(100, Math.round(v / Math.max(...f.forecast) * 100));
                  return (
                    <i
                      key={i}
                      className="bar"
                      style={{ height: Math.max(4, pct) + '%', background: v < 50 ? '#c0392b' : v < 150 ? '#c27621' : '#9ecfc5' }}
                      title={`Day ${i + 1}: ${v} units`}
                    />
                  );
                })}
              </div>
              <p style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 6 }}>Projected daily consumption ({h} days). Red = critical.</p>
            </div>
          </div>

          {/* Explanation */}
          <div className="panel">
            <div className="panelhead"><h3>AI explanation</h3></div>
            <div className="notice">{f.explanation}</div>
            <div className="notice" style={{ marginTop: 8, fontSize: 11 }}>
              HUMAN VERIFICATION REQUIRED: This forecast is generated from simulated operational telemetry. It does not represent a clinical or government prediction. All redistribution decisions require qualified operator approval.
            </div>
          </div>
        </>
      )}
    </Shell>
  );
}
