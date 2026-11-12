import React from "react";
interface State { hasError: boolean }
export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: Error) { console.error("UI error:", error); }
  render() {
    if (this.state.hasError) return <main className="error-screen"><h2>Something went wrong.</h2><p>Refresh the page and try again.</p></main>;
    return this.props.children;
  }
}
