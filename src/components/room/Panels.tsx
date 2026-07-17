import React from 'react';
import { useRouter } from 'next/router';
import { PanelId } from './hotspots';
import { profile, roles, skills, education, demos } from '../../data/resume';

interface PanelsProps {
  open: PanelId | null;
  onClose: () => void;
}

const TITLES: Record<PanelId, string> = {
  about: 'About me',
  work: 'Work',
  skills: 'Skills',
  education: 'Education',
  demos: 'The arcade',
  resume: 'Résumé',
  contact: 'Say hello',
  terminal: 'Old machine',
};

export const Panels: React.FC<PanelsProps> = ({ open, onClose }) => {
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="room-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className="room-panel"
        role="dialog"
        aria-modal="true"
        aria-label={TITLES[open]}
      >
        <header className="room-panel-head">
          <h2>{TITLES[open]}</h2>
          <button
            ref={closeRef}
            className="room-panel-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>
        <div className="room-panel-body">
          {open === 'about' && <AboutPanel />}
          {open === 'work' && <WorkPanel />}
          {open === 'skills' && <SkillsPanel />}
          {open === 'education' && <EducationPanel />}
          {open === 'demos' && <DemosPanel />}
          {open === 'resume' && <ResumePanel />}
          {open === 'contact' && <ContactPanel />}
          {open === 'terminal' && <TerminalPanel onClose={onClose} />}
        </div>
      </section>
    </div>
  );
};

/* ------------------------------------------------------------------ */

const AboutPanel = () => (
  <>
    {profile.about.map((p, i) => (
      <p key={i}>{p}</p>
    ))}
    <ul className="room-facts">
      {profile.quickFacts.map((f) => (
        <li key={f}>{f}</li>
      ))}
    </ul>
  </>
);

const WorkPanel = () => (
  <ol className="room-timeline">
    {roles.map((r) => (
      <li key={r.company + r.period}>
        <div className="room-role-head">
          <strong>{r.title}</strong>
          <span className="room-role-co">
            {r.company}
            {r.location ? ` · ${r.location}` : ''}
          </span>
          <span className="room-role-period">{r.period}</span>
        </div>
        {r.summary && <p className="room-role-summary">{r.summary}</p>}
        {r.highlights.length > 0 && (
          <ul>
            {r.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        )}
      </li>
    ))}
  </ol>
);

const SkillsPanel = () => (
  <div className="room-skills">
    {skills.map((g) => (
      <div key={g.group} className="room-skill-group">
        <h3>{g.group}</h3>
        <div className="room-chips">
          {g.items.map((s) => (
            <span key={s} className="room-chip">
              {s}
            </span>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const EducationPanel = () => (
  <div className="room-edu">
    {education.map((e) => (
      <div key={e.school} className="room-edu-card">
        <strong>{e.degree}</strong>
        <span>
          {e.school} · {e.place}
        </span>
        <span className="room-role-period">Class of {e.year}</span>
        <p>{e.note}</p>
      </div>
    ))}
  </div>
);

const DemosPanel = () => (
  <>
    <p>
      Little experiments I built for fun. Each one opens in a new tab — go play.
    </p>
    <div className="room-demo-grid">
      {demos.map((d) => (
        <a
          key={d.slug}
          className="room-demo-card"
          href={`/demos/${d.slug}/`}
          target="_blank"
          rel="noreferrer"
        >
          <strong>{d.title}</strong>
          <span>{d.blurb}</span>
        </a>
      ))}
    </div>
  </>
);

const ResumePanel = () => (
  <div className="room-resume">
    <p>
      The full, formal version of everything in this room — on one neat PDF.
    </p>
    <div className="room-actions">
      <a
        className="room-btn room-btn-primary"
        href={profile.resumePdf}
        target="_blank"
        rel="noreferrer"
      >
        View the PDF
      </a>
      <a className="room-btn" href={profile.resumePdf} download>
        Download
      </a>
    </div>
  </div>
);

const ContactPanel = () => {
  const [copied, setCopied] = React.useState(false);
  const copyEmail = () => {
    navigator.clipboard?.writeText(profile.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="room-contact">
      <p>
        Always happy to talk — about work, games, or that startup idea of yours.
      </p>
      <div className="room-actions room-actions-col">
        <a
          className="room-btn room-btn-primary"
          href={`mailto:${profile.email}`}
        >
          ✉ &nbsp;{profile.email}
        </a>
        <button className="room-btn" onClick={copyEmail}>
          {copied ? 'Copied!' : 'Copy email address'}
        </button>
        <a
          className="room-btn"
          href={profile.links.linkedin}
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>
        <a
          className="room-btn"
          href={profile.links.github}
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </div>
    </div>
  );
};

const TerminalPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const router = useRouter();
  return (
    <div className="room-resume">
      <p>
        This dusty machine still runs the original version of this site — a
        command-line terminal. Type <code>help</code> once it boots.
      </p>
      <div className="room-actions">
        <button
          className="room-btn room-btn-primary"
          onClick={() => router.push('/terminal')}
        >
          Boot it up
        </button>
        <button className="room-btn" onClick={onClose}>
          Never mind
        </button>
      </div>
    </div>
  );
};
