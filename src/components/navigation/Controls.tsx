import { Languages, Moon, Sun, Monitor } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';
import { Dropdown } from '@/components/ui/Dropdown';
import type { AppSettings } from '@/types';

export function ThemeToggle() {
  const { t } = useI18n();
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);
  if (!settings) return null;
  const mode = settings.theme;
  const options: Array<{ value: AppSettings['theme']; label: string; Icon: typeof Sun }> = [
    { value: 'light', label: t('theme.light'), Icon: Sun },
    { value: 'dark', label: t('theme.dark'), Icon: Moon },
    { value: 'system', label: t('theme.system'), Icon: Monitor },
  ];
  const current = options.find((o) => o.value === mode) ?? options[2]!;
  const CurrentIcon = current.Icon;
  return (
    <Dropdown label={<CurrentIcon size={18} aria-hidden />} align="end" className="btn-icon">
      {(close) => (
        <>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={option.value === mode}
              className="dropdown-item"
              onClick={() => {
                void update({ theme: option.value });
                close();
              }}
            >
              <option.Icon size={16} aria-hidden />
              {option.label}
            </button>
          ))}
        </>
      )}
    </Dropdown>
  );
}

export function LocaleSwitcher() {
  const { t, locale } = useI18n();
  const update = useSettingsStore((s) => s.update);
  return (
    <Dropdown
      label={
        <span className="locale-trigger">
          <Languages size={17} aria-hidden />
          <span className="locale-text">{locale.startsWith('bn') ? 'বাংলা' : 'EN'}</span>
        </span>
      }
      align="end"
    >
      {(close) => (
        <>
          <button
            type="button"
            role="menuitemradio"
            aria-checked={locale.startsWith('bn')}
            className="dropdown-item"
            onClick={() => {
              void update({ locale: 'bn-BD' });
              close();
            }}
          >
            {t('locale.bn')}
          </button>
          <button
            type="button"
            role="menuitemradio"
            aria-checked={locale.startsWith('en')}
            className="dropdown-item"
            onClick={() => {
              void update({ locale: 'en-BD' });
              close();
            }}
          >
            {t('locale.en')}
          </button>
        </>
      )}
    </Dropdown>
  );
}
