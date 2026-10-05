import { Globe2, Map as MapIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { Segmented } from '@/components/ui/Segmented';

export function MapModeSwitch({ mode }: { mode: 'bd' | 'world' }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <div className="map-mode-switch">
      <Segmented
        ariaLabel={t('map.modeAria')}
        value={mode}
        onChange={(value) => navigate(value === 'bd' ? '/map' : '/world')}
        options={[
          {
            value: 'bd',
            label: (
              <span className="cluster" style={{ gap: 6, justifyContent: 'center' }}>
                <MapIcon size={15} aria-hidden />
                {t('map.modeBangladesh')}
              </span>
            ),
          },
          {
            value: 'world',
            label: (
              <span className="cluster" style={{ gap: 6, justifyContent: 'center' }}>
                <Globe2 size={15} aria-hidden />
                {t('map.modeWorld')}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
