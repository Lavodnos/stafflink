import { Component, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown, info: unknown) {
    console.error('ErrorBoundary', { error, info });
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-center text-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <div className="max-w-md space-y-3">
              <p className="text-sm font-semibold text-brand-600">Ups, algo salió mal</p>
              <h1 className="text-2xl font-bold">Recarga la página e inténtalo nuevamente.</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Si el problema persiste, contacta a soporte y comparte lo que estabas haciendo.
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

