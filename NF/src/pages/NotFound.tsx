import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../lib/seo/Seo';
import { Button, Container, Section } from '../components/ui';
import { NAV_LINKS } from '../components/shell/navLinks';

/**
 * 404 — a page that is not in the book. Says so plainly and lists every
 * page that is, so nobody leaves through the back button.
 */
const NotFound: React.FC = () => (
  <>
    <Seo path="/404" title="Page not found · Neema Foundation Kilifi" description="That page does not exist." noindex />
    <Section ground="ruled-faint" pad="lg" className="flex-1">
      <Container>
        <div className="grid gap-rule md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-display tabular text-display-xl text-brand-600">404</p>
            <h1 className="mt-2 font-display uppercase text-display-md text-content">This page is not in the book</h1>
            <p className="mt-4 max-w-measure text-lg leading-8 text-content-2">
              The address may be mistyped, or the page has moved. Everything we publish is listed here.
            </p>
            <div className="mt-rule flex flex-wrap gap-3">
              <Button to="/">Go to the home page</Button>
              <Button to="/donate" variant="secondary">Give to the Foundation</Button>
            </div>
          </div>
          <nav aria-label="All pages" className="md:col-span-4 md:col-start-9">
            <ul className="divide-y divide-border">
              {[{ label: 'Home', to: '/' }, ...NAV_LINKS].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="block py-2.5 font-medium text-content underline-offset-4 hover:text-brand-700 hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </Section>
  </>
);

export default NotFound;
