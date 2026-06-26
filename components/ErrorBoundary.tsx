import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** Label for error reports (e.g. "Game View", "Shop Page") */
  boundary?: string;
  /** Called when an error is caught */
  onError?: (error: Error, boundary: string) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global ErrorBoundary component.
 * Prevents the entire app from crashing on unhandled render errors.
 */
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `[ErrorBoundary${this.props.boundary ? `:${this.props.boundary}` : ''}]`,
      error,
      errorInfo.componentStack,
    );
    this.props.onError?.(error, this.props.boundary || 'unknown');
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#fafbfc] p-6 text-center select-none">
          <div className="bg-red-50 p-4 rounded-full mb-4">
            <AlertTriangle size={40} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[#1f2329] mb-2">出错了</h2>
          <p className="text-sm text-[#646a73] mb-2 max-w-xs">
            应用遇到了一个意外错误，请尝试刷新页面。
          </p>
          {this.state.error && (
            <p className="text-xs text-[#bbbfc4] mb-6 font-mono max-w-xs truncate">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-[#3370ff] text-white font-medium py-3 px-6 rounded-xl text-sm shadow-sm active:scale-[0.98]"
          >
            <RefreshCw size={16} />
            刷新页面
          </button>
          {this.props.boundary && (
            <button
              onClick={this.handleReset}
              className="mt-3 text-sm text-[#3370ff] font-medium hover:underline"
            >
              尝试恢复 {this.props.boundary}
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
