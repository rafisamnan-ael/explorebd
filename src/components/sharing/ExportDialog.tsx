import { Modal } from '@/components/ui/Modal';
import { useI18n } from '@/i18n';
import { SharePanel, type SharePanelStats } from './SharePanel';
import type { MapTheme } from '@/lib/map/themes';
import type { TravelStatus } from '@/types';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  statusMap: Record<string, TravelStatus>;
  theme: MapTheme;
  legendLabels: Record<TravelStatus, string>;
  stats: SharePanelStats;
  displayName?: string;
  subtitle: string;
}

export function ExportDialog({ open, onClose, statusMap, theme, legendLabels, stats, displayName, subtitle }: ExportDialogProps) {
  const { t } = useI18n();
  return (
    <Modal open={open} onClose={onClose} title={t('share.title')}>
      <SharePanel
        statusMap={statusMap}
        theme={theme}
        legendLabels={legendLabels}
        stats={stats}
        initialName={displayName}
        subtitle={subtitle}
      />
    </Modal>
  );
}
