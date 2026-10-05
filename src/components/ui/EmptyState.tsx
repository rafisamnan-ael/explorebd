import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon ? <div className="empty-state-icon">{icon}</div> : null}
      <h3 style={{ fontSize: '1.05rem', marginBottom: 6 }}>{title}</h3>
      {body ? <p className="muted" style={{ maxWidth: 420, margin: '0 auto 14px' }}>{body}</p> : null}
      {action}
    </div>
  );
}
