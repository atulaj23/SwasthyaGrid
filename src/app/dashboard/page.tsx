'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Activity, AlertTriangle, Boxes, ChevronRight, Flame,
  LayoutDashboard, Map as MapIcon, Menu, Package, ShieldCheck,
  Truck, Users, X, BrainCircuit, RefreshCw, TrendingUp, TrendingDown,
  Bed, ArrowRight, BarChart3, Globe2,
} from 'lucide-react';
import type { Phc } from '@/lib/store';

const PhcMap = dynamic(() => import('@/components/PhcMap'), {
  ssr: false,
  loading: () => <div className="map-loading">Loading geographic layer…</div>,
});

type Snap = {
  phcs: Phc[];
  network: { total: number; critical: number; warnings: number; stockoutRisks: number; bedPressure: number; patientSurges: number };
  countries: {
    IN: { total: number; critical: number; warning: number };
    BR: { total: number; critical: number; warning: number };
    RU: { total: number; critical: number; warning: number };
    CN: { total: number; critical: number; warning: number };
    ZA: { total: number; critical: number; warning: number };
  };
  india: { total: number; critical: number; up: { total: number; critical: number } };
  emergency: { active: boolean; scenario: string; multiplier: number; readiness: number };
};
type AlertRecord = {
  id: string; severity: 'CRITICAL' | 'WARNING';
  title: string; phcName: string; district: string;
  message: string; recommended: string;
};

const NAV_GROUPS = [
  {
    label: 'Operations',
    items: [
      ['Command Center',        '/dashboard',      LayoutDashboard],
      ['Medicine Intelligence', '/inventory',      Boxes],
      ['Forecasting',           '/forecasting',    BrainCircuit],
      ['Early Warnings',        '/warnings',       AlertTriangle],
      ['Redistribution',        '/redistribution', Truck],
    ],
  },
  {
    label: 'Response & AI',
    items: [
      ['Emergency Response', '/emergency',   Flame],
      ['Federated AI',       '/federated',   ShieldCheck],
      ['Analytics',          '/analytics',   Activity],
      ['Beds',               '/beds',        Package],
      ['Workforce',          '/workforce',   Users],
      ['Patient Flow',       '/patient-flow',Activity],
    ],
  },
] as const;

export default function Dashboard() {
  const [data,     setData]     = useState<Snap | null>(null);
  const [alerts,   setAlerts]   = useState<AlertRecord[]>([]);
  const [selected, setSelected] = useState<Phc | null>(null);
  const [filter,   setFilter]   = useState('ALL');
  const [country,  setCountry]  = useState('ALL');
  const [region,   setRegion]   = useState('ALL');
  const [district, setDistrict] = useState('ALL');
  const [layer,    setLayer]    = useState('PHC_STATUS');
  const [query,    setQuery]    = useState('');
  const [sidebar,  setSidebar]  = useState(true);
  const [loading,  setLoading]  = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([fetch('/api/dashboard'), fetch('/api/alerts')])
      .then(async ([net, warn]) => {
        if (!net.ok || !warn.ok) throw new Error();
        setData(await net.json());
        setAlerts(await warn.json());
      })
      .catch(() => { setData(null); setAlerts([]); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  if (loading) return (
    <div className="shell">
      <main className="main" style={{ marginLeft: 0 }}>
        <div className="content"><div className="panel bigcard">Loading network telemetry…</div></div>
      </main>
    </div>
  );

  if (!data) return (
    <div className="shell">
      <main className="main" style={{ marginLeft: 0 }}>
        <div className="content">
          <div className="panel bigcard">
            <h2>Network data unavailable</h2>
            <p>We could not retrieve the simulated operational dataset.</p>
            <button className="btn" onClick={load} style={{ marginTop: 16 }}>Retry</button>
          </div>
        </div>
      </main>
    </div>
  );

  // Derived filter lists
  const regions = Array.from(new Set(
    data.phcs
      .filter(p => country === 'ALL' || p.code === country)
      .map(p => p.region)
  ));
  const districts = Array.from(new Set(
    data.phcs
      .filter(p => (country === 'ALL' || p.code === country) && (region === 'ALL' || p.region === region))
      .map(p => p.district)
  ));

  const shown = data.phcs.filter(p =>
    (filter   === 'ALL' || p.status   === filter)   &&
    (country  === 'ALL' || p.code     === country)  &&
    (region   === 'ALL' || p.region   === region)   &&
    (district === 'ALL' || p.district === district)
  );

  const searched = data.phcs
    .filter(p => (p.name + p.district + p.region + p.medicine + p.country)
      .toLowerCase().includes(query.toLowerCase()))
    .slice(0, 7);

  const visibleAlerts = alerts.filter(a => shown.some(p => p.name === a.phcName));

  const countryStats = data.countries ?? {
    IN: { total: data.phcs.filter(p=>p.code==='IN').length, critical: 0, warning: 0 },
    BR: { total: data.phcs.filter(p=>p.code==='BR').length, critical: 0, warning: 0 },
    RU: { total: data.phcs.filter(p=>p.code==='RU').length, critical: 0, warning: 0 },
    CN: { total: data.phcs.filter(p=>p.code==='CN').length, critical: 0, warning: 0 },
    ZA: { total: data.phcs.filter(p=>p.code==='ZA').length, critical: 0, warning: 0 },
  };

  // Module summary data
  const totalBeds    = data.phcs.reduce((a, p) => a + p.beds, 0);
  const totalOcc     = data.phcs.reduce((a, p) => a + p.occupied, 0);
  const totalStaff   = data.phcs.reduce((a, p) => a + p.staff, 0);
  const totalPresent = data.phcs.reduce((a, p) => a + p.present, 0);
  const totalFootfall= data.phcs.reduce((a, p) => a + p.footfall, 0);
  const totalBase    = data.phcs.reduce((a, p) => a + p.baseline, 0);
  const bedPct       = Math.round(totalOcc / totalBeds * 100);
  const staffPct     = Math.round(totalPresent / totalStaff * 100);
  const footPct      = Math.round(totalFootfall / totalBase * 100);

  return (
    <div className="shell">
      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside className={sidebar ? 'side' : 'side collapsed'}>
        <div className="brand">
          SwasthyaGrid
          <small>RESILIENCE OPERATIONS</small>
        </div>
        <nav className="nav">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <div className="navgroup">{group.label}</div>
              {group.items.map(([label, href, Icon]) => (
                <Link
                  key={href}
                  href={href}
                  className={'navlink' + (href === '/dashboard' ? ' active' : '')}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* BRICS network quick-filter panel */}
        <div className="side-brics">
          <div className="side-brics-label">BRICS Network</div>
          {([ ['IN','India'], ['BR','Brazil'], ['RU','Russia'], ['CN','China'], ['ZA','South Africa'] ] as const).map(([code, label]) => (
            <button
              key={code}
              className={'side-brics-row' + (country === code ? ' active' : '')}
              onClick={() => { setCountry(country === code ? 'ALL' : code); setRegion('ALL'); setDistrict('ALL'); }}
            >
              <span className="side-brics-name">{label}</span>
              <span className="side-brics-counts">
                <span className="side-brics-total">{countryStats[code]?.total ?? 0}</span>
                {(countryStats[code]?.critical ?? 0) > 0 &&
                  <span className="side-brics-crit">{countryStats[code].critical}!</span>
                }
              </span>
            </button>
          ))}
        </div>

        <div className="sidefoot">
          <b>SIMULATED DATA</b><br />
          Prototype environment. No connection to government systems or clinical records.
          <br /><span className="mono" style={{ opacity: .45, fontSize: 9 }}>v0.9 · operator preview</span>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────── */}
      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="iconbtn" aria-label="Toggle navigation" onClick={() => setSidebar(s => !s)}>
              <Menu size={15} />
            </button>
            <div className="topbar-title">
              <h1>Healthcare Command Center</h1>
              <p>BRICS network · {data.network.total} PHCs monitored · {data.network.critical} critical</p>
            </div>
          </div>

          <div className="topright">
            <div className="searchbox">
              <input
                aria-label="Search PHCs, districts or medicines"
                placeholder="Search network…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <div className="searchresults">
                  {searched.length
                    ? searched.map(p => (
                        <button key={p.id} onClick={() => { setSelected(p); setQuery(''); }}>
                          <b>{p.name}</b>
                          <span>{p.district} · {p.region}{p.locationSource === 'simulated' ? ' · sim' : ''}</span>
                        </button>
                      ))
                    : <span className="empty-search">No matching records</span>
                  }
                </div>
              )}
            </div>

            <span className="live"><i className="dot" /> Online</span>

            <Link href="/warnings" className="alertIcon" aria-label={`${visibleAlerts.length} active alerts`}>
              <AlertTriangle size={14} />
              {visibleAlerts.length > 0 && <b>{visibleAlerts.length}</b>}
            </Link>

            <span className="demo">SIMULATED DATA</span>

            <button className="iconbtn" onClick={load} aria-label="Refresh data">
              <RefreshCw size={14} />
            </button>
          </div>
        </header>

        <div className="content">
          {/* Emergency band */}
          {data.emergency.active && (
            <div className="emergencyBand">
              <span className="emergencyMark">!</span>
              <div className="emergency-body">
                <b>EMERGENCY RESPONSE MODE</b>
                <span>{data.emergency.scenario.toUpperCase()} · demand ×{data.emergency.multiplier.toFixed(1)} · readiness {data.emergency.readiness}/100</span>
              </div>
              <Link href="/emergency" className="emergency-link">Open response desk →</Link>
            </div>
          )}

          {/* Page header + filters */}
          <div className="page-header">
            <div className="page-title">
              <div className="eyebrow">Observe · Predict · Warn · Recommend</div>
              <h2>Network situation</h2>
            </div>
            <div className="filters">
              <select className="control" aria-label="Country" value={country}
                onChange={e => { setCountry(e.target.value); setRegion('ALL'); setDistrict('ALL'); }}>
                <option value="ALL">All countries</option>
                <option value="IN">India</option>
                <option value="BR">Brazil</option>
                <option value="RU">Russia</option>
                <option value="CN">China</option>
                <option value="ZA">South Africa</option>
              </select>
              <select className="control" aria-label="Region" value={region}
                onChange={e => { setRegion(e.target.value); setDistrict('ALL'); }}>
                <option value="ALL">All regions</option>
                {regions.map(r => <option key={r}>{r}</option>)}
              </select>
              <select className="control" aria-label="District" value={district}
                onChange={e => setDistrict(e.target.value)}>
                <option value="ALL">All districts</option>
                {districts.map(d => <option key={d}>{d}</option>)}
              </select>
              <select className="control" aria-label="Status filter" value={filter}
                onChange={e => setFilter(e.target.value)}>
                <option value="ALL">All statuses</option>
                <option value="CRITICAL">Critical</option>
                <option value="WARNING">Warning</option>
                <option value="NORMAL">Normal</option>
              </select>
              <select className="control" aria-label="Map layer" value={layer}
                onChange={e => setLayer(e.target.value)}>
                <option value="PHC_STATUS">PHC status</option>
                <option value="MEDICINE_RISK">Medicine risk</option>
                <option value="BED_PRESSURE">Bed pressure</option>
                <option value="PATIENT_SURGE">Patient surge</option>
                <option value="STAFF_AVAILABILITY">Staff availability</option>
              </select>
              {(country !== 'ALL' || region !== 'ALL' || district !== 'ALL' || filter !== 'ALL') && (
                <button className="btn secondary" style={{ height: 30, padding: '0 10px', fontSize: 11 }}
                  onClick={() => { setCountry('ALL'); setRegion('ALL'); setDistrict('ALL'); setFilter('ALL'); }}>
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* KPI strip */}
          <div className="kpistrip">
            <div className="kpi">
              <label>PHCs monitored</label>
              <strong>{data.network.total}</strong>
              <small>BRICS network</small>
            </div>
            <div className="kpi kpi-divider">
              <label>Countries</label>
              <strong>5</strong>
              <small>IN · BR · RU · CN · ZA</small>
            </div>
            <div className="kpi kpi-divider">
              <label>Critical</label>
              <strong className="critical">{data.network.critical}</strong>
              <small>immediate review</small>
            </div>
            <div className="kpi kpi-divider">
              <label>Stock-out risks</label>
              <strong className="critical">{data.network.stockoutRisks}</strong>
              <small>within 7 days</small>
            </div>
            <div className="kpi kpi-divider">
              <label>Bed pressure</label>
              <strong className="warning">{data.network.bedPressure}</strong>
              <small>above 85%</small>
            </div>
            <div className="kpi kpi-divider">
              <label>Patient surges</label>
              <strong className="warning">{data.network.patientSurges}</strong>
              <small>above baseline</small>
            </div>
          </div>

          {/* Country filter callout */}
          {country !== 'ALL' && (
            <div className="network-callout">
              <div className="network-callout-body">
                <span className="network-callout-label">
                  {country === 'IN' ? 'India' : country === 'BR' ? 'Brazil' : country === 'RU' ? 'Russia' : country === 'CN' ? 'China' : 'South Africa'}
                  {region !== 'ALL' ? ` · ${region}` : ''} · {shown.length} facilit{shown.length === 1 ? 'y' : 'ies'}
                </span>
                <span>
                  {shown.filter(p => p.status === 'CRITICAL').length > 0
                    ? <span className="network-callout-crit">{shown.filter(p => p.status === 'CRITICAL').length} critical — immediate review required</span>
                    : <span className="network-callout-ok">No critical alerts in view</span>
                  }
                </span>
              </div>
              <div className="network-callout-actions">
                <button className="network-callout-btn"
                  onClick={() => { setCountry('ALL'); setRegion('ALL'); setDistrict('ALL'); }}>
                  Show all countries
                </button>
                {country === 'IN' && region !== 'Uttar Pradesh' && (
                  <button className="network-callout-btn"
                    onClick={() => { setRegion('Uttar Pradesh'); setDistrict('ALL'); }}>
                    Uttar Pradesh
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── MAP + ALERTS ──────────────────────────────────────── */}
          <div className="dash-section-head">
            <MapIcon size={13} />
            <span>Geographic intelligence</span>
            <span className="dash-section-meta">{shown.length} {shown.length === 1 ? 'facility' : 'facilities'} · click marker for detail</span>
          </div>

          <div className="map-alerts-row">
            <section className="panel map-panel">
              <div className="panelhead">
                <h3>
                  PHC network map
                  {region !== 'ALL' && <span className="panel-scope">· {region}</span>}
                </h3>
                <span className="panel-meta">{layer.replace(/_/g, ' ')}</span>
              </div>
              <div className="mapwrap">
                <PhcMap phcs={shown} layer={layer} selectedId={selected?.id} onSelect={setSelected} />
              </div>
              <div className="maplegend">
                <span className="legend-layer">{layer.replace(/_/g, ' ')}</span>
                <span><i className="legenddot green" /> Normal</span>
                <span><i className="legenddot amber" /> Warning</span>
                <span><i className="legenddot red" /> Critical</span>
                <span className="legend-sep" />
                <span><i className="legenddot-diamond" /> Lojhara AAM-PHC</span>
              </div>
            </section>

            <section className="panel alerts-panel">
              <div className="panelhead">
                <h3>
                  <AlertTriangle size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />
                  Early warning queue
                </h3>
                <span className={'panel-meta' + (visibleAlerts.length ? ' has-alerts' : '')}>
                  {visibleAlerts.length} active
                </span>
              </div>
              <div className="alerts-scroll">
                {visibleAlerts.length
                  ? visibleAlerts.slice(0, 9).map(a => (
                      <AlertCard
                        key={a.id}
                        title={a.title}
                        place={`${a.phcName} · ${a.district}`}
                        body={a.message}
                        level={a.severity}
                        countryCode={data.phcs.find(p => p.name === a.phcName)?.code}
                      />
                    ))
                  : <div className="empty-state">No active warnings in the selected scope.</div>
                }
              </div>
              <div className="panel-footer-link">
                <Link href="/warnings">View all warnings <ArrowRight size={12} /></Link>
              </div>
            </section>
          </div>

          {/* ── QUICK-VIEW CHARTS ─────────────────────────────────── */}
          <div className="dash-section-head">
            <BarChart3 size={13} />
            <span>Network telemetry</span>
          </div>
          <div className="charts-row">
            <Chart
              title="Medicine stock"
              caption={`Coverage across ${shown.length} facilities`}
              values={shown.map(p => Math.min(100, p.stock / 10)).slice(0, 12)}
              labels={shown.slice(0, 12).map(p => p.name.replace(/PHC |Gram |PHC$/g, '').trim())}
              hot
            />
            <Chart
              title="Bed occupancy"
              caption="Network capacity pressure"
              values={shown.map(p => p.occupied / p.beds * 100).slice(0, 12)}
              labels={shown.slice(0, 12).map(p => p.name.replace(/PHC |Gram |PHC$/g, '').trim())}
              line
            />
            <Chart
              title="Patient footfall"
              caption="Today vs. local baseline"
              values={shown.map(p => Math.min(100, p.footfall / p.baseline * 70)).slice(0, 12)}
              labels={shown.slice(0, 12).map(p => p.name.replace(/PHC |Gram |PHC$/g, '').trim())}
              hot
            />
          </div>

          {/* ── MODULE SUMMARY GRID ──────────────────────────────────
               8 modules, each a mini-panel with summary stats + link
          */}

          {/* Row 1: Beds · Workforce · Patient Flow · Inventory */}
          <div className="dash-section-head" style={{ marginTop: 24 }}>
            <Globe2 size={13} />
            <span>Module overview</span>
            <span className="dash-section-meta">All modules — scroll to explore, click to open</span>
          </div>

          <div className="dash-modules-grid">

            {/* Beds */}
            <Link href="/beds" className="dash-module">
              <div className="dash-module-head">
                <Bed size={14} />
                <span>Beds</span>
                <span className={'dash-module-badge ' + (bedPct > 85 ? 'red' : bedPct > 70 ? 'amber' : '')}>{bedPct}%</span>
              </div>
              <div className="dash-module-stat">
                <strong>{totalOcc.toLocaleString()}</strong>
                <span>of {totalBeds.toLocaleString()} beds occupied</span>
              </div>
              <div className="dash-module-bar">
                <div style={{ width: Math.min(100, bedPct) + '%', background: bedPct > 85 ? '#c0392b' : bedPct > 70 ? '#c27621' : '#176b60' }} />
              </div>
              <div className="dash-module-foot">
                {data.network.bedPressure > 0
                  ? <span className="critical">{data.network.bedPressure} facilities above 85%</span>
                  : <span className="normal">All within safe capacity</span>
                }
                <ArrowRight size={12} />
              </div>
            </Link>

            {/* Workforce */}
            <Link href="/workforce" className="dash-module">
              <div className="dash-module-head">
                <Users size={14} />
                <span>Workforce</span>
                <span className={'dash-module-badge ' + (staffPct < 75 ? 'red' : staffPct < 85 ? 'amber' : '')}>{staffPct}%</span>
              </div>
              <div className="dash-module-stat">
                <strong>{totalPresent.toLocaleString()}</strong>
                <span>of {totalStaff.toLocaleString()} staff present</span>
              </div>
              <div className="dash-module-bar">
                <div style={{ width: Math.min(100, staffPct) + '%', background: staffPct < 75 ? '#c0392b' : staffPct < 85 ? '#c27621' : '#176b60' }} />
              </div>
              <div className="dash-module-foot">
                {staffPct < 80
                  ? <span className="warning">Below 80% operational standard</span>
                  : <span className="normal">Attendance adequate</span>
                }
                <ArrowRight size={12} />
              </div>
            </Link>

            {/* Patient Flow */}
            <Link href="/patient-flow" className="dash-module">
              <div className="dash-module-head">
                <Activity size={14} />
                <span>Patient flow</span>
                <span className={'dash-module-badge ' + (footPct > 125 ? 'red' : footPct > 110 ? 'amber' : '')}>{footPct}%</span>
              </div>
              <div className="dash-module-stat">
                <strong>{totalFootfall.toLocaleString()}</strong>
                <span>today · baseline {totalBase.toLocaleString()}</span>
              </div>
              <div className="dash-module-bar">
                <div style={{ width: Math.min(100, Math.round(footPct * .8)) + '%', background: footPct > 125 ? '#c0392b' : footPct > 110 ? '#c27621' : '#176b60' }} />
              </div>
              <div className="dash-module-foot">
                {data.network.patientSurges > 0
                  ? <span className="warning">{data.network.patientSurges} surge sites &gt;25% above baseline</span>
                  : <span className="normal">Volume within baseline</span>
                }
                <ArrowRight size={12} />
              </div>
            </Link>

            {/* Medicine Intelligence */}
            <Link href="/inventory" className="dash-module">
              <div className="dash-module-head">
                <Boxes size={14} />
                <span>Medicine</span>
                <span className={'dash-module-badge ' + (data.network.stockoutRisks > 0 ? 'red' : '')}>{data.network.stockoutRisks} at risk</span>
              </div>
              <div className="dash-module-stat">
                <strong>{data.network.stockoutRisks}</strong>
                <span>facilities with &lt;7 days stock</span>
              </div>
              <div className="dash-module-bar">
                <div style={{ width: Math.min(100, Math.round(data.network.stockoutRisks / data.network.total * 100 * 5)) + '%', background: data.network.stockoutRisks > 0 ? '#c0392b' : '#176b60' }} />
              </div>
              <div className="dash-module-foot">
                <span className={data.network.stockoutRisks > 0 ? 'critical' : 'normal'}>
                  {data.network.stockoutRisks > 0 ? 'Urgent replenishment required' : 'Stock coverage adequate'}
                </span>
                <ArrowRight size={12} />
              </div>
            </Link>

            {/* Early Warnings */}
            <Link href="/warnings" className="dash-module">
              <div className="dash-module-head">
                <AlertTriangle size={14} />
                <span>Early warnings</span>
                <span className={'dash-module-badge ' + (alerts.filter(a=>a.severity==='CRITICAL').length > 0 ? 'red' : 'amber')}>
                  {alerts.length} active
                </span>
              </div>
              <div className="dash-module-stat">
                <strong>{alerts.filter(a => a.severity === 'CRITICAL').length}</strong>
                <span>critical · {alerts.filter(a => a.severity === 'WARNING').length} warnings</span>
              </div>
              <div className="dash-module-bar">
                <div style={{ width: Math.min(100, alerts.length * 4) + '%', background: alerts.filter(a=>a.severity==='CRITICAL').length > 0 ? '#c0392b' : '#c27621' }} />
              </div>
              <div className="dash-module-foot">
                <span className={alerts.filter(a=>a.severity==='CRITICAL').length > 0 ? 'critical' : 'warning'}>Requires operator review</span>
                <ArrowRight size={12} />
              </div>
            </Link>

            {/* Redistribution */}
            <Link href="/redistribution" className="dash-module">
              <div className="dash-module-head">
                <Truck size={14} />
                <span>Redistribution</span>
                <span className="dash-module-badge amber">AI recs</span>
              </div>
              <div className="dash-module-stat">
                <strong>{data.network.stockoutRisks}</strong>
                <span>facilities need inbound transfers</span>
              </div>
              <div className="dash-module-bar">
                <div style={{ width: Math.min(100, data.network.stockoutRisks * 12) + '%', background: '#c27621' }} />
              </div>
              <div className="dash-module-foot">
                <span className="warning">Review AI recommendations</span>
                <ArrowRight size={12} />
              </div>
            </Link>

            {/* Emergency Response */}
            <Link href="/emergency" className="dash-module">
              <div className="dash-module-head">
                <Flame size={14} />
                <span>Emergency response</span>
                <span className={'dash-module-badge ' + (data.emergency.active ? 'red' : '')}>{data.emergency.active ? 'ACTIVE' : 'Standby'}</span>
              </div>
              <div className="dash-module-stat">
                <strong>{data.emergency.readiness}</strong>
                <span>readiness score / 100</span>
              </div>
              <div className="dash-module-bar">
                <div style={{ width: Math.min(100, data.emergency.readiness) + '%', background: data.emergency.active ? '#c0392b' : '#176b60' }} />
              </div>
              <div className="dash-module-foot">
                <span className={data.emergency.active ? 'critical' : 'normal'}>
                  {data.emergency.active ? `${data.emergency.scenario.toUpperCase()} — ×${data.emergency.multiplier.toFixed(1)} demand` : 'Normal operations'}
                </span>
                <ArrowRight size={12} />
              </div>
            </Link>

            {/* Federated AI */}
            <Link href="/federated" className="dash-module">
              <div className="dash-module-head">
                <ShieldCheck size={14} />
                <span>Federated AI</span>
                <span className="dash-module-badge">5 nodes</span>
              </div>
              <div className="dash-module-stat">
                <strong>BRICS</strong>
                <span>collaborative model training ring</span>
              </div>
              <div className="dash-module-bar">
                <div style={{ width: '72%', background: '#176b60' }} />
              </div>
              <div className="dash-module-foot">
                <span className="normal">Data stays local — only gradients shared</span>
                <ArrowRight size={12} />
              </div>
            </Link>

          </div>

          {/* ── ANALYTICS SHORTCUT ───────────────────────────────── */}
          <div className="dash-section-head" style={{ marginTop: 24 }}>
            <BarChart3 size={13} />
            <span>Executive analytics</span>
          </div>
          <div className="dash-analytics-preview panel">
            <div className="dash-analytics-left">
              <div className="eyebrow">Deep intelligence</div>
              <h3>Operational analytics &amp; intelligence</h3>
              <p>8 interactive charts · risk matrix · critical PHC ranking · redistribution opportunities · auto-generated operational insights · PDF/print report generation</p>
              <Link href="/analytics" className="btn" style={{ marginTop: 14, display: 'inline-flex' }}>
                Open analytics workspace <ArrowRight size={14} style={{ marginLeft: 6 }} />
              </Link>
            </div>
            <div className="dash-analytics-right">
              {/* Mini KPI row */}
              <div className="dash-analytics-kpis">
                <div className="dash-ak">
                  <span>{Math.round(totalOcc / totalBeds * 100)}%</span>
                  <label>Bed occ.</label>
                </div>
                <div className="dash-ak">
                  <span>{Math.round(totalPresent / totalStaff * 100)}%</span>
                  <label>Staff</label>
                </div>
                <div className="dash-ak">
                  <span>{data.network.critical}</span>
                  <label>Critical</label>
                </div>
                <div className="dash-ak">
                  <span>{data.network.stockoutRisks}</span>
                  <label>Stock risk</label>
                </div>
              </div>
              {/* Mini bar chart */}
              <div className="dash-analytics-bars">
                {data.phcs.slice(0, 16).map(p => (
                  <i
                    key={p.id}
                    title={p.name}
                    style={{
                      height: Math.max(6, Math.round(p.occupied / p.beds * 100)) + '%',
                      background: p.status === 'CRITICAL' ? '#c0392b' : p.status === 'WARNING' ? '#c27621' : '#9ecfc5',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Forecasting quick-link */}
          <div className="dash-quick-links">
            <Link href="/forecasting" className="dash-quick-link">
              <BrainCircuit size={14} />
              <div>
                <b>Demand forecasting</b>
                <span>7–30 day stock depletion projections with explainability</span>
              </div>
              <ArrowRight size={13} style={{ marginLeft: 'auto', flexShrink: 0 }} />
            </Link>
            <Link href="/analytics" className="dash-quick-link">
              <Activity size={14} />
              <div>
                <b>Analytics &amp; intelligence</b>
                <span>Executive dashboard with print/PDF report generation</span>
              </div>
              <ArrowRight size={13} style={{ marginLeft: 'auto', flexShrink: 0 }} />
            </Link>
          </div>

          {/* Simulated data notice */}
          {shown.some(p => p.locationSource === 'simulated') && (
            <p className="sim-notice">
              ⚠ Some facilities use illustrative coordinates. Verified locations (solid markers) are sourced from OpenStreetMap or government registries. All operational metrics are simulated and do not represent real clinical records.
            </p>
          )}
        </div>
      </main>

      {/* ── PHC Detail Drawer ──────────────────────────────────────── */}
      {selected && (
        <>
          <div className="drawerBackdrop" aria-hidden="true" onClick={() => setSelected(null)} />
          <Drawer
            p={selected}
            close={() => setSelected(null)}
            phcAlerts={alerts.filter(a => a.phcName === selected.name)}
          />
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AlertCard
   ═══════════════════════════════════════════════════════════════ */
function AlertCard({
  title, place, body, level, countryCode,
}: { title: string; place: string; body: string; level: string; countryCode?: string }) {
  return (
    <div className={'alert-card' + (level === 'CRITICAL' ? ' alert-critical' : ' alert-warning')}>
      <div className="alert-head">
        <span className="alert-title">{title}</span>
        <span className={'badge ' + (level === 'CRITICAL' ? 'red' : 'amber')}>{level}</span>
      </div>
      <div className="alert-place">
        {countryCode && <span className="alert-country-tag">{countryCode}</span>}
        {place}
      </div>
      <p className="alert-body">{body}</p>
      <Link href="/warnings" className="alert-link">
        Review warning <ChevronRight size={11} style={{ verticalAlign: '-1px' }} />
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Chart — simple bar / line sparkline
   ═══════════════════════════════════════════════════════════════ */
function Chart({
  title, caption, hot, line, values, labels,
}: { title: string; caption: string; hot?: boolean; line?: boolean; values: number[]; labels?: string[] }) {
  const safe   = values.length ? values : [0];
  const points = safe
    .map((v, i) => `${safe.length === 1 ? 150 : (i / (safe.length - 1)) * 300},${120 - Math.min(100, v) * .95}`)
    .join(' ');

  return (
    <section className="panel chart">
      <h3>{title}</h3>
      <p>{caption}</p>
      {line ? (
        <div className="linechart">
          <svg viewBox="0 0 300 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lgrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#176b60" stopOpacity=".12" />
                <stop offset="100%" stopColor="#176b60" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={`0,110 ${points} 300,110`} fill="url(#lgrad)" />
            <polyline points={points} fill="none" stroke="#176b60" strokeWidth="2" />
            <polyline points="0,110 300,110" fill="none" stroke="#e5e7eb" />
          </svg>
        </div>
      ) : (
        <div className="bars">
          {safe.map((v, i) => (
            <i
              key={i}
              className={'bar ' + (hot && v > 75 ? 'hot' : '')}
              style={{ height: Math.max(4, v) + '%' }}
              title={labels?.[i] ? `${labels[i]}: ${Math.round(v)}%` : `${Math.round(v)}%`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Drawer — rich PHC intelligence panel
   ═══════════════════════════════════════════════════════════════ */
function Drawer({ p, close, phcAlerts }: { p: Phc; close: () => void; phcAlerts: AlertRecord[] }) {
  const risk      = p.dailyUse ? Math.max(1, Math.round(p.stock / p.dailyUse)) : 999;
  const bedPct    = Math.round(p.occupied / p.beds * 100);
  const staffPct  = Math.round(p.present / p.staff * 100);
  const footDelta = Math.round((p.footfall / p.baseline - 1) * 100);
  const riskScore = Math.min(99, Math.round(
    (p.status === 'CRITICAL' ? 48 : p.status === 'WARNING' ? 28 : 10) +
    (p.occupied / p.beds) * 25 +
    (1 - p.present / p.staff) * 20 +
    (p.footfall > p.baseline * 1.25 ? 12 : 0)
  ));

  const forecastDays = Array.from({ length: 7 }, (_, i) => {
    const proj = Math.max(0, p.stock - p.dailyUse * (i + 1));
    return Math.min(100, Math.round(proj / Math.max(1, p.stock) * 100));
  });

  const riskClass = riskScore >= 55 ? 'critical' : riskScore >= 30 ? 'warning' : 'normal';

  return (
    <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="phc-drawer-title">
      <div className="drawerhead">
        <div className="drawerhead-content">
          <div className="eyebrow">PHC intelligence · {p.country}</div>
          <h2 id="phc-drawer-title">{p.name}</h2>
          <div className="drawer-location">{p.district} · {p.region} · {p.country}</div>
          {p.locationSource === 'simulated' && (
            <div className="drawer-sim-tag">⚠ Illustrative location — demo data only</div>
          )}
          {p.locationSource === 'verified' && (
            <div className="drawer-verified-tag">✓ Verified location — OSM / government registry</div>
          )}
        </div>
        <button className="close" onClick={close} aria-label="Close detail panel"><X size={15} /></button>
      </div>

      <div className="drawerbody">
        <div className="drawer-status-row">
          <span className={'badge ' + (p.status === 'CRITICAL' ? 'red' : p.status === 'WARNING' ? 'amber' : 'green')}>
            {p.status}
          </span>
          <div className="drawer-riskscore">
            <span className="drawer-riskscore-label">AI risk score</span>
            <strong className={riskClass}>{riskScore}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted)' }}>/100</span></strong>
          </div>
        </div>

        <div className="metricgrid">
          <div className="metric">
            <label>Population served</label>
            <strong>{p.population.toLocaleString()}</strong>
          </div>
          <div className="metric">
            <label>Bed occupancy</label>
            <strong className={bedPct > 85 ? 'critical' : bedPct > 70 ? 'warning' : ''}>{p.occupied} / {p.beds}</strong>
            <div className="progress"><i style={{ width: bedPct + '%', background: bedPct > 85 ? 'var(--red)' : bedPct > 70 ? '#c27621' : 'var(--teal)' }} /></div>
          </div>
          <div className="metric">
            <label>Staff attendance</label>
            <strong className={staffPct < 75 ? 'critical' : staffPct < 90 ? 'warning' : ''}>{staffPct}%</strong>
            <div className="progress"><i style={{ width: staffPct + '%', background: staffPct < 75 ? 'var(--red)' : staffPct < 90 ? '#c27621' : 'var(--teal)' }} /></div>
          </div>
          <div className="metric">
            <label>Patient footfall</label>
            <strong className={footDelta > 25 ? 'critical' : footDelta > 10 ? 'warning' : ''}>
              {p.footfall}
              {footDelta !== 0 && (
                <span className="drawer-delta" style={{ color: footDelta > 0 ? 'var(--red)' : 'var(--teal)' }}>
                  {footDelta > 0 ? <TrendingUp size={11} style={{ verticalAlign: '-1px' }} /> : <TrendingDown size={11} style={{ verticalAlign: '-1px' }} />}
                  {Math.abs(footDelta)}%
                </span>
              )}
            </strong>
            <div className="metric-sub">baseline {p.baseline}</div>
          </div>
        </div>

        <div className="drawer-section">
          <div className="drawer-section-head">Medicine risk</div>
          <div className="drawer-medicine">
            <div className="drawer-medicine-top">
              <span className="drawer-medicine-name">{p.medicine}</span>
              <span className={'badge ' + (p.medicineRisk === 'CRITICAL' ? 'red' : p.medicineRisk === 'WARNING' ? 'amber' : '')}>{p.medicineRisk}</span>
            </div>
            <div className="minirow"><span>Current stock</span><b className="mono">{p.stock} units</b></div>
            <div className="minirow"><span>Daily consumption</span><b className="mono">{p.dailyUse} units / day</b></div>
            <div className="minirow">
              <span>Estimated days remaining</span>
              <b className={risk < 7 ? 'critical' : risk < 14 ? 'warning' : ''}>{risk < 999 ? `${risk} days` : 'Adequate'}</b>
            </div>
          </div>
        </div>

        <div className="drawer-section">
          <div className="drawer-section-head">7-day stock forecast</div>
          <div className="drawer-forecast">
            <div className="drawer-forecast-bars">
              {forecastDays.map((v, i) => (
                <div key={i} className="drawer-forecast-col">
                  <i className={'drawer-forecast-bar ' + (v < 20 ? 'fcrit' : v < 50 ? 'fwarn' : '')}
                    style={{ height: Math.max(4, v) + '%' }}
                    title={`Day ${i + 1}: ~${v}% remaining`}
                  />
                  <span className="drawer-forecast-day">D{i + 1}</span>
                </div>
              ))}
            </div>
            <p className="drawer-forecast-note">
              Projected {p.medicine} stock depletion at current {p.dailyUse} units/day.
              {risk < 7 ? ` Critical threshold in approximately ${risk} days.` : ''}
            </p>
          </div>
        </div>

        {phcAlerts.length > 0 && (
          <div className="drawer-section">
            <div className="drawer-section-head">Active alerts ({phcAlerts.length})</div>
            {phcAlerts.map(a => (
              <div key={a.id} className={'drawer-alert ' + (a.severity === 'CRITICAL' ? 'drawer-alert-crit' : 'drawer-alert-warn')}>
                <div className="drawer-alert-title">{a.title}</div>
                <div className="drawer-alert-body">{a.message}</div>
              </div>
            ))}
          </div>
        )}

        <div className="drawer-section">
          <div className="drawer-section-head">AI recommendation</div>
          <div className="drawer-rec">
            {risk < 7
              ? <>
                  <div className="drawer-rec-action critical">Transfer needed within 48 hours</div>
                  <p>Review redistribution of approximately <b>{Math.max(0, p.dailyUse * 14 - p.stock)} {p.medicine}</b> units from a surplus facility. Immediate operator review required.</p>
                </>
              : risk < 14
              ? <>
                  <div className="drawer-rec-action warning">Monitor stock trajectory</div>
                  <p>Stock will reach threshold within 14 days. Initiate replenishment review and confirm next delivery cycle.</p>
                </>
              : <>
                  <div className="drawer-rec-action normal">Continue monitoring</div>
                  <p>Current signals within acceptable range. Verify next replenishment cycle and review weekly.</p>
                </>
            }
            <p className="drawer-disclaimer">
              AI recommendations are operational decision support. They do not diagnose, prescribe or execute logistics autonomously. All actions require operator review.
            </p>
          </div>
        </div>

        <div className="drawer-actions">
          <Link className="btn" href={`/phc/${p.id}`}>Full details</Link>
          <Link className="btn secondary" href="/forecasting">Forecast</Link>
          <Link className="btn secondary" href="/redistribution">Redistribute</Link>
        </div>
      </div>
    </aside>
  );
}
