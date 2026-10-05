import { Modal } from '@/components/ui/Modal';
import { useI18n } from '@/i18n';
import { SharePanel, type SharePanelStats } from './SharePanel';
import type { MapTheme } from '@/lib/map/themes';
import type { TravelStatus } from '@/types';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  bdStatusMap: Record<string, TravelStatus>;
  worldStatusMap: Record<string, TravelStatus>;
  bdStats: SharePanelStats;
  worldStats: SharePanelStats;
  theme: MapTheme;
  displayName?: string;
}

export function ExportDialog({ open, onClose, bdStatusMap, worldStatusMap, bdStats, worldStats, theme, displayName }: ExportDialogProps) {
  const { t } = useI18n();
  return (
    <Modal open={open} onClose={onClose} title={t('share.title')}>
      <SharePanel
        bdStatusMap={bdStatusMap}
        worldStatusMap={worldStatusMap}
        bdStats={bdStats}
        worldStats={worldStats}
        theme={theme}
        initialName={displayName}
      />
    </Modal>
  );
}
