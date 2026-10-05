import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, RotateCcw } from 'lucide-react';
import { useI18n } from '@/i18n';
import { db } from '@/db/local/db';
import { buildPlanFromDraft } from '@/lib/planner/buildPlan';
import { printNode } from '@/lib/export/exportImage';
import { PlanResult, type BuiltPlan } from '@/components/planner/PlanResult';
import { Breadcrumbs, PageHero } from '@/components/common/Chrome';
import { EmptyState } from '@/components/ui/EmptyState';
import type { TripDraft } from '@/types';

export default function TripDetailPage() {
  const { tripId } = useParams();
  const { t } = useI18n();
  const [draft, setDraft] = useState<TripDraft | null>(null);
  const [plan, setPlan] = useState<BuiltPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const resultRef = useRef<HTMLDivElement>(null);

  const build = useMemo(
    () => async (trip: TripDraft) => {
      setLoading(true);
      try {
        setPlan(await buildPlanFromDraft(trip));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;
    void (async () => {
      const trip = tripId ? await db.tripDrafts.get(tripId) : undefined;
      if (!active) return;
      setDraft(trip ?? null);
      if (trip) await build(trip);
      else setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [tripId, build]);

  if (!loading && !draft) {
    return (
      <div className="container page page-narrow">
        <EmptyState
          title={t('planner.noDrafts')}
          action={<Link to="/planner" className="btn btn-primary">{t('home.openPlanner')}</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: t('planner.savedDrafts'), to: '/trips' }, { label: draft?.title ?? '' }]} />
      <PageHero title={draft?.title ?? t('planner.summary')} body={t('planner.buildSubtitle')}>
        <div className="cluster" style={{ gap: 10, marginTop: 12 }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => draft && void build(draft)}>
            <RotateCcw size={15} aria-hidden /> {t('planner.regenerate')}
          </button>
        </div>
      </PageHero>

      {loading ? (
        <div className="cluster" style={{ gap: 10 }}>
          <Loader2 size={18} className="spin" aria-hidden /> {t('common.loading')}
        </div>
      ) : plan ? (
        <div ref={resultRef}>
          <PlanResult
            plan={plan}
            saving={false}
            onSave={() => undefined}
            onPrint={() => resultRef.current && void printNode(resultRef.current)}
            onCopy={() => undefined}
          />
        </div>
      ) : null}
    </div>
  );
}
