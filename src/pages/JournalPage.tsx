import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Plus, Star, Trash2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { db } from '@/db/local/db';
import { districts, getDistrict } from '@/data/districts';
import { compressImage } from '@/lib/images/compress';
import { useUiStore } from '@/store/uiStore';
import { PageHero } from '@/components/common/Chrome';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import type { JournalEntry } from '@/types';

interface DraftState {
  id?: string;
  districtId: string;
  date: string;
  caption: string;
  note: string;
  rating: number;
  companions: string;
  favoriteMoment: string;
  visibility: JournalEntry['visibility'];
  photoBlobIds: string[];
}

const emptyDraft = (): DraftState => ({
  districtId: districts[0]!.id,
  date: new Date().toISOString().slice(0, 10),
  caption: '',
  note: '',
  rating: 0,
  companions: '',
  favoriteMoment: '',
  visibility: 'private',
  photoBlobIds: [],
});

export default function JournalPage() {
  const { t, shortLocale } = useI18n();
  const toast = useUiStore((s) => s.toast);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<DraftState>(emptyDraft);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const rows = await db.journalEntries.toArray();
    setEntries(rows.sort((a, b) => b.date.localeCompare(a.date)));
    const urls: Record<string, string> = {};
    for (const entry of rows) {
      for (const id of entry.photoBlobIds) {
        const photo = await db.photos.get(id);
        if (photo) urls[id] = URL.createObjectURL(photo.blob);
      }
    }
    setPhotoUrls((prev) => {
      for (const url of Object.values(prev)) URL.revokeObjectURL(url);
      return urls;
    });
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    const ids: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const { blob, width, height } = await compressImage(file);
        const id = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        await db.photos.put({ id, blob, width, height, createdAt: new Date().toISOString() });
        ids.push(id);
      } catch {
        toast(t('errors.generic'), 'danger');
      }
    }
    setDraft((d) => ({ ...d, photoBlobIds: [...d.photoBlobIds, ...ids] }));
  };

  const saveEntry = async () => {
    const now = new Date().toISOString();
    const entry: JournalEntry = {
      id: draft.id ?? `journal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      districtId: draft.districtId,
      date: draft.date,
      caption: draft.caption || getDistrict(draft.districtId)?.nameEn || 'Memory',
      note: draft.note || undefined,
      rating: draft.rating || undefined,
      companions: draft.companions || undefined,
      favoriteMoment: draft.favoriteMoment || undefined,
      photoBlobIds: draft.photoBlobIds,
      visibility: draft.visibility,
      updatedAt: now,
    };
    await db.journalEntries.put(entry);
    setFormOpen(false);
    toast(t('common.saved'), 'success');
    void load();
  };

  const removeEntry = async (entry: JournalEntry) => {
    for (const id of entry.photoBlobIds) await db.photos.delete(id);
    await db.journalEntries.delete(entry.id);
    void load();
  };

  return (
    <div className="container page">
      <PageHero eyebrow={t('nav.journal')} title={t('journal.title')} body={t('journal.subtitle')}>
        <div className="cluster" style={{ gap: 10, marginTop: 16 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setDraft(emptyDraft());
              setFormOpen(true);
            }}
          >
            <Plus size={17} aria-hidden /> {t('journal.addEntry')}
          </button>
          <span className="badge">{t('journal.localNotice')}</span>
        </div>
      </PageHero>

      {!entries.length ? (
        <EmptyState
          icon={<ImagePlus size={22} aria-hidden />}
          title={t('journal.noEntries')}
          action={
            <button type="button" className="btn btn-primary" onClick={() => { setDraft(emptyDraft()); setFormOpen(true); }}>
              {t('journal.addEntry')}
            </button>
          }
        />
      ) : (
        <div className="stack" style={{ gap: 14 }}>
          {entries.map((entry) => {
            const district = getDistrict(entry.districtId ?? '');
            return (
              <article key={entry.id} className="entry-card">
                {entry.photoBlobIds[0] && photoUrls[entry.photoBlobIds[0]] ? (
                  <img className="entry-photo" src={photoUrls[entry.photoBlobIds[0]]} alt={entry.caption} />
                ) : null}
                <div style={{ flex: 1 }}>
                  <div className="cluster" style={{ justifyContent: 'space-between', gap: 10 }}>
                    <strong>{entry.caption}</strong>
                    <button type="button" className="btn-icon" aria-label={t('journal.deleteConfirm')} onClick={() => void removeEntry(entry)}>
                      <Trash2 size={15} aria-hidden />
                    </button>
                  </div>
                  <div className="subtle" style={{ fontSize: '0.8rem' }}>
                    {district ? (shortLocale === 'bn' ? district.nameBn : district.nameEn) : ''} · {entry.date}
                  </div>
                  {entry.rating ? (
                    <div className="cluster" style={{ gap: 2, marginTop: 4 }} aria-label={`${entry.rating} / 5`}>
                      {Array.from({ length: entry.rating }).map((_, i) => (
                        <Star key={i} size={13} fill="var(--gold)" stroke="var(--gold)" aria-hidden />
                      ))}
                    </div>
                  ) : null}
                  {entry.note ? <p className="muted" style={{ fontSize: '0.88rem', marginTop: 6 }}>{entry.note}</p> : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={t('journal.addEntry')}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)}>{t('common.cancel')}</button>
            <button type="button" className="btn btn-primary" onClick={() => void saveEntry()}>{t('journal.save')}</button>
          </>
        }
      >
        <div className="stack" style={{ gap: 14 }}>
          <div className="field">
            <label className="field-label" htmlFor="j-district">{t('journal.place')}</label>
            <select id="j-district" className="select" value={draft.districtId} onChange={(e) => setDraft((d) => ({ ...d, districtId: e.target.value }))}>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.nameEn} — {d.nameBn}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="j-date">{t('common.date')}</label>
            <input id="j-date" type="date" className="input" value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="j-caption">{t('journal.caption')}</label>
            <input id="j-caption" className="input" value={draft.caption} maxLength={160} onChange={(e) => setDraft((d) => ({ ...d, caption: e.target.value }))} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="j-note">{t('journal.note')}</label>
            <textarea id="j-note" className="textarea" value={draft.note} maxLength={4000} onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))} />
          </div>
          <div className="field">
            <span className="field-label">{t('journal.rating')}</span>
            <div className="cluster" style={{ gap: 4 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" className="btn-icon" aria-label={`${n}`} onClick={() => setDraft((d) => ({ ...d, rating: d.rating === n ? 0 : n }))}>
                  <Star size={18} fill={draft.rating >= n ? 'var(--gold)' : 'none'} stroke="var(--gold)" aria-hidden />
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="j-companions">{t('journal.companions')}</label>
            <input id="j-companions" className="input" value={draft.companions} onChange={(e) => setDraft((d) => ({ ...d, companions: e.target.value }))} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="j-visibility">{t('journal.visibility')}</label>
            <select id="j-visibility" className="select" value={draft.visibility} onChange={(e) => setDraft((d) => ({ ...d, visibility: e.target.value as JournalEntry['visibility'] }))}>
              <option value="private">{t('journal.private')}</option>
              <option value="link">{t('journal.linkOnly')}</option>
              <option value="public">{t('journal.public')}</option>
            </select>
          </div>
          <div className="field">
            <span className="field-label">{t('journal.photos')}</span>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => void addPhotos(e.target.files)} />
            <button type="button" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => fileRef.current?.click()}>
              <ImagePlus size={15} aria-hidden /> {t('journal.addPhoto')}
            </button>
            {draft.photoBlobIds.length ? (
              <span className="muted" style={{ fontSize: '0.82rem' }}>{draft.photoBlobIds.length}</span>
            ) : null}
          </div>
        </div>
      </Modal>
    </div>
  );
}
