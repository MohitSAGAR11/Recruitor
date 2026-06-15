import React from 'react';

export default function Header({ title, subtitle, description }) {
  return (
    <header className="stage-header">
      {subtitle && (
        <p className="eyebrow">
          <span className="eyebrow-dot" />
          {subtitle}
        </p>
      )}
      <h1 className="text-display">{title}</h1>
      {description && (
        <p className="text-body" style={{ maxWidth: 640, marginTop: 12 }}>
          {description}
        </p>
      )}
    </header>
  );
}
