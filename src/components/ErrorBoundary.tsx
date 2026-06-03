import { Component } from 'react'
import type React from 'react'
import type { ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary 捕获到异常:', error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-sm p-8 max-w-md text-center">
            <svg
              className="mx-auto mb-4"
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
            >
              <title>警告</title>
              <circle cx="24" cy="24" r="22" stroke="#f87171" strokeWidth="3" fill="#fef2f2" />
              <line x1="24" y1="14" x2="24" y2="28" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
              <circle cx="24" cy="34" r="2" fill="#f87171" />
            </svg>
            <h1 className="text-xl font-bold text-gray-800 mb-2">应用出现异常</h1>
            <p className="text-sm text-gray-500 mb-4">
              很抱歉，应用遇到了一个意外错误。请尝试刷新页面。
            </p>
            <details className="mb-4">
              <summary className="text-xs text-gray-400 cursor-pointer select-none">
                错误详情
              </summary>
              <p className="text-xs text-red-500 mt-1 p-2 bg-red-50 rounded break-all font-mono">
                {this.state.error?.message}
              </p>
            </details>
            <button
              type="button"
              className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              刷新页面
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
