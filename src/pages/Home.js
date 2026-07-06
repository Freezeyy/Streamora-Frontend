import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FaCalendarAlt, FaComments, FaLock, FaRss, FaUsers } from 'react-icons/fa';
import Snowfall from '../components/Snowfall';
import { isAuthenticated } from '../utils/auth';
import logo from '../assets/logo.png';
import './Home.css';

const features = [
  {
    icon: FaRss,
    title: 'Your feed',
    text: 'Posts, stories, and moments from people you follow — all in one calm scroll.',
  },
  {
    icon: FaUsers,
    title: 'Community',
    text: 'Discover groups, share with friends, and stay close to the people who matter.',
  },
  {
    icon: FaCalendarAlt,
    title: 'Events',
    text: 'Keep plans in view with a calendar that ties into your groups and WhatsApp.',
  },
  {
    icon: FaComments,
    title: 'Mentions & comments',
    text: 'Tag friends with @mentions and jump into conversations without losing context.',
  },
  {
    icon: FaLock,
    title: 'Privacy controls',
    text: 'Private accounts, follow requests, and control over who sees your posts.',
  },
];

const Home = () => {
  const isLoggedIn = isAuthenticated();

  if (isLoggedIn) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <div className="landing">
      <Snowfall variant="default" />

      <div className="landing-glow landing-glow--left" aria-hidden="true" />
      <div className="landing-glow landing-glow--right" aria-hidden="true" />

      <header className="landing-nav">
        <Link to="/" className="landing-brand">
          <img src={logo} alt="SNOW" className="landing-logo" />
        </Link>

        <nav className="landing-nav-actions">
          <Link to="/login" className="landing-nav-link">Log in</Link>
          <Link to="/signup" className="landing-btn landing-btn--primary">Get started</Link>
        </nav>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <span className="landing-eyebrow">Social, but softer</span>
          <h1 className="landing-title">
            A quieter place to
            <span className="landing-title-accent"> share your world</span>
          </h1>
          <p className="landing-lead">
            SNOW is where posts, stories, communities, and events come together —
            wrapped in a clean icy design that stays out of your way.
          </p>

          <div className="landing-cta">
            <Link to="/signup" className="landing-btn landing-btn--primary landing-btn--large">
              Create free account
            </Link>
            <Link to="/login" className="landing-btn landing-btn--ghost landing-btn--large">
              I already have an account
            </Link>
          </div>

          <div className="landing-stats glass-inset">
            <div className="landing-stat">
              <strong>Feed</strong>
              <span>Posts & stories</span>
            </div>
            <div className="landing-stat">
              <strong>@mentions</strong>
              <span>Tag anyone</span>
            </div>
            <div className="landing-stat">
              <strong>Private</strong>
              <span>Your rules</span>
            </div>
          </div>
        </section>

        <section className="landing-showcase ice-card">
          <div className="landing-showcase-header">
            <h2>Everything you need, nothing you don&apos;t</h2>
            <p>Built for real connections — not endless noise.</p>
          </div>

          <div className="landing-feature-grid">
            {features.map(({ icon: Icon, title, text }) => (
              <article key={title} className="landing-feature glass-inset">
                <span className="landing-feature-icon" aria-hidden="true">
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} SNOW · Share softly.</p>
        <div className="landing-footer-links">
          <Link to="/login">Log in</Link>
          <Link to="/signup">Sign up</Link>
        </div>
      </footer>
    </div>
  );
};

export default Home;
