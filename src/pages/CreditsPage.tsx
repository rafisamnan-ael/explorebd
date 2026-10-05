import { useI18n } from '@/i18n';
import { PageHero } from '@/components/common/Chrome';

const dataSources = [
  {
    name: 'geoBoundaries — gbOpen Bangladesh ADM2',
    url: 'https://www.geoboundaries.org/',
    license: 'CC BY 4.0',
    note: 'District boundaries. Underlying: Bangladesh Bureau of Statistics (BBS) / OCHA ROAP.',
  },
  {
    name: 'open-admin-data/bangladesh-administrative-divisions',
    url: 'https://github.com/open-admin-data/bangladesh-administrative-divisions',
    license: 'See repository licence',
    note: 'Division and district names, Bangla names and coordinates.',
  },
  {
    name: 'Natural Earth — 1:110m Admin 0 countries',
    url: 'https://www.naturalearthdata.com/',
    license: 'Public domain',
    note: 'World map country boundaries.',
  },
  {
    name: 'OpenFreeMap',
    url: 'https://openfreemap.org/',
    license: 'See OpenFreeMap terms',
    note: 'Optional basemap tiles and fonts, with attribution.',
  },
  {
    name: 'OpenStreetMap contributors',
    url: 'https://www.openstreetmap.org/copyright',
    license: 'ODbL',
    note: 'Underlying map data for basemap tiles.',
  },
];

export default function CreditsPage() {
  const { t } = useI18n();
  return (
    <div className="container page">
      <PageHero title={t('credits.title')} body={t('credits.subtitle')} />

      <section>
        <h2 className="section-title">{t('credits.dataHeading')}</h2>
        <div className="stack" style={{ gap: 12, marginTop: 16 }}>
          {dataSources.map((source) => (
            <div key={source.name} className="card card-pad stack" style={{ gap: 4 }}>
              <a href={source.url} target="_blank" rel="noreferrer" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                {source.name}
              </a>
              <span className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>{source.license}</span>
              <p className="muted" style={{ fontSize: '0.88rem' }}>{source.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">{t('credits.imageHeading')}</h2>
        <p className="muted">{t('credits.noImages')}</p>
      </section>

      <p className="subtle" style={{ fontSize: '0.82rem' }}>
        {t('home.trustBody')}
      </p>
    </div>
  );
}
