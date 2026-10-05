import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookmarkCheck, Check, Flag, MapPin, Plus } from 'lucide-react';
import { useI18n } from '@/i18n';
import { getDistrict } from '@/data/districts';
import { getPlaceBySlug, placeById } from '@/data/places';
import { usePassportStore } from '@/store/passportStore';
import { useUiStore } from '@/store/uiStore';
import { useDistrictStatus } from '@/hooks/useStatusMap';
import { createTripDraft } from '@/lib/planner/saveTrip';
import { apiConfig } from '@/config/providers';
import { bestMonthLabel } from '@/data/seasons';
import { Breadcrumbs, SectionHead } from '@/components/common/Chrome';
import { FreshnessBadge } from '@/components/guide/FreshnessBadge';
import { Modal } from '@/components/ui/Modal';
import { StatusPill } from '@/components/ui/StatusPill';
import NotFoundPage from './NotFoundPage';

export default function PlacePage() {
  const { placeSlug } = useParams();
  const { t, shortLocale, formatCurrency } = useI18n();
  const place = getPlaceBySlug(placeSlug);
  const setStatus = usePassportStore((s) => s.setStatus);
  const toggleSaved = usePassportStore((s) => s.toggleSavedPlace);
  const savedIds = usePassportStore((s) => s.savedPlaceIds);
  const toast = useUiStore((s) => s.toast);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState('price');
  const [reportDetails, setReportDetails] = useState('');

  const status = useDistrictStatus(place?.districtId ?? '');

  if (!place) return <NotFoundPage />;

  const district = getDistrict(place.districtId);
  const best = bestMonthLabel(place.bestMonths);
  const nearby = place.nearbyPlaceIds.map((id) => placeById.get(id)).filter(Boolean);
  const isSaved = savedIds.includes(place.id);

  const submitReport = async () => {
    try {
      await fetch(`${apiConfig.baseUrl}/place-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId: place.id, type: reportType, details: reportDetails }),
      });
    } catch {
      /* offline — report is best-effort in this build */
    }
    setReportOpen(false);
    setReportDetails('');
    toast(t('guide.place.reportSent'), 'success');
  };

  return (
    <div className="container page">
      <Breadcrumbs
        items={[
          { label: t('nav.guide'), to: '/guide' },
          district ? { label: shortLocale === 'bn' ? district.nameBn : district.nameEn, to: `/guide/${district.slug}` } : { label: '' },
          { label: shortLocale === 'bn' ? place.nameBn : place.nameEn },
        ]}
      />

      <div className="page-hero" style={{ paddingTop: 0 }}>
        <div className="cluster" style={{ gap: 8, marginBottom: 10 }}>
          {place.categories.map((c) => (
            <span key={c} className="badge badge-primary">{c}</span>
          ))}
          {status !== 'unvisited' ? <StatusPill status={status} /> : null}
        </div>
        <h1>{shortLocale === 'bn' ? place.nameBn : place.nameEn}</h1>
        <p className="muted">{shortLocale === 'bn' ? place.shortDescriptionBn : place.shortDescriptionEn}</p>
        <div className="cluster" style={{ gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void createTripDraft({ title: place.nameEn, startDistrictId: 'bd-dhaka', destinationDistrictIds: [place.districtId], placeIds: [place.id], days: 2 }).then(() => toast(t('common.saved'), 'success'))}
          >
            <Plus size={17} aria-hidden /> {t('guide.place.addToTrip')}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void setStatus(place.districtId, 'visited').then(() => toast(t('common.saved'), 'success'))}
          >
            <Check size={17} aria-hidden /> {t('guide.place.markVisited')}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void setStatus(place.districtId, 'want_to_go')}
          >
            <BookmarkCheck size={17} aria-hidden /> {t('guide.place.markWishlist')}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => void toggleSaved(place.id).then(() => toast(isSaved ? t('common.removed') : t('common.saved'), 'success'))}
          >
            {isSaved ? t('common.saved') : t('common.save')}
          </button>
        </div>
      </div>

      <div className="guide-layout has-toc">
        <nav className="guide-toc" aria-label={t('common.tableOfContents')}>
          <ul>
            <li><a href="#facts">{t('guide.place.quickFacts')}</a></li>
            <li><a href="#overview">{t('common.overview')}</a></li>
            <li><a href="#howto">{t('guide.place.howToGo')}</a></li>
            <li><a href="#safety">{t('guide.place.safety')}</a></li>
            <li><a href="#nearby">{t('guide.place.nearbyPlaces')}</a></li>
            <li><a href="#sources">{t('common.source')}</a></li>
          </ul>
        </nav>

        <div className="stack" style={{ gap: 28 }}>
          <section aria-labelledby="facts">
            <h2 className="section-title" id="facts">{t('guide.place.quickFacts')}</h2>
            <dl className="fact-grid" style={{ marginTop: 16 }}>
              <div className="fact">
                <dt>{t('guide.filterDistrict')}</dt>
                <dd>
                  {district ? (
                    <Link to={`/guide/${district.slug}`}>
                      {shortLocale === 'bn' ? district.nameBn : district.nameEn}
                    </Link>
                  ) : '—'}
                </dd>
              </div>
              <div className="fact">
                <dt>{t('guide.bestTime')}</dt>
                <dd>{shortLocale === 'bn' ? best.bn : best.en}</dd>
              </div>
              <div className="fact">
                <dt>{t('guide.place.timeNeeded')}</dt>
                <dd>{place.typicalDurationMinutes ? `${Math.round(place.typicalDurationMinutes / 60) || 1} ${t('common.hours')}` : t('common.unknown')}</dd>
              </div>
              <div className="fact">
                <dt>{t('guide.place.estimatedCost')}</dt>
                <dd>
                  {place.cost?.maxBdt
                    ? `~${formatCurrency(place.cost.minBdt ?? 0)}–${formatCurrency(place.cost.maxBdt)} ${t(`guide.place.costBasis.${place.cost.basis ?? 'person'}`)}`
                    : t('common.unknown')}
                </dd>
              </div>
            </dl>
          </section>

          <section className="prose" aria-labelledby="overview">
            <SectionHead id="overview" title={t('common.overview')} />
            <p>{shortLocale === 'bn' ? place.descriptionBn : place.descriptionEn}</p>
            {!place.openingHoursTextEn ? (
              <p className="subtle">{t('guide.place.noData')}</p>
            ) : (
              <p><strong>{t('guide.place.openingHours')}:</strong> {shortLocale === 'bn' ? place.openingHoursTextBn : place.openingHoursTextEn}</p>
            )}
          </section>

          <section className="prose" aria-labelledby="howto">
            <SectionHead id="howto" title={t('guide.place.howToGo')} />
            {place.transportNotesEn ? (
              <p>{shortLocale === 'bn' ? place.transportNotesBn : place.transportNotesEn}</p>
            ) : (
              <p className="subtle">{t('guide.place.noData')}</p>
            )}
          </section>

          {place.safetyNotesEn ? (
            <section className="prose" aria-labelledby="safety">
              <SectionHead id="safety" title={t('guide.place.safety')} />
              <p>{shortLocale === 'bn' ? place.safetyNotesBn : place.safetyNotesEn}</p>
            </section>
          ) : null}

          {nearby.length ? (
            <section aria-labelledby="nearby">
              <SectionHead id="nearby" title={t('guide.place.nearbyPlaces')} />
              <div className="pill-row">
                {nearby.map((n) => (
                  <Link key={n!.id} to={`/place/${n!.slug}`} className="chip">
                    <MapPin size={13} aria-hidden /> {shortLocale === 'bn' ? n!.nameBn : n!.nameEn}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section aria-labelledby="sources">
            <SectionHead id="sources" title={t('common.source')} />
            <div className="card card-pad stack" style={{ gap: 10 }}>
              <FreshnessBadge verifiedAt={place.verifiedAt} confidence={place.confidence} />
              {place.sourceName ? <p className="muted" style={{ fontSize: '0.85rem' }}>{t('common.source')}: {place.sourceName}</p> : null}
              <p className="subtle" style={{ fontSize: '0.8rem' }}>
                {t('planner.estimatedNote')}
              </p>
              <button type="button" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => setReportOpen(true)}>
                <Flag size={15} aria-hidden /> {t('guide.place.report')}
              </button>
            </div>
          </section>
        </div>
      </div>

      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title={t('guide.report.title')}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setReportOpen(false)}>{t('common.cancel')}</button>
            <button type="button" className="btn btn-primary" onClick={() => void submitReport()} disabled={reportDetails.trim().length < 3}>
              {t('guide.report.submit')}
            </button>
          </>
        }
      >
        <div className="field" style={{ marginBottom: 14 }}>
          <label className="field-label" htmlFor="report-type">{t('guide.report.type')}</label>
          <select id="report-type" className="select" value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="price">{t('guide.report.typePrice')}</option>
            <option value="hours">{t('guide.report.typeHours')}</option>
            <option value="closed">{t('guide.report.typeClosed')}</option>
            <option value="wrong">{t('guide.report.typeWrong')}</option>
            <option value="other">{t('guide.report.typeOther')}</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="report-details">{t('guide.report.details')}</label>
          <textarea id="report-details" className="textarea" value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} maxLength={1000} />
        </div>
      </Modal>
    </div>
  );
}
