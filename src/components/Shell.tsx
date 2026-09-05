'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity, AlertTriangle, Boxes, Flame, LayoutDashboard,
  Package, ShieldCheck, Truck, Users, BrainCircuit, ArrowLeft,
  RefreshCw,
} from 'lucide-react';

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
      ['Emergency Response', '/emergency',    Flame],
      ['Federated AI',       '/federated',    ShieldCheck],
      ['Analytics',          '/analytics',    Activity],
      ['Beds',               '/beds',         Package],
      ['Workforce',          '/workforce',    Users],
      ['Patient Flow',       '/patient-flow', Activity],
    ],
  },
] as const;

type ShellProps = {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export default function Shell({ title, sub, actions, children }: ShellProps) {
  const path = usePathname();

  return (
    <div className="shell">
      {/* ── Sidebar ─────────────────────────────── */}
      <aside className="side">
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
                  className={'navlink' + (path === href ? ' active' : '')}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {path !== '/dashboard' && (
          <Link href="/dashboard" className="side-backlink">
            <ArrowLeft size={13} />
            <span>Command Center</span>
          </Link>
        )}

        <div className="sidefoot">
          <b>SIMULATED DATA</b><br />
          Prototype environment. No connection to government systems or clinical records.
          <br /><span className="mono" style={{ opacity: .45, fontSize: 9 }}>v0.9 · operator preview</span>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────── */}
      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">
              <h1>{title}</h1>
              {sub && <p>{sub}</p>}
            </div>
          </div>
          <div className="topright">
            <span className="demo">SIMULATED DATA</span>
            {actions}
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
