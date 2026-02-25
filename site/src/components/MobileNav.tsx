'use client';

import { useState } from 'react';

const SECTIONS = [
  { id: 'news',    label: 'Finance & Tech', color: '#059669' },
  { id: 'reddit',  label: 'Reddit',         color: '#EA580C' },
  { id: 'hn',      label: 'Hacker News',    color: '#D97706' },
  { id: 'ph',      label: 'Product Hunt',   color: '#DC2626' },
  { id: 'sub',     label: 'Substack',       color: '#7C3AED' },
  { id: 'jike',    label: '即刻',            color: '#2563EB' },
  { id: 'pin',     label: 'Pinterest',      color: '#E11D48' },
  { id: 'youtube', label: 'YouTube',        color: '#B91C1C' },
  { id: 'x',       label: 'X (Twitter)',    color: '#0284C7' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  const handleClick = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <button
        className={`mobile-nav-toggle ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="导航菜单"
      >
        {open ? '✕' : '☰'}
      </button>
      <div className={`mobile-nav-panel ${open ? 'open' : ''}`}>
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            className="mobile-nav-item"
            href={`#${s.id}`}
            onClick={(e) => { e.preventDefault(); handleClick(s.id); }}
          >
            <span className="mnav-dot" style={{ background: s.color }} />
            {s.label}
          </a>
        ))}
      </div>
    </>
  );
}
