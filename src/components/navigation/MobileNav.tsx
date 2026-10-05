import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Compass, Map, Menu, Route, Search, Ticket, UserRound } from 'lucide-react';
import { brand } from '@/config/brand';
import { features } from '@/config/features';
import { useI18n } from '@/i18n';
import { useUiStore } from '@/store/uiStore';
import { Sheet } from '@/components/ui/Sheet';
import { Logo } from './Logo';
import { LocaleSwitcher, ThemeToggle } from './Controls';

export function MobileHeader() {
  const { t } = useI18n();
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  return (
    <header className="mobile-header">
      <Link to="/" className="site-logo" aria-label={t('nav.home')}>
        <Logo size={28} />
        <strong>{brand.name}</strong>
      </Link>
      <div className="mobile-header-actions">
        <button type="button" className="btn-icon" aria-label={t('a11y.openSearch')} onClick={() => setSearchOpen(true)}>
          <Search size={20} aria-hidden />
        </button>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const items = [
    { to: '/map', key: 'nav.map', Icon: Map },
    { to: '/guide', key: 'nav.explore', Icon: Compass },
    { to: '/planner', key: 'nav.plan', Icon: Route },
    { to: '/passport', key: 'nav.passport', Icon: Ticket },
  ];

  const moreLinks = [
    features.worldMap ? { to: '/world', key: 'nav.world' } : null,
    { to: '/share', key: 'share.studio' },
    { to: '/famous', key: 'nav.famous' },
    features.travelJournal ? { to: '/journal', key: 'nav.journal' } : null,
    { to: '/games', key: 'nav.games' },
    features.leaderboard ? { to: '/leaderboard', key: 'nav.leaderboard' } : null,
    { to: '/trips', key: 'planner.savedDrafts' },
    { to: '/about', key: 'nav.about' },
    { to: '/settings', key: 'nav.settings' },
  ].filter(Boolean) as Array<{ to: string; key: string }>;

  return (
    <>
      <nav className="bottom-nav" aria-label={t('nav.menu')}>
        {items.map(({ to, key, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'is-active' : ''}`}
          >
            <Icon size={20} aria-hidden />
            <span>{t(key)}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className={`bottom-nav-item ${menuOpen ? 'is-active' : ''}`}
          onClick={() => setMenuOpen(true)}
          aria-haspopup="dialog"
        >
          <Menu size={20} aria-hidden />
          <span>{t('nav.more')}</span>
        </button>
      </nav>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title={t('nav.more')}>
        <div className="mobile-menu-grid">
          {moreLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-menu-link ${location.pathname.startsWith(link.to) ? 'is-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.to === '/settings' ? <UserRound size={18} aria-hidden /> : <Compass size={18} aria-hidden />}
              {t(link.key)}
            </Link>
          ))}
        </div>
        <div className="mobile-menu-controls">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </Sheet>
    </>
  );
}
