// pages/Landing.tsx — the public home page, section by section.
// Section keys match PAGE_REGISTRY (src/admin/config/maintenanceRegistry.ts).
import React from 'react';
import Seo from '../lib/seo/Seo';
import { getRouteMeta } from '../lib/seo/routeMeta';
import { MaintenanceGate } from '../components/maintenance';
import Hero from '../components/landing/Hero';
import Mission from '../components/landing/Mission';
import Need from '../components/landing/Need';
import FeaturedPrograms from '../components/landing/FeaturedPrograms';
import Impact from '../components/landing/Impact';
import Stories from '../components/landing/Stories';
import GetInvolved from '../components/landing/GetInvolved';
import Events from '../components/landing/Events';
import Contact from '../components/landing/Contact';

const Landing: React.FC = () => (
  <>
    <Seo meta={getRouteMeta('/')!} />
    <MaintenanceGate page="landing" section="hero"><Hero /></MaintenanceGate>
    <MaintenanceGate page="landing" section="mission"><Mission /></MaintenanceGate>
    <MaintenanceGate page="landing" section="problem"><Need /></MaintenanceGate>
    <MaintenanceGate page="landing" section="programs"><FeaturedPrograms /></MaintenanceGate>
    <MaintenanceGate page="landing" section="impact"><Impact /></MaintenanceGate>
    <MaintenanceGate page="landing" section="stories"><Stories /></MaintenanceGate>
    <MaintenanceGate page="landing" section="action"><GetInvolved /></MaintenanceGate>
    <MaintenanceGate page="landing" section="events"><Events /></MaintenanceGate>
    <MaintenanceGate page="landing" section="contact"><Contact /></MaintenanceGate>
  </>
);

export default Landing;
