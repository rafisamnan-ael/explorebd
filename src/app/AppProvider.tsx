import { useEffect, useMemo, type ReactNode } from 'react';
import { brand } from '@/config/brand';
import { I18nContext, buildI18nValue, type SupportedLocale } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';
import { usePassportStore } from '@/store/passportStore';
import { useUiStore } from '@/store/uiStore';

export function AppProvider({ children }: { children: ReactNode }) {
  const settings = useSettingsStore((s) => s.settings);
  const ready = useSettingsStore((s) => s.ready);
  const initSettings = useSettingsStore((s) => s.init);
  const updateSettings = useSettingsStore((s) => s.update);
  const initPassport = usePassportStore((s) => s.init);
  const setOnline = useUiStore((s) => s.setOnline);

  useEffect(() => {
    void initSettings();
    void initPassport();
  }, [initSettings, initPassport]);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [setOnline]);

  const locale = settings?.locale ?? brand.defaultLocale;

  const value = useMemo(
    () =>
      buildI18nValue(locale as SupportedLocale, (next) => {
        void updateSettings({ locale: next });
      }),
    [locale, updateSettings],
  );

  if (!ready) {
    return (
      <div className="app-loading" role="status" aria-live="polite">
        <div className="app-loading-mark">{brand.name}</div>
        <div className="skeleton app-loading-bar" />
      </div>
    );
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
