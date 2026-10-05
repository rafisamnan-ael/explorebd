import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { MobileHeader, BottomNav } from './MobileNav';
import { Footer } from './Footer';
import { OfflineBanner } from './OfflineBanner';
import { Toaster } from '@/components/ui/Toaster';
import { CommandSearch } from '@/components/search/CommandSearch';

export function Layout() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <OfflineBanner />
      <Header />
      <MobileHeader />
      <main id="main-content" className="has-bottom-nav">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <CommandSearch />
      <Toaster />
    </>
  );
}
