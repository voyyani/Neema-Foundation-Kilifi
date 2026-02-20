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

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Dark fullscreen hero */}
      <Hero />
      {/* Partners & trust indicators — gray-50 */}
      <TrustBar />
      {/* Who we are — white */}
      <Mission />
      {/* Featured program — gray-50 */}
      <Programs featuredOnly={true} />
      {/* Impact numbers — white */}
      <Impact />
      {/* Community voices — white */}
      <Stories />
      {/* Get involved — gray-950 dark band */}
      <Action />
      {/* Events — gray-50 */}
      <Events />
      {/* Contact — white */}
      <Contact />
    </div>
  );
};

export default Landing;
