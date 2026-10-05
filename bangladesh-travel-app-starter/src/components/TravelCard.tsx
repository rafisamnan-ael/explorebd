import { forwardRef } from 'react';
import { districts } from '../data/districts';
import DistrictMap from './DistrictMap';

type Props = { selected: Set<string>; name: string; theme: string; onToggle: (id: string) => void };

const TravelCard = forwardRef<HTMLDivElement, Props>(function TravelCard({ selected, name, theme, onToggle }, ref) {
  const selectedDistricts = districts.filter(d => selected.has(d.id));
  return <div ref={ref} className={`travel-card theme-${theme}`}>
    <div className="card-copy">
      <span className="eyebrow">MY BANGLADESH</span>
      <h1>{name.trim() || 'আমার বাংলাদেশ'}</h1>
      <p>আমি ঘুরেছি <strong>{selected.size}</strong> / 64 জেলা</p>
      <div className="mini-list">{selectedDistricts.slice(0, 12).map(d => <span key={d.id}>{d.bnName}</span>)}{selectedDistricts.length > 12 && <span>+{selectedDistricts.length - 12} more</span>}</div>
    </div>
    <DistrictMap selected={selected} onToggle={onToggle} />
  </div>;
});
export default TravelCard;
