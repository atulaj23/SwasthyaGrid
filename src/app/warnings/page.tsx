'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle, Check, RefreshCw } from 'lucide-react';
import Shell from '@/components/Shell';

export default function Warnings() {
  const [rows, setRows]   = useState<any[]>([]);
  const [acked, setAcked] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  const load = () =>
    fetch('/api/alerts')
      .then(r => { if (!r.ok) throw Error(); return r.json(); })
      .then(setRows)
      .catch(() => setError('Warning service unavailable.'));

  useEffect(() => { load(); }, []);

  const active = rows.filter(a => !acked[a.id]);
  const critical = active.filter(a => a.severity === 'CRITICAL').length;

  return (
    <Shell title="Early warning center" sub="Prioritised signals requiring human review">
      <div className="eyebrow">Warn</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em', margin: '4px 0 8px' }}>Active operational warnings</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
        Review, acknowledge and route warnings to the appropriate coordination workflow.
      </p>

      {error ? (
        <div className="panel bigcard">
          <h3>Unable to load warnings</h3>
          <button className="btn" onClick={load} style={{ marginTop: 12 }}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : (
        <>
          {/* Summary strip */}
          <div className="kpistrip" style={{ marginBottom: 20 }}>
            <div className="kpi">
              <label>Total active</label>
              <strong>{active.length}</strong>
              <small>unacknowledged</small>
            </div>
            <div className="kpi kpi-divider">
              <label>Critical</label>
              <strong className="critical">{critical}</strong>
              <small>immediate action</small>
            </div>
            <div className="kpi kpi-divider">
              <label>Warnings</label>
              <strong className="warning">{active.length - critical}</strong>
              <small>monitor</small>
            </div>
            <div className="kpi kpi-divider">
              <label>Acknowledged</label>
              <strong>{Object.keys(acked).length}</strong>
              <small>this session</small>
            </div>
          </div>

          <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="panelhead" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <h3><AlertTriangle size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />Active alerts</h3>
              <span className={'panel-meta' + (critical > 0 ? ' has-alerts' : '')}>{active.length} unacknowledged</span>
            </div>
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {active.length === 0 && (
                <div className="empty-state">All warnings acknowledged this session.</div>
              )}
              {active.map(a => (
                <div key={a.id} className={'alert-card ' + (a.severity === 'CRITICAL' ? 'alert-critical' : 'alert-warning')}>
                  <div className="alert-head">
                    <span className="alert-title">
                      <AlertTriangle size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />
                      {a.title}
                    </span>
                    <span className={'badge ' + (a.severity === 'CRITICAL' ? 'red' : 'amber')}>{a.severity}</span>
                  </div>
                  <div className="alert-place">
                    {a.phcName} · {a.district}
                  </div>
                  <p className="alert-body">{a.message}</p>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
                    <b>Recommended:</b> {a.recommended}
                  </div>
                  <button
                    className="btn secondary"
                    style={{ height: 28, padding: '0 10px', fontSize: 11 }}
                    onClick={() => setAcked(s => ({ ...s, [a.id]: true }))}
                  >
                    <Check size={12} /> Acknowledge
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Shell>
  );
}
