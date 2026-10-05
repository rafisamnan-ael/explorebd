import { useI18n } from '@/i18n';
import { brand } from '@/config/brand';
import { PageHero } from '@/components/common/Chrome';

export function StaticProsePage({
  titleKey,
  introKey,
  sections,
}: {
  titleKey: string;
  introKey: string;
  sections: Array<{ titleKey: string; bodyKey: string }>;
}) {
  const { t } = useI18n();
  return (
    <div className="container page">
      <PageHero title={t(titleKey)} body={t(introKey)} />
      <div className="prose">
        {sections.map((section) => (
          <section key={section.titleKey} style={{ marginBottom: 28 }}>
            <h2>{t(section.titleKey)}</h2>
            <p>{t(section.bodyKey)}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

export default function AboutPage() {
  const { t } = useI18n();
  const values = [t('about.value1'), t('about.value2'), t('about.value3')];
  return (
    <div className="container page">
      <PageHero eyebrow={brand.name} title={t('about.title')} body={t('about.body')} />
      <section className="prose">
        <h2>{t('about.values')}</h2>
        <ul style={{ listStyle: 'none', display: 'grid', gap: 10, marginTop: 12 }}>
          {values.map((value) => (
            <li key={value} className="card card-pad">
              {value}
            </li>
          ))}
        </ul>
        <h2>{t('about.openSource')}</h2>
        <p>
          {t('home.trustBody')} <a href="/credits">{t('home.viewCredits')}</a>.
        </p>
      </section>
    </div>
  );
}
