import { useRef, useState } from 'react';
import { Download, FileImage, FileText, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Segmented } from '@/components/ui/Segmented';
import { useI18n } from '@/i18n';
import { useUiStore } from '@/store/uiStore';
import { ShareCard, type ShareCardModel, type ShareFormat, shareFormatSize } from './ShareCard';
import type { MapTheme } from '@/lib/map/themes';
import type { TravelStatus } from '@/types';
import { downloadDataUrl, downloadPdf, nodeToJpeg, nodeToPng, printNode } from '@/lib/export/exportImage';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  statusMap: Record<string, TravelStatus>;
  theme: MapTheme;
  model: ShareCardModel;
  legendLabels: Record<TravelStatus, string>;
}

export function ExportDialog({ open, onClose, statusMap, theme, model, legendLabels }: ExportDialogProps) {
  const { t, formatDate } = useI18n();
  const toast = useUiStore((s) => s.toast);
  const [format, setFormat] = useState<ShareFormat>('social');
  const [busy, setBusy] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const captureRef = useRef<HTMLDivElement>(null);

  const size = shareFormatSize[format];
  const previewScale = Math.min(1, 520 / size.width);
  const filename = `explorebd-${format}-${new Date().toISOString().slice(0, 10)}`;

  const modelWithDate: ShareCardModel = { ...model, dateLabel: formatDate(new Date()) };

  const run = async (task: () => Promise<void>, okMessage: string) => {
    if (!captureRef.current) return;
    setBusy(true);
    try {
      await task();
      toast(okMessage, 'success');
    } catch {
      toast(t('errors.generic'), 'danger');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('export.title')}>
      <div className="stack" style={{ gap: 16 }}>
        <Segmented
          ariaLabel={t('export.title')}
          value={format}
          onChange={setFormat}
          options={[
            { value: 'social', label: t('export.png') },
            { value: 'square', label: t('export.square') },
            { value: 'story', label: t('export.story') },
          ]}
        />

        <div className="export-preview" style={{ maxWidth: 520, margin: '0 auto' }}>
          <div
            style={{
              width: size.width * previewScale,
              height: size.height * previewScale,
              overflow: 'hidden',
              borderRadius: 12,
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left' }}>
              <ShareCard
                format={format}
                model={modelWithDate}
                theme={theme}
                statusMap={statusMap}
                legendLabels={legendLabels}
                showLegend={showLegend}
                showDate={showDate}
                texture
              />
            </div>
          </div>
        </div>

        <div className="pill-row">
          <label className="cluster" style={{ gap: 8, fontWeight: 600, fontSize: '0.85rem' }}>
            <input type="checkbox" checked={showLegend} onChange={(e) => setShowLegend(e.target.checked)} />
            {t('export.includeLegend')}
          </label>
          <label className="cluster" style={{ gap: 8, fontWeight: 600, fontSize: '0.85rem' }}>
            <input type="checkbox" checked={showDate} onChange={(e) => setShowDate(e.target.checked)} />
            {t('export.includeDate')}
          </label>
        </div>

        <div className="cluster" style={{ gap: 10 }}>
          <button
            className="btn btn-primary"
            disabled={busy}
            onClick={() => run(async () => {
              const data = await nodeToPng(captureRef.current!);
              downloadDataUrl(data, `${filename}.png`);
            }, t('export.ready'))}
          >
            {busy ? <Loader2 size={18} className="spin" aria-hidden /> : <FileImage size={18} aria-hidden />}
            {t('export.png')}
          </button>
          <button
            className="btn btn-secondary"
            disabled={busy}
            onClick={() => run(async () => {
              const data = await nodeToJpeg(captureRef.current!);
              downloadDataUrl(data, `${filename}.jpg`);
            }, t('export.ready'))}
          >
            <Download size={18} aria-hidden />
            {t('export.jpg')}
          </button>
          <button
            className="btn btn-secondary"
            disabled={busy}
            onClick={() => run(async () => {
              await downloadPdf(captureRef.current!, `${filename}.pdf`);
            }, t('export.ready'))}
          >
            <FileText size={18} aria-hidden />
            {t('export.pdf')}
          </button>
          <button
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => run(async () => {
              await printNode(captureRef.current!);
            }, t('export.ready'))}
          >
            {t('common.print')}
          </button>
        </div>
      </div>

      {/* Off-screen full-size capture surface */}
      <div
        aria-hidden
        style={{ position: 'fixed', left: -100000, top: 0, pointerEvents: 'none', opacity: 0 }}
      >
        <div ref={captureRef}>
          <ShareCard
            format={format}
            model={modelWithDate}
            theme={theme}
            statusMap={statusMap}
            legendLabels={legendLabels}
            showLegend={showLegend}
            showDate={showDate}
            texture
          />
        </div>
      </div>
    </Modal>
  );
}
