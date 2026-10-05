import { Component, type ErrorInfo, type ReactNode } from 'react';
import { brand } from '@/config/brand';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('Unhandled UI error', error, info.componentStack);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="container page" role="alert">
          <h1>Something went wrong</h1>
          <p className="muted">
            {brand.name} hit an unexpected error. Reloading usually fixes it.
          </p>
          {import.meta.env.DEV && this.state.message ? (
            <pre className="error-detail">{this.state.message}</pre>
          ) : null}
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
