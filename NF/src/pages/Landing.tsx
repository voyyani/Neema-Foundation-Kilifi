// pages/Landing.tsx
import React from 'react';
import Hero from '../components/Hero';
import TrustBar from '../components/TrustBar';
import Problem from '../components/Problem';
import Mission from '../components/Mission';
import Programs from '../components/Programs';
import Impact from '../components/Impact';
import Stories from '../components/Stories';
import Action from '../components/Action';
import Events from '../components/Events';
import Contact from '../components/Contact';
import ProblemSection from '../components/Problem';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <TrustBar />
      <Problem />
      <Mission />
      {/*<Programs />
      <Impact />
      <Stories />
      <Action />
      <Events />
      <Contact />*/}
    </div>
  );
};

export default Landing;