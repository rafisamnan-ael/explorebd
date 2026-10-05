import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useI18n } from '@/i18n';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotFoundPage() {
  const { t } = useI18n();
  return (
    <div className="container page">
      <EmptyState
        icon={<Compass size={22} aria-hidden />}
        title={t('errors.notFound')}
        body={t('errors.notFoundBody')}
        action={
          <Link to="/" className="btn btn-primary">
            {t('errors.goHome')}
          </Link>
        }
      />
    </div>
  );
}
