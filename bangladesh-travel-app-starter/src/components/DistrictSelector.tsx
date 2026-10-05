import { useMemo, useState } from 'react';
import { districts, divisions } from '../data/districts';

type Props = { selected: Set<string>; onToggle: (id: string) => void; onSelectAll: () => void; onClear: () => void };

export default function DistrictSelector({ selected, onToggle, onSelectAll, onClear }: Props) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => districts.filter(d => !q || d.name.toLowerCase().includes(q) || d.bnName.includes(query.trim())), [q, query]);

  return (
    <section className="panel">
      <div className="panel-head"><h2>যেসব জেলায় গিয়েছি</h2><strong>{selected.size} / 64</strong></div>
      <input className="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="জেলা খুঁজুন…" />
      <div className="button-row"><button onClick={onSelectAll}>সব বাছাই করুন</button><button className="ghost" onClick={onClear}>সব মুছুন</button></div>
      {divisions.map(div => {
        const items = filtered.filter(d => d.division === div);
        if (!items.length) return null;
        return <div key={div} className="division"><h3>{div}</h3><div className="chips">{items.map(d => <button key={d.id} onClick={() => onToggle(d.id)} className={selected.has(d.id) ? 'chip active' : 'chip'}>{d.bnName}<small>{d.name}</small></button>)}</div></div>;
      })}
    </section>
  );
}
