import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Copy,
  Download,
  ExternalLink,
  Facebook,
  FileImage,
  ClipboardCopy,
  FileText,
  Link2,
  Linkedin,
  Loader2,
  MessageCircle,
  Printer,
  Send,
  Share2,
  Twitter,
} from 'lucide-react';
import { useI18n } from '@/i18n';
import { useUiStore } from '@/store/uiStore';
import { Segmented } from '@/components/ui/Segmented';
import { ShareCard, shareFormatSize, type ShareFormat } from './ShareCard';
import type { MapTheme } from '@/lib/map/themes';
import type { TravelStatus } from '@/types';
import { nodeToBlob, downloadBlob, openBlobImage, copyBlobToClipboard, blobToFile, downloadPdf, printNode } from '@/lib/export/exportImage';
import { buildShareCaption, encodeShareMap, shareMapUrl, type ShareScope } from '@/lib/share/shareCode';
import { openShareWindow, platformShareUrl, sharePlatforms, type SharePlatform } from '@/lib/share/social';

const platformIcons: Record<SharePlatform, typeof Facebook> = {
  facebook: Facebook,
  x: Twitter,
  whatsapp: MessageCircle,
  telegram: Send,
  linkedin: Linkedin,
  reddit: Share2,
};

export interface SharePanelStats {
  visited: number;
  total: number;
  divisions: number;
  percent: number;
}

interface SharePanelProps {
  bdStatusMap: Record<string, TravelStatus>;
  worldStatusMap: Record<string, TravelStatus>;
  bdStats: SharePanelStats;
  worldStats: SharePanelStats;
  theme: MapTheme;
  initialName?: string;
  defaultScope?: ShareScope;
  /** Show the visited/wishlist "Card type" selector (studio only, not the export dialog). */
  showCardType?: boolean;
}

const platformName = (p: SharePlatform) => (p === 'x' ? 'X' : p.charAt(0).toUpperCase() + p.slice(1));

export function SharePanel({ bdStatusMap, worldStatusMap, bdStats, worldStats, theme, initialName, defaultScope = 'bd', showCardType = true }: SharePanelProps) {
  const { t, shortLocale } = useI18n();
  const toast = useUiStore((s) => s.toast);
  const [scope, setScope] = useState<ShareScope>(defaultScope);
  const [format, setFormat] = useState<ShareFormat>('square');
  const [mode, setMode] = useState<'visited' | 'wishlist'>('visited');
  const [showLabels, setShowLabels] = useState(true);
  const [name, setName] = useState(initialName ?? '');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  const scopeMap = scope === 'bd' ? bdStatusMap : worldStatusMap;
  const stats = scope === 'bd' ? bdStats : worldStats;

  // "Visited" card shows the full map; "wishlist" card highlights only planned (want-to-go) places.
  const cardStatusMap = useMemo(
    () =>
      mode === 'wishlist'
        ? Object.fromEntries(Object.entries(scopeMap).filter(([, v]) => v === 'want_to_go'))
        : scopeMap,
    [mode, scopeMap],
  );
  const count =
    mode === 'wishlist'
      ? Object.values(scopeMap).filter((v) => v === 'want_to_go').length
      : stats.visited;

  const modeStats = useMemo(
    () => ({ ...stats, visited: count, percent: stats.total ? Math.round((count / stats.total) * 100) : 0 }),
    [stats, count],
  );

  useEffect(() => {
    setCaption(buildShareCaption(shortLocale, modeStats, scope, mode));
  }, [shortLocale, modeStats, scope, mode]);

  const unit =
    scope === 'bd'
      ? shortLocale === 'bn'
        ? 'জেলা'
        : 'districts'
      : shortLocale === 'bn'
        ? 'দেশ'
        : 'countries';

  const shareCode = useMemo(() => encodeShareMap(cardStatusMap, name, scope), [cardStatusMap, name, scope]);
  const shareUrl = useMemo(() => shareMapUrl(shareCode), [shareCode]);
  const siteUrl = typeof window !== 'undefined' ? window.location.host : '';
  const tag =
    scope === 'bd'
      ? mode === 'wishlist'
        ? 'Planning Bangladesh'
        : 'Exploring Bangladesh'
      : mode === 'wishlist'
        ? 'Planning the World'
        : 'Exploring World';
  const percentLabel =
    mode === 'wishlist' ? (shortLocale === 'bn' ? 'পরিকল্পিত' : 'planned') : shortLocale === 'bn' ? 'সম্পূর্ণ' : 'completed';
  const size = shareFormatSize[format];
  const previewScale = Math.min(1, 520 / size.width);

  const card = (
    <ShareCard
      format={format}
      kind={scope}
      statusMap={cardStatusMap}
      theme={theme}
      locale={shortLocale}
      tag={tag}
      visited={count}
      total={stats.total}
      unit={unit}
      url={siteUrl}
      percentLabel={percentLabel}
      displayName={name || undefined}
      showLabels={showLabels}
      texture
    />
  );

  const withCapture = async (key: string, task: () => Promise<void>) => {
    if (!captureRef.current) return;
    setBusy(key);
    try {
      await task();
    } catch {
      toast(t('errors.generic'), 'danger');
    } finally {
      setBusy(null);
    }
  };

  const copyText = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(message, 'success');
    } catch {
      toast(t('errors.generic'), 'danger');
    }
  };

  const makeBlob = () => nodeToBlob(captureRef.current!, { type: 'image/png' });

  const fileShareSupported = (file: File) =>
    typeof navigator !== 'undefined' && 'canShare' in navigator && navigator.canShare({ files: [file] });

  const shareNative = () =>
    withCapture('native', async () => {
      const blob = await makeBlob();
      const file = blobToFile(blob, `explorebd-${scope}-${format}.png`);
      if (fileShareSupported(file)) {
        try {
          await navigator.share({ files: [file], title: t('share.title'), text: `${caption}\n${shareUrl}`, url: shareUrl });
        } catch {
          /* user cancelled — do nothing */
        }
        return;
      }
      // Fallback for browsers without file sharing (e.g. Samsung Internet): open the image.
      const opened = openBlobImage(blob);
      toast(opened ? t('share.imageOpened') : t('share.nativeUnsupported'));
    });

  const copyImage = () =>
    withCapture('copy', async () => {
      const blob = await makeBlob();
      if (await copyBlobToClipboard(blob)) {
        toast(t('share.imageCopied'), 'success');
        return;
      }
      // Image clipboard is unsupported on many mobile browsers — use the share sheet, else open the image.
      const file = blobToFile(blob, `explorebd-${scope}-${format}.png`);
      if (fileShareSupported(file)) {
        try {
          await navigator.share({ files: [file], title: t('share.title'), text: caption, url: shareUrl });
        } catch {
          /* cancelled */
        }
        return;
      }
      const opened = openBlobImage(blob);
      toast(opened ? t('share.imageOpened') : t('share.copyUnsupported'));
    });

  // Universal fallback: open the image in a new tab (open synchronously so popup blockers allow it).
  const openImage = () => {
    const win = window.open('', '_blank');
    void (async () => {
      setBusy('open');
      try {
        const blob = await makeBlob();
        const url = URL.createObjectURL(blob);
        if (win) win.location.href = url;
        else window.open(url, '_blank');
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
        toast(t('share.imageOpened'));
      } catch {
        try {
          win?.close();
        } catch {
          /* ignore */
        }
        toast(t('errors.generic'), 'danger');
      } finally {
        setBusy(null);
      }
    })();
  };

  return (
    <div className="share-layout">
      <div className="share-preview">
        <div
          style={{
            width: size.width * previewScale,
            height: size.height * previewScale,
            overflow: 'hidden',
            borderRadius: 14,
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left' }}>{card}</div>
        </div>
      </div>

      <div className="share-controls stack" style={{ gap: 18 }}>
        <div className="field">
          <span className="field-label">{t('map.modeAria')}</span>
          <Segmented
            ariaLabel={t('map.modeAria')}
            value={scope}
            onChange={setScope}
            options={[
              { value: 'bd', label: t('map.modeBangladesh') },
              { value: 'world', label: t('map.modeWorld') },
            ]}
          />
        </div>

        {showCardType ? (
          <div className="field">
            <span className="field-label">{t('share.cardType')}</span>
            <Segmented
              ariaLabel={t('share.cardType')}
              value={mode}
              onChange={setMode}
              options={[
                { value: 'visited', label: t('share.modeVisited') },
                { value: 'wishlist', label: t('share.modeWishlist') },
              ]}
            />
          </div>
        ) : null}

        <div className="field">
          <span className="field-label">{t('share.preview')}</span>
          <Segmented
            ariaLabel={t('share.preview')}
            value={format}
            onChange={setFormat}
            options={[
              { value: 'social', label: 'Facebook' },
              { value: 'square', label: 'Instagram' },
              { value: 'story', label: 'Story' },
            ]}
          />
          <span className="field-hint">
            {size.width} × {size.height} px
          </span>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="share-name">{t('share.namePrompt')}</label>
          <input id="share-name" className="input" value={name} maxLength={40} placeholder={t('map.displayNamePlaceholder')} onChange={(e) => setName(e.target.value)} />
        </div>

        <label className="cluster" style={{ gap: 8, fontWeight: 600, fontSize: '0.85rem' }}>
          <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
          {t('map.labels')}
        </label>

        <div className="field">
          <label className="field-label" htmlFor="share-caption">{t('share.caption')}</label>
          <textarea id="share-caption" className="textarea" value={caption} onChange={(e) => setCaption(e.target.value)} rows={4} />
          <span className="field-hint">{t('share.captionHint')}</span>
        </div>

        <div className="stack" style={{ gap: 8 }}>
          <span className="eyebrow">{t('share.shareTo')}</span>
          <div className="social-grid">
            <button type="button" className="social-btn" onClick={shareNative} disabled={busy === 'native'}>
              {busy === 'native' ? <Loader2 size={16} className="spin" aria-hidden /> : <FileImage size={16} aria-hidden />}
              {t('share.shareImage')}
            </button>
            {sharePlatforms.map((platform) => {
              const Icon = platformIcons[platform];
              return (
                <a
                  key={platform}
                  className="social-btn"
                  href={platformShareUrl(platform, shareUrl, caption)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    openShareWindow(platform, shareUrl, caption);
                  }}
                >
                  <Icon size={16} aria-hidden />
                  {platformName(platform)}
                </a>
              );
            })}
          </div>
        </div>

        <div className="share-links">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => void copyText(caption, t('share.captionCopied'))}>
            <Copy size={15} aria-hidden /> {t('share.copyCaption')}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => void copyText(shareUrl, t('share.linkCopied'))}>
            <Link2 size={15} aria-hidden /> {t('share.shareLink')}
          </button>
        </div>

        <div className="stack" style={{ gap: 8 }}>
          <span className="eyebrow">{t('share.download')}</span>
          <div className="cluster" style={{ gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary btn-sm" disabled={busy === 'copy'} onClick={() => void copyImage()}>
              {busy === 'copy' ? <Loader2 size={15} className="spin" aria-hidden /> : <ClipboardCopy size={15} aria-hidden />} {t('share.copyImage')}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" disabled={busy === 'png'} onClick={() => void withCapture('png', async () => { const b = await makeBlob(); downloadBlob(b, `explorebd-${scope}-${format}.png`); toast(t('export.ready'), 'success'); })}>
              {busy === 'png' ? <Loader2 size={15} className="spin" aria-hidden /> : <FileImage size={15} aria-hidden />} PNG
            </button>
            <button type="button" className="btn btn-secondary btn-sm" disabled={busy === 'jpg'} onClick={() => void withCapture('jpg', async () => { const b = await nodeToBlob(captureRef.current!, { type: 'image/jpeg', quality: 0.94 }); downloadBlob(b, `explorebd-${scope}-${format}.jpg`); toast(t('export.ready'), 'success'); })}>
              <Download size={15} aria-hidden /> JPG
            </button>
            <button type="button" className="btn btn-secondary btn-sm" disabled={busy === 'open'} onClick={() => openImage()}>
              {busy === 'open' ? <Loader2 size={15} className="spin" aria-hidden /> : <ExternalLink size={15} aria-hidden />} {t('share.openImage')}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" disabled={busy === 'pdf'} onClick={() => void withCapture('pdf', async () => { await downloadPdf(captureRef.current!, `explorebd-${scope}-${format}.pdf`); toast(t('export.ready'), 'success'); })}>
              <FileText size={15} aria-hidden /> PDF
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => void withCapture('print', async () => { await printNode(captureRef.current!); })}>
              <Printer size={15} aria-hidden /> {t('common.print')}
            </button>
          </div>
        </div>

        <p className="subtle" style={{ fontSize: '0.78rem' }}>{t('share.orCopy')}</p>
      </div>

      <div aria-hidden style={{ position: 'fixed', left: -20000, top: 0, pointerEvents: 'none' }}>
        <div ref={captureRef}>{card}</div>
      </div>
    </div>
  );
}
