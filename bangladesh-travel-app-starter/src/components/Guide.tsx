const sample = [
  { district: 'ঢাকা', place: 'লালবাগ কেল্লা', best: 'শীতের বিকেল', cost: 'Low', tags: ['history','family'] },
  { district: 'কক্সবাজার', place: 'কক্সবাজার সমুদ্র সৈকত', best: 'নভেম্বর–মার্চ', cost: 'Medium', tags: ['beach','family'] },
  { district: 'সিলেট', place: 'রাতারগুল', best: 'বর্ষা', cost: 'Medium', tags: ['nature','boat'] },
];
export default function Guide() {
  return <section className="panel"><h2>Travel Guide data model</h2><p className="muted">Replace these samples with your CMS/API. Each place should have coordinates, seasonality, transport, cost, stay, food, safety and image-license metadata.</p><div className="guide-grid">{sample.map(x => <article key={x.place}><span>{x.district}</span><h3>{x.place}</h3><p>Best: {x.best}</p><p>Budget: {x.cost}</p><div className="tags">{x.tags.map(t => <em key={t}>{t}</em>)}</div></article>)}</div></section>;
}
