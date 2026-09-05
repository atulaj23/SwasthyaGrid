'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, BarChart3, AlertTriangle, TrendingUp, TrendingDown,
  Users, Package, Bed, Activity, FileText, Printer, RefreshCw,
  Filter, ChevronDown, Info,
} from 'lucide-react';

type Phc = {
  id: number; name: string; country: string; code: string;
  region: string; district: string; population: number;
  status: string; beds: number; occupied: number;
  staff: number; present: number; footfall: number; baseline: number;
  stock: number; dailyUse: number; medicine: string; medicineRisk: string;
  locationSource: 'verified' | 'simulated';
};
type Snap = {
  phcs: Phc[];
  network: { total: number; critical: number; stockoutRisks: number; bedPressure: number; patientSurges: number };
  countries?: {
    IN: { total: number; critical: number; warning: number };
    BR: { total: number; critical: number; warning: number };
    RU: { total: number; critical: number; warning: number };
    CN: { total: number; critical: number; warning: number };
    ZA: { total: number; critical: number; warning: number };
  };
  india: { total: number; critical: number; up: { total: number; critical: number; sonbhadra?: { total: number; critical: number } } };
  emergency: { active: boolean; scenario: string; multiplier: number };
};

/* ── Utility ─────────────────────────────────────────────────── */
const pct  = (n: number, d: number) => d ? Math.round(n / d * 100) : 0;
const days = (p: Phc)               => p.dailyUse ? Math.floor(p.stock / p.dailyUse) : 999;
const riskClass = (s: string) => s === 'CRITICAL' ? 'critical' : s === 'WARNING' ? 'warning' : 'normal';

/* ── SVG bar chart ───────────────────────────────────────────── */
function BarChart({
  data, valueKey, labelKey, color = '#176b60', benchmarkPct, maxVal, height = 160, title, unit = '%',
}: {
  data: any[]; valueKey: string; labelKey: string;
  color?: string; benchmarkPct?: number; maxVal?: number;
  height?: number; title?: string; unit?: string;
}) {
  const [tip, setTip] = useState<{ label: string; value: number; x: number; y: number } | null>(null);
  if (!data.length) return <div className="an-empty">No data</div>;
  const vals  = data.map(d => d[valueKey] as number);
  const max   = maxVal ?? (Math.max(...vals) * 1.1 || 1);
  const bw    = Math.max(8, Math.min(32, Math.floor(560 / data.length) - 4));
  const gap   = 4;
  const totalW = data.length * (bw + gap);
  const svgW   = Math.max(totalW + 32, 320);

  return (
    <div className="an-chart-wrap" style={{ overflowX: 'auto' }}>
      <svg width={svgW} height={height + 28} aria-label={title}>
        {/* Gridlines */}
        {[0, .25, .5, .75, 1].map(f => {
          const y = Math.round(height - height * f);
          return <line key={f} x1={0} y1={y} x2={svgW} y2={y} stroke="#e5e7eb" strokeWidth={1} />;
        })}
        {/* Benchmark */}
        {benchmarkPct !== undefined && (
          <line
            x1={0} y1={Math.round(height - height * benchmarkPct / 100)}
            x2={svgW} y2={Math.round(height - height * benchmarkPct / 100)}
            stroke="#b91c1c" strokeWidth={1.5} strokeDasharray="4 3"
          />
        )}
        {/* Bars */}
        {data.map((d, i) => {
          const v    = d[valueKey] as number;
          const h    = Math.max(2, Math.round((v / max) * height));
          const x    = i * (bw + gap) + 16;
          const y    = height - h;
          const fill = d.status === 'CRITICAL' ? '#c0392b' : d.status === 'WARNING' ? '#c27621' : color;
          return (
            <rect key={i} x={x} y={y} width={bw} height={h} fill={fill} rx={2}
              onMouseEnter={e => setTip({ label: d[labelKey], value: v, x: x + bw / 2, y })}
              onMouseLeave={() => setTip(null)}
              style={{ cursor: 'default' }}
            />
          );
        })}
        {/* Tooltip */}
        {tip && (
          <>
            <rect x={tip.x - 50} y={tip.y - 36} width={100} height={26} rx={4} fill="#1f2937" />
            <text x={tip.x} y={tip.y - 19} textAnchor="middle" fill="white" fontSize={10.5} fontWeight={600}>
              {tip.label}
            </text>
            <text x={tip.x} y={tip.y - 8} textAnchor="middle" fill="#9ca3af" fontSize={9.5}>
              {Math.round(tip.value)}{unit}
            </text>
          </>
        )}
        {/* Benchmark label */}
        {benchmarkPct !== undefined && (
          <text x={svgW - 6} y={Math.round(height - height * benchmarkPct / 100) - 4} textAnchor="end" fill="#b91c1c" fontSize={9} fontWeight={600}>
            {benchmarkPct}% threshold
          </text>
        )}
      </svg>
    </div>
  );
}

/* ── SVG line/area chart ─────────────────────────────────────── */
function LineChart({
  series, height = 130, benchmarkY,
}: { series: { label: string; values: number[]; color: string }[]; height?: number; benchmarkY?: number }) {
  const allVals = series.flatMap(s => s.values);
  const max     = Math.max(...allVals) * 1.05 || 1;
  const w       = 300;
  const pts     = (vals: number[]) =>
    vals.map((v, i) => `${(i / (vals.length - 1)) * w},${height - (v / max) * height}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${height + 16}`} style={{ width: '100%', height: height + 16 }}>
      {[0, .25, .5, .75, 1].map(f => (
        <line key={f} x1={0} y1={height - height * f} x2={w} y2={height - height * f} stroke="#e5e7eb" strokeWidth={1} />
      ))}
      {benchmarkY !== undefined && (
        <line x1={0} y1={height - (benchmarkY / max) * height} x2={w} y2={height - (benchmarkY / max) * height}
          stroke="#b91c1c" strokeWidth={1.5} strokeDasharray="4 3" />
      )}
      {series.map((s, si) => {
        const pts_str = pts(s.values);
        const areaPoints = `0,${height} ${pts_str} ${w},${height}`;
        return (
          <g key={si}>
            {si === 0 && (
              <polygon points={areaPoints} fill={s.color} fillOpacity={0.08} />
            )}
            <polyline points={pts_str} fill="none" stroke={s.color} strokeWidth={2} />
            {s.values.map((v, i) => (
              <circle key={i}
                cx={(i / (s.values.length - 1)) * w}
                cy={height - (v / max) * height}
                r={3} fill={s.color} stroke="white" strokeWidth={1.5}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/* ── Gauge ───────────────────────────────────────────────────── */
function Gauge({ pct: value, label, color }: { pct: number; label: string; color: string }) {
  const r   = 38;
  const circ = Math.PI * r;
  const arc  = circ * Math.min(1, value / 100);
  return (
    <div className="an-gauge">
      <svg width={100} height={60} viewBox="0 0 100 60">
        <path d={`M10,50 A${r},${r} 0 0,1 90,50`} fill="none" stroke="#e5e7eb" strokeWidth={8} strokeLinecap="round" />
        <path d={`M10,50 A${r},${r} 0 0,1 90,50`} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" />
        <text x={50} y={48} textAnchor="middle" fontSize={16} fontWeight={700} fill={color}>{value}%</text>
      </svg>
      <div className="an-gauge-label">{label}</div>
    </div>
  );
}

/* ── Risk matrix dot ─────────────────────────────────────────── */
function RiskMatrix({ data }: { data: Phc[] }) {
  const [tip, setTip] = useState<Phc | null>(null);
  const w = 280; const h = 200;
  return (
    <div className="an-chart-wrap" style={{ position: 'relative' }}>
      <svg width={w} height={h} style={{ width: '100%', height: 'auto' }}>
        {/* Quadrant lines */}
        <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke="#e5e7eb" strokeWidth={1} />
        <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke="#e5e7eb" strokeWidth={1} />
        {/* Axis labels */}
        <text x={4} y={h - 4} fontSize={8} fill="#9ca3af">Low risk</text>
        <text x={w - 4} y={h - 4} fontSize={8} fill="#9ca3af" textAnchor="end">High stock-out</text>
        <text x={4} y={12} fontSize={8} fill="#9ca3af">High bed pressure</text>
        {data.map(p => {
          const stockOutRisk = p.dailyUse ? Math.min(100, Math.max(0, 100 - days(p) * 7)) : 0;
          const bedPressure  = pct(p.occupied, p.beds);
          const cx = (stockOutRisk / 100) * (w - 20) + 10;
          const cy = h - (bedPressure / 100) * (h - 20) - 10;
          const fill = p.status === 'CRITICAL' ? '#c0392b' : p.status === 'WARNING' ? '#c27621' : '#217a57';
          return (
            <circle key={p.id} cx={cx} cy={cy} r={5} fill={fill} fillOpacity={0.85}
              stroke="white" strokeWidth={1.5} style={{ cursor: 'pointer' }}
              onMouseEnter={() => setTip(p)} onMouseLeave={() => setTip(null)}
            />
          );
        })}
      </svg>
      {tip && (
        <div className="an-tip">
          <b>{tip.name}</b><br />
          {tip.district} · Beds {pct(tip.occupied, tip.beds)}% · Stock {days(tip)} days
        </div>
      )}
    </div>
  );
}

/* ── Horizontal rank bar ─────────────────────────────────────── */
function RankBar({ label, value, max, color, note }: { label: string; value: number; max: number; color: string; note?: string }) {
  const w = Math.round(Math.min(100, (value / (max || 1)) * 100));
  return (
    <div className="an-rank-row">
      <div className="an-rank-label" title={label}>{label}</div>
      <div className="an-rank-bar-wrap">
        <div className="an-rank-bar-track">
          <div className="an-rank-bar-fill" style={{ width: `${w}%`, background: color }} />
        </div>
        <span className="an-rank-val">{Math.round(value)}{note}</span>
      </div>
    </div>
  );
}

/* ── Insight card ────────────────────────────────────────────── */
function Insight({ level, what, why, risk, action }: { level: 'CRITICAL' | 'WARNING' | 'INFO'; what: string; why: string; risk: string; action: string }) {
  const colors: Record<string, string> = { CRITICAL: '#c0392b', WARNING: '#c27621', INFO: '#176b60' };
  return (
    <div className="an-insight" style={{ borderLeftColor: colors[level] }}>
      <div className="an-insight-header">
        <span className={'badge ' + (level === 'CRITICAL' ? 'red' : level === 'WARNING' ? 'amber' : '')} style={{ fontSize: 9 }}>{level}</span>
        <span className="an-insight-title">{what}</span>
      </div>
      <div className="an-insight-body">
        <div><span className="an-insight-lbl">WHY</span>{why}</div>
        <div><span className="an-insight-lbl">RISK</span>{risk}</div>
        <div><span className="an-insight-lbl">ACTION</span>{action}</div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function Analytics() {
  const [snap,    setSnap]    = useState<Snap | null>(null);
  const [alerts,  setAlerts]  = useState<any[]>([]);
  const [country, setCountry] = useState('ALL');
  const [region,  setRegion]  = useState('ALL');
  const [district,setDistrict]= useState('ALL');
  const [status,  setStatus]  = useState('ALL');
  const [printing,setPrinting]= useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    Promise.all([fetch('/api/dashboard'), fetch('/api/alerts')])
      .then(([a, b]) => Promise.all([a.json(), b.json()]))
      .then(([s, al]) => { setSnap(s); setAlerts(al); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => { window.print(); setPrinting(false); }, 150);
  };

  if (!snap) return (
    <Shell title="Analytics workspace" sub="Operational analytics and executive intelligence">
      <div className="panel bigcard" style={{ marginTop: 24 }}><RefreshCw className="spin" size={16} style={{ marginRight: 8 }} />Loading operational data…</div>
    </Shell>
  );

  // Derived filtering
  const countries = Array.from(new Set(snap.phcs.map(p => p.country)));
  const regions   = Array.from(new Set(snap.phcs.filter(p => country === 'ALL' || p.country === country).map(p => p.region)));
  const districts = Array.from(new Set(snap.phcs.filter(p => (country === 'ALL' || p.country === country) && (region === 'ALL' || p.region === region)).map(p => p.district)));
  const phcs = snap.phcs.filter(p =>
    (country  === 'ALL' || p.country  === country) &&
    (region   === 'ALL' || p.region   === region)  &&
    (district === 'ALL' || p.district === district) &&
    (status   === 'ALL' || p.status   === status)
  );

  // Network aggregates
  const totalBeds    = phcs.reduce((a, p) => a + p.beds, 0);
  const totalOcc     = phcs.reduce((a, p) => a + p.occupied, 0);
  const totalStaff   = phcs.reduce((a, p) => a + p.staff, 0);
  const totalPresent = phcs.reduce((a, p) => a + p.present, 0);
  const totalUse     = phcs.reduce((a, p) => a + p.dailyUse, 0);
  const totalStockDays = phcs.map(p => days(p)).filter(d => d < 999);
  const avgStockDays = totalStockDays.length ? Math.round(totalStockDays.reduce((a, b) => a + b, 0) / totalStockDays.length) : 0;
  const bedPct       = pct(totalOcc, totalBeds);
  const staffPct     = pct(totalPresent, totalStaff);
  const criticalCount= phcs.filter(p => p.status === 'CRITICAL').length;
  const stockoutCount= phcs.filter(p => days(p) < 7).length;

  // Chart data
  const bedData     = [...phcs].sort((a, b) => pct(b.occupied, b.beds) - pct(a.occupied, a.beds))
    .slice(0, 14).map(p => ({ label: p.name.replace(/^PHC |AAM-PHC$/, '').slice(0, 12), value: pct(p.occupied, p.beds), status: p.status }));
  const stockData   = [...phcs].sort((a, b) => days(a) - days(b))
    .slice(0, 14).map(p => ({ label: p.name.replace(/^PHC |AAM-PHC$/, '').slice(0, 12), value: Math.min(days(p), 60), status: p.status }));
  const staffData   = [...phcs].sort((a, b) => pct(a.present, a.staff) - pct(b.present, b.staff))
    .slice(0, 14).map(p => ({ label: p.name.replace(/^PHC |AAM-PHC$/, '').slice(0, 12), value: pct(p.present, p.staff), status: p.status }));
  const footfallData= [...phcs].sort((a, b) => pct(b.footfall, b.baseline) - pct(a.footfall, a.baseline))
    .slice(0, 14).map(p => ({ label: p.name.replace(/^PHC |AAM-PHC$/, '').slice(0, 12), value: pct(p.footfall, p.baseline), status: p.status }));
  const utilizationData = [...phcs].map(p => ({
    label:  p.name.replace(/^PHC |AAM-PHC$/, '').slice(0, 12),
    value:  Math.round((pct(p.occupied, p.beds) * 0.4 + pct(p.present, p.staff) * 0.3 + Math.min(100, pct(p.footfall, p.baseline)) * 0.3)),
    status: p.status,
  })).sort((a, b) => b.value - a.value).slice(0, 14);

  // Forecast series (synthetic 14-day from stock)
  const forecastSeries = phcs.slice(0, 3).map((p, i) => ({
    label:  p.name,
    values: Array.from({ length: 14 }, (_, d) => Math.max(0, p.stock - p.dailyUse * d)),
    color:  ['#176b60', '#c27621', '#c0392b'][i],
  }));

  // District imbalance data
  const districtMap: Record<string, { beds: number; occ: number; stock: number; phcCount: number }> = {};
  phcs.forEach(p => {
    if (!districtMap[p.district]) districtMap[p.district] = { beds: 0, occ: 0, stock: 0, phcCount: 0 };
    districtMap[p.district].beds += p.beds;
    districtMap[p.district].occ  += p.occupied;
    districtMap[p.district].stock += p.stock;
    districtMap[p.district].phcCount++;
  });
  const districtData = Object.entries(districtMap).map(([d, v]) => ({
    label: d.slice(0, 14), value: pct(v.occ, v.beds), status: v.occ / v.beds > .85 ? 'CRITICAL' : v.occ / v.beds > .7 ? 'WARNING' : 'NORMAL',
  })).sort((a, b) => b.value - a.value);

  // Auto-generated insights
  const insights: { level: 'CRITICAL' | 'WARNING' | 'INFO'; what: string; why: string; risk: string; action: string }[] = [];
  if (stockoutCount > 0) insights.push({
    level: 'CRITICAL',
    what:  `${stockoutCount} facilit${stockoutCount > 1 ? 'ies' : 'y'} facing stock-out within 7 days`,
    why:   `Daily consumption exceeds replenishment rate; stock depletion projected in ≤7 days at current use.`,
    risk:  'Patients unable to receive essential medicines; care continuity disrupted.',
    action:'Initiate emergency redistribution from surplus facilities. Review supply chain for affected districts.',
  });
  if (bedPct > 85) insights.push({
    level: 'CRITICAL',
    what:  `Network bed occupancy at ${bedPct}% — above 85% safety threshold`,
    why:   `${totalOcc} of ${totalBeds} beds occupied across filtered scope.`,
    risk:  'No surge capacity. Any emergency admission may require diversion.',
    action:'Activate capacity expansion protocols. Consider temporary bed augmentation or patient redistribution.',
  });
  if (staffPct < 80) insights.push({
    level: 'WARNING',
    what:  `Staff attendance at ${staffPct}% — below 80% operational standard`,
    why:   'Multiple PHCs reporting staff absence; surge absorption capacity reduced.',
    risk:  'Clinical service quality degraded. Unable to sustain peak-demand operations.',
    action:'Review workforce coverage. Coordinate relief staff from district pool.',
  });
  const surgePhcs = phcs.filter(p => p.footfall > p.baseline * 1.25);
  if (surgePhcs.length > 0) insights.push({
    level: 'WARNING',
    what:  `${surgePhcs.length} facilit${surgePhcs.length > 1 ? 'ies' : 'y'} reporting patient surge above baseline`,
    why:   `Footfall exceeds local baseline by >25% at ${surgePhcs.map(p => p.name).join(', ')}.`,
    risk:  'Combined pressure on beds, medicines and workforce.',
    action:'Monitor trends. If sustained >48h, escalate to district coordination.',
  });
  if (insights.length === 0) insights.push({
    level: 'INFO',
    what:  'No critical signals detected in selected scope',
    why:   'All monitored facilities are within normal operating parameters.',
    risk:  'Routine monitoring recommended.',
    action:'Continue scheduled reporting. Review forecast for early warnings.',
  });

  // Critical PHC ranking
  const criticalRanking = [...phcs].sort((a, b) => {
    const scoreA = (a.status === 'CRITICAL' ? 50 : a.status === 'WARNING' ? 25 : 0) + pct(a.occupied, a.beds) * 0.3 + (100 - Math.min(100, days(a) * 5));
    const scoreB = (b.status === 'CRITICAL' ? 50 : b.status === 'WARNING' ? 25 : 0) + pct(b.occupied, b.beds) * 0.3 + (100 - Math.min(100, days(b) * 5));
    return scoreB - scoreA;
  }).slice(0, 8);

  const reportTs = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' });

  return (
    <Shell
      title="Analytics & intelligence"
      sub="Operational analytics, executive intelligence and resource imbalance"
      onPrint={handlePrint}
      onRefresh={load}
    >
      <div ref={reportRef} className="an-root">
        {/* ── Filter bar ──────────────────────────────────────── */}
        <div className="an-filters no-print">
          <span className="an-filters-label"><Filter size={11} /> Scope</span>
          <select className="control" value={country}  onChange={e => { setCountry(e.target.value); setRegion('ALL'); setDistrict('ALL'); }}>
            <option value="ALL">All countries</option>
            {countries.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="control" value={region}   onChange={e => { setRegion(e.target.value); setDistrict('ALL'); }}>
            <option value="ALL">All regions / states</option>
            {regions.map(r => <option key={r}>{r}</option>)}
          </select>
          <select className="control" value={district} onChange={e => setDistrict(e.target.value)}>
            <option value="ALL">All districts</option>
            {districts.map(d => <option key={d}>{d}</option>)}
          </select>
          <select className="control" value={status}   onChange={e => setStatus(e.target.value)}>
            <option value="ALL">All statuses</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARNING">Warning</option>
            <option value="NORMAL">Normal</option>
          </select>
          {(country !== 'ALL' || region !== 'ALL' || district !== 'ALL' || status !== 'ALL') && (
            <button className="btn secondary" style={{ height: 30, padding: '0 10px', fontSize: 11 }}
              onClick={() => { setCountry('ALL'); setRegion('ALL'); setDistrict('ALL'); setStatus('ALL'); }}>
              Clear
            </button>
          )}
          <span className="an-scope-note">{phcs.length} of {snap.phcs.length} PHCs</span>
        </div>

        {/* ── Report header (print only) ────────────────────── */}
        <div className="an-report-header print-only">
          <div className="an-report-title">SwasthyaGrid · Operational Intelligence Report</div>
          <div className="an-report-meta">
            Generated: {reportTs} IST · Scope: {country !== 'ALL' ? country : 'BRICS network'}{region !== 'ALL' ? ` › ${region}` : ''}{district !== 'ALL' ? ` › ${district}` : ''} · {phcs.length} PHCs
          </div>
          <div className="an-report-sim-notice">
            NOTICE: Operational metrics (bed occupancy, stock levels, staffing, patient footfall) are SIMULATED for demonstration purposes.
            They do NOT represent real clinical records. Facility locations marked VERIFIED are based on public OpenStreetMap / government registry data.
          </div>
        </div>

        {/* ── Executive KPIs ──────────────────────────────────── */}
        <div className="an-section-head">
          <h2>Executive summary</h2>
          <p>{phcs.length} facilities · generated {reportTs}</p>
        </div>

        <div className="an-kpi-row">
          <div className="an-kpi">
            <div className="an-kpi-label">Network PHCs</div>
            <div className="an-kpi-value">{phcs.length}</div>
            <div className="an-kpi-note">{criticalCount} critical</div>
          </div>
          <div className={'an-kpi ' + (bedPct > 85 ? 'an-kpi-red' : bedPct > 70 ? 'an-kpi-amber' : '')}>
            <div className="an-kpi-label">Bed occupancy</div>
            <div className="an-kpi-value">{bedPct}%</div>
            <div className="an-kpi-note">{totalOcc}/{totalBeds} beds · 85% threshold</div>
          </div>
          <div className={'an-kpi ' + (staffPct < 75 ? 'an-kpi-red' : staffPct < 85 ? 'an-kpi-amber' : '')}>
            <div className="an-kpi-label">Staff attendance</div>
            <div className="an-kpi-value">{staffPct}%</div>
            <div className="an-kpi-note">{totalPresent}/{totalStaff} staff</div>
          </div>
          <div className={'an-kpi ' + (stockoutCount > 0 ? 'an-kpi-red' : '')}>
            <div className="an-kpi-label">Stock-out risks</div>
            <div className="an-kpi-value">{stockoutCount}</div>
            <div className="an-kpi-note">facilities &lt;7 days stock</div>
          </div>
          <div className="an-kpi">
            <div className="an-kpi-label">Avg stock days</div>
            <div className="an-kpi-value">{avgStockDays}</div>
            <div className="an-kpi-note">{totalUse} units/day consumption</div>
          </div>
          <div className={'an-kpi ' + (snap.network.patientSurges > 0 ? 'an-kpi-amber' : '')}>
            <div className="an-kpi-label">Patient surges</div>
            <div className="an-kpi-value">{snap.network.patientSurges}</div>
            <div className="an-kpi-note">&gt;25% above baseline</div>
          </div>
        </div>

        {/* ── Gauges ──────────────────────────────────────────── */}
        <div className="an-gauges">
          <Gauge pct={bedPct}   label="Bed occupancy"   color={bedPct   > 85 ? '#c0392b' : bedPct   > 70 ? '#c27621' : '#176b60'} />
          <Gauge pct={staffPct} label="Staff attendance" color={staffPct < 75 ? '#c0392b' : staffPct < 85 ? '#c27621' : '#176b60'} />
          <Gauge pct={Math.round(pct(phcs.reduce((a,p)=>a+p.footfall,0), phcs.reduce((a,p)=>a+p.baseline,0)))} label="Footfall vs baseline" color="#c27621" />
          <Gauge pct={Math.round(100 - stockoutCount / Math.max(1, phcs.length) * 100)} label="Medicine coverage" color={stockoutCount > 0 ? '#c0392b' : '#176b60'} />
        </div>

        {/* ── Operational insights ───────────────────────────── */}
        <div className="an-section-head" style={{ marginTop: 28 }}>
          <h2>Operational insights</h2>
          <p>Auto-generated from current network state · operator review required</p>
        </div>
        <div className="an-insights-grid">
          {insights.map((ins, i) => <Insight key={i} {...ins} />)}
        </div>

        {/* ── Charts ─── 2-col responsive grid ──────────────── */}
        <div className="an-section-head" style={{ marginTop: 28 }}>
          <h2>Network charts</h2>
        </div>
        <div className="an-charts-grid">

          {/* 1 — Bed occupancy ranking */}
          <div className="panel an-chart-panel">
            <div className="an-chart-title">
              <Bed size={13} /> Bed occupancy by facility
              <span className="an-benchmark-note">— — 85% threshold</span>
            </div>
            <BarChart data={bedData} valueKey="value" labelKey="label" benchmarkPct={85} unit="%" height={148} />
          </div>

          {/* 2 — Stock days remaining */}
          <div className="panel an-chart-panel">
            <div className="an-chart-title">
              <Package size={13} /> Medicine stock days remaining
              <span className="an-benchmark-note">— — 7-day risk zone</span>
            </div>
            <BarChart data={stockData} valueKey="value" labelKey="label" benchmarkPct={undefined} color="#176b60" unit="d" height={148}
              maxVal={65}
            />
            <div style={{ height: 1, background: '#b91c1c', margin: '2px 0 4px', opacity: .5 }} />
            <div style={{ fontSize: 9, color: '#b91c1c', textAlign: 'right' }}>Red = &lt;7 days</div>
          </div>

          {/* 3 — Staff attendance */}
          <div className="panel an-chart-panel">
            <div className="an-chart-title">
              <Users size={13} /> Staff attendance by facility
              <span className="an-benchmark-note">— — 80% standard</span>
            </div>
            <BarChart data={staffData} valueKey="value" labelKey="label" benchmarkPct={80} unit="%" height={148} />
          </div>

          {/* 4 — Patient footfall vs baseline */}
          <div className="panel an-chart-panel">
            <div className="an-chart-title">
              <Activity size={13} /> Patient footfall vs baseline (%)
              <span className="an-benchmark-note">— — 100% = baseline</span>
            </div>
            <BarChart data={footfallData} valueKey="value" labelKey="label" benchmarkPct={100} color="#6366f1" unit="%" height={148} />
          </div>

          {/* 5 — Resource utilisation composite */}
          <div className="panel an-chart-panel">
            <div className="an-chart-title">
              <BarChart3 size={13} /> PHC resource utilisation score
            </div>
            <BarChart data={utilizationData} valueKey="value" labelKey="label" unit="%" height={148} />
          </div>

          {/* 6 — Stock forecast lines */}
          <div className="panel an-chart-panel">
            <div className="an-chart-title">
              <TrendingDown size={13} /> Medicine stock depletion forecast (14-day)
            </div>
            <LineChart series={forecastSeries} height={130} />
            <div className="an-chart-legend">
              {forecastSeries.map((s, i) => (
                <span key={i}><i style={{ background: s.color }} />{s.label.slice(0, 18)}</span>
              ))}
            </div>
          </div>

          {/* 7 — District bed imbalance */}
          <div className="panel an-chart-panel">
            <div className="an-chart-title">
              <BarChart3 size={13} /> District bed occupancy comparison
            </div>
            <BarChart data={districtData} valueKey="value" labelKey="label" benchmarkPct={85} unit="%" height={148} />
          </div>

          {/* 8 — Risk matrix */}
          <div className="panel an-chart-panel">
            <div className="an-chart-title">
              <AlertTriangle size={13} /> Risk matrix: stock-out risk vs bed pressure
            </div>
            <RiskMatrix data={phcs} />
            <div className="an-chart-legend">
              <span><i style={{ background: '#c0392b' }} />Critical</span>
              <span><i style={{ background: '#c27621' }} />Warning</span>
              <span><i style={{ background: '#217a57' }} />Normal</span>
            </div>
          </div>

        </div>

        {/* ── Critical PHC ranking ────────────────────────────── */}
        <div className="an-section-head" style={{ marginTop: 28 }}>
          <h2>Critical facility ranking</h2>
          <p>Ranked by composite risk score: status + bed occupancy + medicine days</p>
        </div>
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>#</th><th>Facility</th><th>District · State</th>
                <th>Status</th><th>Bed occ.</th><th>Stock days</th>
                <th>Staff</th><th>Footfall</th><th>Medicine</th>
              </tr>
            </thead>
            <tbody>
              {criticalRanking.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{i + 1}</td>
                  <td>
                    <b>{p.name}</b>
                    {p.locationSource === 'simulated' && <span className="an-sim-tag">SIM</span>}
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 11 }}>{p.district} · {p.region}</td>
                  <td><span className={'badge ' + riskClass(p.status)}>{p.status}</span></td>
                  <td className={pct(p.occupied, p.beds) > 85 ? 'critical' : pct(p.occupied, p.beds) > 70 ? 'warning' : ''}>
                    {pct(p.occupied, p.beds)}%
                  </td>
                  <td className={days(p) < 7 ? 'critical' : days(p) < 14 ? 'warning' : ''}>
                    {days(p) < 999 ? days(p) + 'd' : '—'}
                  </td>
                  <td>{pct(p.present, p.staff)}%</td>
                  <td className={p.footfall > p.baseline * 1.25 ? 'warning' : ''}>{pct(p.footfall, p.baseline)}%</td>
                  <td>{p.medicine}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Horizontal rank bars ───────────────────────────── */}
        <div className="an-two-col" style={{ marginTop: 20 }}>
          <div className="panel">
            <div className="an-chart-title" style={{ marginBottom: 12 }}>
              <TrendingUp size={13} /> Redistribution impact potential
            </div>
            {phcs.filter(p => p.status === 'CRITICAL' || p.status === 'WARNING').slice(0, 7).map(p => (
              <RankBar key={p.id} label={p.name.slice(0, 20)}
                value={Math.max(0, p.dailyUse * 14 - p.stock)}
                max={500} color={p.status === 'CRITICAL' ? '#c0392b' : '#c27621'}
                note=" units needed"
              />
            ))}
          </div>
          <div className="panel">
            <div className="an-chart-title" style={{ marginBottom: 12 }}>
              <Package size={13} /> Surplus facilities (supply available)
            </div>
            {phcs.filter(p => p.stock - p.dailyUse * 21 > 0).slice(0, 7).map(p => (
              <RankBar key={p.id} label={p.name.slice(0, 20)}
                value={Math.round(p.stock - p.dailyUse * 21)}
                max={800} color="#217a57"
                note=" units surplus"
              />
            ))}
          </div>
        </div>

        {/* ── Active alerts table ─────────────────────────────── */}
        {alerts.length > 0 && (
          <>
            <div className="an-section-head" style={{ marginTop: 28 }}>
              <h2>Active early warnings</h2>
              <p>{alerts.filter(a => phcs.some(p => p.name === a.phcName)).length} in current scope</p>
            </div>
            <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="table">
                <thead>
                  <tr><th>Severity</th><th>Category</th><th>Facility</th><th>Message</th><th>Recommended</th></tr>
                </thead>
                <tbody>
                  {alerts.filter(a => phcs.some(p => p.name === a.phcName)).slice(0, 12).map((a: any) => (
                    <tr key={a.id}>
                      <td><span className={'badge ' + (a.severity === 'CRITICAL' ? 'red' : 'amber')}>{a.severity}</span></td>
                      <td style={{ fontSize: 11, color: 'var(--muted)' }}>{a.category}</td>
                      <td><b>{a.phcName}</b><br /><small>{a.district}</small></td>
                      <td style={{ fontSize: 11 }}>{a.message}</td>
                      <td style={{ fontSize: 11, color: 'var(--teal)' }}>{a.recommended}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Methodology / data source note ─────────────────── */}
        <div className="an-methodology">
          <div className="an-methodology-head"><Info size={12} /> Data source &amp; methodology</div>
          <div className="an-methodology-body">
            <p><b>VERIFIED REAL LOCATIONS:</b> Lojhara AAM-PHC (Myorpur, Sonbhadra), PHC Kakrahi (Myorpur, Sonbhadra), PHC Chatra (Sonbhadra), PHC Lucknow Sadar — facility names and geographic coordinates sourced from OpenStreetMap and publicly available UP NHM health facility directories.</p>
            <p><b>SIMULATED OPERATIONAL DATA:</b> All bed occupancy, stock levels, staff attendance, patient footfall, and medicine consumption figures shown in this platform are synthetically generated for demonstration purposes. They do NOT represent real clinical, administrative, or government data.</p>
            <p><b>ANALYTICS METHOD:</b> Resource utilisation score = weighted composite of bed occupancy (40%), staff attendance (30%), and footfall-to-baseline ratio (30%). Risk matrix plots stock-out risk against bed pressure per facility. Forecast uses linear depletion from current stock at reported daily consumption rate.</p>
            <p><b>DISCLAIMER:</b> This platform is a prototype operational decision-support tool. It does not diagnose, prescribe, or make autonomous decisions. All recommendations require qualified operator review. Not connected to any live government or clinical system.</p>
          </div>
        </div>

        {/* ── Print footer ─────────────────────────────────────── */}
        <div className="an-print-footer print-only">
          SwasthyaGrid BRICS Healthcare Intelligence Platform — Simulated Prototype — {reportTs} IST
        </div>
      </div>
    </Shell>
  );
}

/* ── Shell ────────────────────────────────────────────────────── */
function Shell({
  title, sub, children, onPrint, onRefresh,
}: { title: string; sub: string; children: React.ReactNode; onPrint?: () => void; onRefresh?: () => void }) {
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">SwasthyaGrid<small>RESILIENCE OPERATIONS</small></div>
        <Link href="/dashboard" className="backlink"><ArrowLeft size={14} /> Command center</Link>
        <div className="sidefoot">
          SIMULATED DATA<br />Operational analytics prototype.
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">
              <h1>{title}</h1>
              <p>{sub}</p>
            </div>
          </div>
          <div className="topright">
            <span className="demo">SIMULATED DATA</span>
            {onRefresh && (
              <button className="iconbtn" onClick={onRefresh} aria-label="Refresh data"><RefreshCw size={13} /></button>
            )}
            {onPrint && (
              <button className="btn secondary" onClick={onPrint} style={{ gap: 5 }}>
                <Printer size={13} /> Generate report
              </button>
            )}
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
