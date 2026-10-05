import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { I18nContext, buildI18nValue } from '@/i18n';
import { StatusPill } from '@/components/ui/StatusPill';

function wrap(ui: ReactNode) {
  const value = buildI18nValue('en-BD', vi.fn());
  return render(<I18nContext.Provider value={value}>{ui}</I18nContext.Provider>);
}

describe('StatusPill', () => {
  it('renders the localised status label', () => {
    wrap(<StatusPill status="visited" />);
    expect(screen.getByText('Visited')).toBeInTheDocument();
  });

  it('renders a short label when requested', () => {
    wrap(<StatusPill status="want_to_go" short />);
    expect(screen.getByText('Wishlist')).toBeInTheDocument();
  });

  it('renders the Bangla label under bn locale', () => {
    const value = buildI18nValue('bn-BD', vi.fn());
    render(
      <I18nContext.Provider value={value}>
        <StatusPill status="favorite" />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('প্রিয়')).toBeInTheDocument();
  });
});
