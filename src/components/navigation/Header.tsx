import { Link, NavLink, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { brand } from '@/config/brand';
import { features } from '@/config/features';
import { useI18n } from '@/i18n';
import { useUiStore } from '@/store/uiStore';
import { Dropdown } from '@/components/ui/Dropdown';
import { LocaleSwitcher, ThemeToggle } from './Controls';
import { Logo } from './Logo';

const mainLinks = [
  { to: '/map', key: 'nav.map' },
  { to: '/guide', key: 'nav.guide' },
  { to: '/planner', key: 'nav.planner' },
  { to: '/passport', key: 'nav.passport' },
  { to: '/games', key: 'nav.games' },
] as const;

export function Header() {
  const { t } = useI18n();
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const location = useLocation();

  const moreLinks = [
    features.worldMap ? { to: '/world', key: 'nav.world' } : null,
    { to: '/share', key: 'share.studio' },
    { to: '/famous', key: 'nav.famous' },
    features.travelJournal ? { to: '/journal', key: 'nav.journal' } : null,
    features.leaderboard ? { to: '/leaderboard', key: 'nav.leaderboard' } : null,
    { to: '/trips', key: 'planner.savedDrafts' },
    { to: '/about', key: 'nav.about' },
  ].filter(Boolean) as Array<{ to: string; key: string }>;

  const moreActive = moreLinks.some((l) => location.pathname.startsWith(l.to));

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link to="/" className="site-logo" aria-label={t('nav.home')}>
          <Logo />
          <span className="site-logo-text">
            <strong>{brand.name}</strong>
            <span className="subtle">{brand.tagline}</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label={t('nav.menu')}>
          {mainLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `site-nav-link ${isActive ? 'is-active' : ''}`}
            >
              {t(link.key)}
            </NavLink>
          ))}
          <Dropdown label={<span className={moreActive ? 'is-active-text' : ''}>{t('nav.more')}</span>}>
            {(close) => (
              <>
                {moreLinks.map((link) => (
                  <Link key={link.to} to={link.to} className="dropdown-item" role="menuitem" onClick={close}>
                    {t(link.key)}
                  </Link>
                ))}
                <div className="dropdown-divider" />
                <Link to="/settings" className="dropdown-item" role="menuitem" onClick={close}>
                  {t('nav.settings')}
                </Link>
              </>
            )}
          </Dropdown>
        </nav>

        <div className="site-actions">
          <button
            type="button"
            className="btn-icon"
            aria-label={t('a11y.openSearch')}
            onClick={() => setSearchOpen(true)}
          >
            <Search size={19} aria-hidden />
          </button>
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
