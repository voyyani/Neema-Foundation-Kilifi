// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
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

const App: React.FC = () => {
  // Vite uses import.meta.env instead of process.env
  const isUnderMaintenance = import.meta.env.VITE_UNDER_MAINTENANCE === 'true';

  return (
    <Router>
      <div className="App">
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Maintenance Mode Route - Catches all routes when enabled */}
              {isUnderMaintenance ? (
                // When under maintenance, all routes show the Maintenance page
                <Route path="*" element={<Maintenance />} />
              ) : (
                // Normal routing when not under maintenance
                <>
                  <Route path="/" element={<Hero />} />
                  <Route path="/donate" element={<Donate />} />
                  <Route path="/bank-details" element={<BankDetails />} />
                  <Route path="/legacy-giving" element={<LegacyGiving />} />
                  <Route path="/volunteer" element={<Volunteer />} />
                  <Route path="/partner" element={<Partnership />} />
                  <Route path="/sponsorship" element={<Sponsorship />} />
                  <Route path="/board" element={<Board />} />
                  <Route path="*" element={<NotFound />} />
                </>
              )}
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
};

export default App;