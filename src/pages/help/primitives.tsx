import React from "react";

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="help-kbd">{children}</kbd>;
}

export function Card({
  title,
  children,
  muted,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <section className={`help-card${muted ? " help-card-muted" : ""}`}>
      {title && <h3 className="help-card-title">{title}</h3>}
      {children}
    </section>
  );
}

export function FAQ({ items }: { items: { q: React.ReactNode; a: React.ReactNode }[] }) {
  return (
    <div className="help-faq">
      {items.map((it, idx) => (
        <details key={idx} className="help-faq-item">
          <summary>{it.q}</summary>
          <div className="help-faq-body">{it.a}</div>
        </details>
      ))}
    </div>
  );
}
