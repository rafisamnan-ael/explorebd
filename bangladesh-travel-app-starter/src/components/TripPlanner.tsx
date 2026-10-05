import { useMemo, useState } from 'react';
import { districts } from '../data/districts';
import { nearestNeighborRoute, routeDistanceKm } from '../lib/route';

export default function TripPlanner() {
  const [start, setStart] = useState('dhaka');
  const [stops, setStops] = useState<string[]>(['coxsbazar','chattogram']);
  const [roundTrip, setRoundTrip] = useState(true);
  const route = useMemo(() => {
    const s = districts.find(d => d.id === start)!;
    const selected = districts.filter(d => stops.includes(d.id));
    return nearestNeighborRoute(s, selected, roundTrip);
  }, [start, stops, roundTrip]);
  const distance = routeDistanceKm(route);

  const toggleStop = (id: string) => setStops(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]);

  return <section className="panel planner"><h2>Trip Planner</h2>
    <label>Start district<select value={start} onChange={e => setStart(e.target.value)}>{districts.map(d => <option value={d.id} key={d.id}>{d.bnName} · {d.name}</option>)}</select></label>
    <div className="chips planner-chips">{districts.map(d => <button key={d.id} className={stops.includes(d.id) ? 'chip active' : 'chip'} onClick={() => toggleStop(d.id)}>{d.bnName}</button>)}</div>
    <label className="check"><input type="checkbox" checked={roundTrip} onChange={e => setRoundTrip(e.target.checked)} /> Return to start</label>
    <div className="route-box"><strong>Optimized order</strong><ol>{route.map((d, i) => <li key={`${d.id}-${i}`}>{d.bnName} <small>{d.name}</small></li>)}</ol><p>Approx. straight-line route: <strong>{Math.round(distance)} km</strong></p></div>
  </section>;
}
