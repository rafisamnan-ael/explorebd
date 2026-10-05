export function RouteFallback() {
  return (
    <div className="container page" role="status" aria-live="polite">
      <div className="skeleton route-skeleton" style={{ height: 40, width: '40%' }} />
      <div className="skeleton route-skeleton" style={{ height: 220, marginTop: 24 }} />
      <div className="skeleton route-skeleton" style={{ height: 120, marginTop: 24 }} />
      <span className="sr-only">Loading</span>
    </div>
  );
}
