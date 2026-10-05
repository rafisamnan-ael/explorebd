import { WifiOff } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useUiStore } from '@/store/uiStore';

export function OfflineBanner() {
  const { t } = useI18n();
  const online = useUiStore((s) => s.online);
  if (online) return null;
  return (
    <div className="offline-banner" role="status">
      <WifiOff size={16} aria-hidden />
      {t('offline.banner')}
    </div>
  );
}
