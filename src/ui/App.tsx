import { useMemo } from 'react';
import { StateProvider, useRoute, useApp } from './state';
import { Altro, ConceptPage, Fonti, Home, ModulePage, ModuliPage, Session, Settings } from './pages/pages';
import { OraleIndex, OralePage } from './pages/orale';
import { Piano, Progressi } from './pages/progressi';
import { Mappa } from './pages/mappa';
import { Simulatore } from './pages/simulatore';
import { LessonPage } from './components/Lesson';
import { Brand, Icon } from './components/Icon';
import { MODULES } from '../content/modules';
import { masteryByConcept, moduleMastery } from '../learning/mastery';
import { conceptIdsByModule } from '../content';

const NAV: { to: string; label: string; icon: string; also?: string[] }[] = [
  { to: '', label: 'Oggi', icon: 'oggi' },
  { to: 'sessione', label: 'Studia', icon: 'studia' },
  { to: 'moduli', label: 'Moduli', icon: 'moduli', also: ['modulo', 'concetto', 'lezione'] },
  { to: 'orale', label: 'Orale', icon: 'orale', also: ['simulatore'] },
  { to: 'mappa', label: 'Mappa', icon: 'modello' },
  { to: 'progressi', label: 'Progressi', icon: 'progressi' },
  { to: 'piano', label: 'Piano', icon: 'piano' },
  { to: 'fonti', label: 'Fonti', icon: 'fonti' },
  { to: 'impostazioni', label: 'Impostazioni', icon: 'impostazioni' },
];
/** schede della barra in basso su schermi stretti: le voci rimanenti stanno in «Altro» */
const TABS: { to: string; label: string; icon: string; also?: string[] }[] = [
  { to: '', label: 'Oggi', icon: 'oggi' },
  { to: 'sessione', label: 'Studia', icon: 'studia' },
  { to: 'moduli', label: 'Moduli', icon: 'moduli', also: ['modulo', 'concetto', 'lezione'] },
  { to: 'orale', label: 'Orale', icon: 'orale', also: ['simulatore'] },
  { to: 'altro', label: 'Altro', icon: 'altro', also: ['progressi', 'piano', 'fonti', 'impostazioni', 'mappa'] },
];

const SYNC_TEXT: Record<string, string> = {
  sincronizzato: 'Salvato sul tuo account',
  errore: 'Sincronizzazione non riuscita: i progressi restano nel browser',
  collegamento: "Collegamento all'account…",
  locale: 'Salvato in questo browser',
};

function SyncStatus({ compact = false }: { compact?: boolean }) {
  const { sync } = useApp();
  const text = SYNC_TEXT[sync.status] ?? SYNC_TEXT.locale;
  return (
    <a href="#/impostazioni" className={`sync-status sync-${sync.status}`} title={text} aria-label={`Stato del salvataggio: ${text}`}>
      <span className="sync-dot" />
      {!compact && <span className="sync-text">{text}</span>}
    </a>
  );
}

function BrandLink({ size = 30 }: { size?: number }) {
  const { sync } = useApp();
  return (
    <a href="#/" className="brand">
      <Brand size={size} busy={sync.status === 'collegamento'} />
      <span>
        SdC <span className="brand-sub">· orale</span>
      </span>
    </a>
  );
}

function Sidebar() {
  const r = useRoute();
  const { state } = useApp();
  const cur = r[0] ?? '';
  const byMod = useMemo(() => conceptIdsByModule(), []);
  const mm = useMemo(() => moduleMastery(masteryByConcept(state), byMod), [state, byMod]);
  return (
    <aside className="sidebar">
      <BrandLink />
      <nav className="side-nav" aria-label="Sezioni">
        {NAV.map((n) => {
          const on = cur === n.to || (n.to === 'orale' && cur === 'orale');
          return (
            <a key={n.to} href={`#/${n.to}`} className={on ? 'on' : ''} aria-current={on ? 'page' : undefined}>
              <Icon name={n.icon} />
              {n.label}
            </a>
          );
        })}
      </nav>
      <div className="side-modules" aria-label="Moduli">
        <p className="side-title">Moduli</p>
        {MODULES.map((m) => {
          const on = cur === 'modulo' && r[1] === m.id;
          const has = (byMod[m.id] ?? []).length > 0;
          return (
            <a key={m.id} href={`#/modulo/${m.id}`} className={`side-mod mod-${m.id} ${on ? 'on' : ''}`}>
              <span className="mod-chip">{m.id.slice(1)}</span>
              <span className="side-mod-title">{m.short}</span>
              {has ? (
                <span className="mini-bar">
                  <span style={{ width: `${Math.round((mm[m.id] ?? 0) * 100)}%` }} />
                </span>
              ) : (
                <span className="side-soon">in arrivo</span>
              )}
            </a>
          );
        })}
      </div>
      <div className="side-foot">
        <SyncStatus />
      </div>
    </aside>
  );
}

function MobileBar() {
  return (
    <header className="mobilebar">
      <BrandLink size={24} />
      <SyncStatus compact />
    </header>
  );
}

function TabBar() {
  const r = useRoute();
  const cur = r[0] ?? '';
  return (
    <nav className="tabbar" aria-label="Sezioni">
      {TABS.map((t) => {
        const on = cur === t.to || !!t.also?.includes(cur);
        return (
          <a key={t.to} href={`#/${t.to}`} className={on ? 'on' : ''} aria-current={on ? 'page' : undefined}>
            <Icon name={t.icon} size={22} />
            <span>{t.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

function Router() {
  const [a, b] = useRoute();
  switch (a) {
    case 'sessione':
      return <Session />;
    case 'moduli':
      return <ModuliPage />;
    case 'altro':
      return <Altro />;
    case 'modulo':
      return <ModulePage key={b} id={b ?? 'm1'} />;
    case 'concetto':
      return <ConceptPage key={b} id={b ?? ''} />;
    case 'lezione':
      return <LessonPage key={b} id={b ?? ''} />;
    case 'orale':
      return b ? <OralePage key={b} id={b} /> : <OraleIndex />;
    case 'simulatore':
      return <Simulatore />;
    case 'mappa':
      return <Mappa />;
    case 'progressi':
      return <Progressi />;
    case 'piano':
      return <Piano />;
    case 'impostazioni':
      return <Settings />;
    case 'fonti':
      return <Fonti />;
    default:
      return <Home />;
  }
}

function Shell() {
  const r = useRoute();
  return (
    <div className="shell">
      <Sidebar />
      <MobileBar />
      <main key={r.join('/')} className={`route ${r[0] === 'lezione' ? 'wide' : ''}`}>
        <Router />
        <footer className="small muted">Unica fonte: la dispensa del corso di Scienza delle Costruzioni. Ogni contenuto cita capitolo, paragrafo e pagina.</footer>
      </main>
      <TabBar />
    </div>
  );
}

export default function App() {
  return (
    <StateProvider>
      <Shell />
    </StateProvider>
  );
}
