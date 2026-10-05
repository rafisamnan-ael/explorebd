import { useEffect, useMemo, useRef, useState } from 'react';
import DistrictSelector from './components/DistrictSelector';
import TravelCard from './components/TravelCard';
import TripPlanner from './components/TripPlanner';
import Guide from './components/Guide';
import { districts } from './data/districts';
import { exportNode } from './lib/export';
import { loadState, saveState } from './lib/storage';
import './styles.css';

type Tab = 'map' | 'guide' | 'planner';

export default function App() {
  const initial = loadState();
  const [visited, setVisited] = useState<string[]>(initial.visited);
  const [theme, setTheme] = useState(initial.theme);
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [tab, setTab] = useState<Tab>('map');
  const cardRef = useRef<HTMLDivElement>(null);
  const selected = useMemo(() => new Set(visited), [visited]);

  useEffect(() => saveState({ visited, theme, displayName }), [visited, theme, displayName]);

  const toggle = (id: string) => setVisited(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]);
  const download = async (type: 'png'|'jpg'|'pdf') => cardRef.current && exportNode(cardRef.current, type);

  return <main>
    <header className="topbar"><div><strong>Explore Bangladesh</strong><span>clean-room starter</span></div><nav>{(['map','guide','planner'] as Tab[]).map(t => <button key={t} className={tab === t ? 'nav-active' : ''} onClick={() => setTab(t)}>{t}</button>)}</nav></header>
    {tab === 'map' && <>
      <section className="hero"><span>64 districts · 8 divisions</span><h1>বাংলাদেশের কতটুকু ঘুরে দেখেছেন?</h1><p>Districts select করুন, theme দিন, নিজের নাম লিখুন এবং shareable map export করুন.</p></section>
      <div className="layout"><DistrictSelector selected={selected} onToggle={toggle} onSelectAll={() => setVisited(districts.map(d => d.id))} onClear={() => setVisited([])} />
        <section className="panel preview-panel"><div className="controls"><input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="আপনার নাম (ঐচ্ছিক)" /><select value={theme} onChange={e => setTheme(e.target.value)}><option value="emerald">Emerald</option><option value="ocean">Ocean</option><option value="sunset">Sunset</option><option value="mono">Mono</option><option value="violet">Violet</option></select></div><TravelCard ref={cardRef} selected={selected} name={displayName} theme={theme} onToggle={toggle} /><div className="button-row export"><button onClick={() => download('png')}>↓ PNG</button><button onClick={() => download('jpg')}>↓ JPG</button><button onClick={() => download('pdf')}>↓ PDF</button></div></section>
      </div>
    </>}
    {tab === 'guide' && <Guide />}
    {tab === 'planner' && <TripPlanner />}
    <footer>Starter architecture for a Bangladesh travel map, guide and trip-planning product.</footer>
  </main>;
}
