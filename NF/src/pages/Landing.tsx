// pages/Landing.tsx
import React from 'react';
import Hero from '../components/Hero';
import TrustBar from '../components/TrustBar';
import Mission from '../components/Mission';
import Programs from '../components/Programs';
import Impact from '../components/Impact';
import Stories from '../components/Stories';
import Action from '../components/Action';
import Events from '../components/Events';
import Contact from '../components/Contact';
import { MaintenanceGate } from '../components/maintenance';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Dark fullscreen hero */}
      <MaintenanceGate page="landing" section="hero">
        <Hero />
      </MaintenanceGate>
      {/* Partners & trust indicators — gray-50 */}
      <MaintenanceGate page="landing" section="trust_bar">
        <TrustBar />
      </MaintenanceGate>
      {/* Who we are — white */}
      <MaintenanceGate page="landing" section="mission">
        <Mission />
      </MaintenanceGate>
      {/* Featured program — gray-50 */}
      <MaintenanceGate page="landing" section="programs">
        <Programs featuredOnly={true} />
      </MaintenanceGate>
      {/* Impact numbers — white */}
      <MaintenanceGate page="landing" section="impact">
        <Impact />
      </MaintenanceGate>
      {/* Community voices — white */}
      <MaintenanceGate page="landing" section="stories">
        <Stories />
      </MaintenanceGate>
      {/* Get involved — gray-950 dark band */}
      <MaintenanceGate page="landing" section="action">
        <Action />
      </MaintenanceGate>
      {/* Events — gray-50 */}
      <MaintenanceGate page="landing" section="events">
        <Events />
      </MaintenanceGate>
      {/* Contact — white */}
      <MaintenanceGate page="landing" section="contact">
        <Contact />
      </MaintenanceGate>
    </div>
  );
};

export default Landing;
