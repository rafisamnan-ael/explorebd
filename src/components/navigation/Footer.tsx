import { Link } from 'react-router-dom';
import { brand } from '@/config/brand';
import { features } from '@/config/features';
import { useI18n } from '@/i18n';
import { Logo } from './Logo';

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t('footer.product'),
      links: [
        { to: '/map', label: t('nav.map') },
        { to: '/guide', label: t('nav.guide') },
        { to: '/planner', label: t('nav.planner') },
        { to: '/passport', label: t('nav.passport') },
        { to: '/games', label: t('nav.games') },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { to: '/about', label: t('nav.about') },
        { to: '/credits', label: t('credits.title') },
        { to: '/settings', label: t('nav.settings') },
        features.worldMap ? { to: '/world', label: t('nav.world') } : null,
      ].filter(Boolean) as Array<{ to: string; label: string }>,
    },
    {
      title: t('footer.legal'),
      links: [
        { to: '/privacy', label: t('privacy.title') },
        { to: '/terms', label: t('terms.title') },
      ],
    },
  ];

  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div className="site-footer-brand">
          <div className="site-logo">
            <Logo size={30} />
            <strong>{brand.name}</strong>
          </div>
          <p className="muted" style={{ maxWidth: 320 }}>
            {t('app.description')}
          </p>
          <p className="subtle" style={{ fontSize: '0.8rem' }}>
            {t('footer.languageNote')}
          </p>
        </div>
        <div className="site-footer-cols">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="site-footer-heading">{column.title}</h3>
              <ul className="site-footer-list">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="container site-footer-bottom">
        <span>
          © {year} {brand.name}. {t('footer.rights')}
        </span>
        <span className="subtle">© OpenFreeMap · © OpenStreetMap contributors · geoBoundaries CC BY 4.0</span>
      </div>
    </footer>
  );
}
