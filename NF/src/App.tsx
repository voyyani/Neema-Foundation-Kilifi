// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Footer from './components/Footer';
import Donate from './pages/Donate';
import BankDetails from './pages/BankDetails';
import LegacyGiving from './pages/LegacyGiving';
import Volunteer from './pages/Volunteer';
import Partnership from './pages/Partnership';
import Sponsorship from './pages/Sponsorship';
import Board from './pages/Board';
import NotFound from './pages/NotFound';
import Maintenance from './pages/Maintenance';
import ProgramsPage from './pages/ProgramsPage';
// Global Error Boundary
class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Global Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              We're sorry, but something went wrong. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  const isUnderMaintenance = import.meta.env.VITE_UNDER_MAINTENANCE === 'true';

  return (
    <GlobalErrorBoundary>
      <Router>
        <div className="App">
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {isUnderMaintenance ? (
                  // Maintenance mode routes - Volunteer page is still accessible
                  <>
                    <Route path="/volunteer" element={<Volunteer />} />
                    <Route path="*" element={<Maintenance />} />
                    <Route path="/" element={<Landing />} />
                  </>
                ) : (
                  // Normal mode - all routes accessible
                  <>
                    <Route path="/" element={<Landing />} />
                    <Route path="/donate" element={<Donate />} />
                    <Route path="/bank-details" element={<BankDetails />} />
                    <Route path="/legacy-giving" element={<LegacyGiving />} />
                    <Route path="/volunteer" element={<Volunteer />} />
                    <Route path="/partner" element={<Partnership />} />
                    <Route path="/sponsorship" element={<Sponsorship />} />
                    <Route path="/board" element={<Board />} />
                    <Route path="*" element={<NotFound />} />
                    <Route path="/programs" element={<ProgramsPage />} />
                  </>
                )}
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </Router>
    </GlobalErrorBoundary>
  );
};

export default App;