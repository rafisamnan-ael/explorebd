import { Link, NavLink, useLocation } from 'react-router-dom';
import { Search, UserRound } from 'lucide-react';
import { brand } from '@/config/brand';
import { features } from '@/config/features';
import { useI18n } from '@/i18n';
import { useUiStore } from '@/store/uiStore';
import { Dropdown } from '@/components/ui/Dropdown';
import { LocaleSwitcher, ThemeToggle } from './Controls';
import { Logo } from './Logo';

export function Header() {
  const { t } = useI18n();
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const location = useLocation();
  const month = new Date().getMonth() + 1;

  const exploreLinks = [
    { to: '/guide', key: 'nav.places' },
    { to: '/famous', key: 'nav.hiddenGems' },
    { to: `/season/${month}`, key: 'nav.seasonal' },
    { to: '/famous', key: 'nav.food' },
    { to: '/guide?interest=heritage', key: 'nav.heritage' },
    { to: '/guide?interest=nature', key: 'nav.nature' },
    { to: '/planner', key: 'nav.roadTrips' },
    { to: `/season/${month}`, key: 'nav.events' },
  ];

  const mainLinks = [
    { to: '/map', key: 'nav.map' },
    { to: '/guide', key: 'nav.places' },
    { to: '/planner', key: 'nav.planTrip' },
    { to: '/passport', key: 'nav.passport' },
    { to: '/leaderboard', key: 'nav.community' },
  ];

  const profileLinks = [
    features.worldMap ? { to: '/world', key: 'nav.worldMap' } : null,
    features.travelJournal ? { to: '/journal', key: 'nav.journal' } : null,
    { to: '/trips', key: 'planner.savedDrafts' },
    { to: '/games', key: 'nav.games' },
    { to: '/settings', key: 'nav.settings' },
    { to: '/about', key: 'nav.about' },
  ].filter(Boolean) as Array<{ to: string; key: string }>;

  const exploreActive = ['/guide', '/famous', '/season'].some((p) => location.pathname.startsWith(p));

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link to="/" className="site-logo" aria-label={t('nav.home')}>
          <Logo />
          <span className="site-logo-text">
            <strong>{brand.name}</strong>
          </span>
        </Link>

        <nav className="site-nav" aria-label={t('nav.menu')}>
          <Dropdown label={<span className={exploreActive ? 'is-active-text' : ''}>{t('nav.explore')}</span>}>
            {(close) => (
              <>
                {exploreLinks.map((link) => (
                  <Link key={link.key} to={link.to} className="dropdown-item" role="menuitem" onClick={close}>
                    {t(link.key)}
                  </Link>
                ))}
              </>
            )}
          </Dropdown>
          {mainLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `site-nav-link ${isActive ? 'is-active' : ''}`}
            >
              {t(link.key)}
            </NavLink>
          ))}
        </nav>

        <div className="site-actions">
          <button type="button" className="btn-icon" aria-label={t('a11y.openSearch')} onClick={() => setSearchOpen(true)}>
            <Search size={19} aria-hidden />
          </button>
          <LocaleSwitcher />
          <ThemeToggle />
          <Dropdown
            align="end"
            className="btn-icon"
            label={
              <span className="profile-trigger">
                <UserRound size={18} aria-hidden />
                <span className="profile-label">{t('nav.signIn')}</span>
              </span>
            }
          >
            {(close) => (
              <>
                {profileLinks.map((link) => (
                  <Link key={link.to} to={link.to} className="dropdown-item" role="menuitem" onClick={close}>
                    {t(link.key)}
                  </Link>
                ))}
              </>
            )}
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
