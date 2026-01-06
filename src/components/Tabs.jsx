import React, { useEffect, useState } from "react";
import useMediaQuery from "../hooks/useMediaQuery.js";

const TAB_ICONS = {
  dashboard: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 10.5L12 3l9 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V20h14V9.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 20v-6h6v6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 7l9-4 9 4-9 4-9-4z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 11v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  movements: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h12l-3-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 17H8l3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  restock: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12a8 8 0 0113.7-5.7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 4v5h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12a8 8 0 01-13.7 5.7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 20v-5h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  count: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12l2.5 2.5L16 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  backup: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 18h9a4 4 0 000-8 5 5 0 00-9.8 1.2A3.5 3.5 0 007 18z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

export default function Tabs({ tabs, value, onChange }) {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const activeLabel = tabs.find((t) => t.key === value)?.label || "Menu";

  useEffect(() => {
    setOpen(false);
  }, [value]);

  if (!isMobile) {
    return (
      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`tab tab-${t.key} ${value === t.key ? "tabActive" : ""}`}
            onClick={() => onChange(t.key)}
          >
            <span className="tabIcon">{TAB_ICONS[t.key]}</span>
            <span className="tabLabel">{t.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="mobileNav" aria-label="Navegacion principal">
      <button
        className="mobileNavToggle"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-list"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="mobileNavIcon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="mobileNavLabel">Menu: {activeLabel}</span>
      </button>

      {open ? (
        <div id="mobile-nav-list" className="mobileNavList">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`mobileNavItem ${value === t.key ? "isActive" : ""}`}
              type="button"
              onClick={() => {
                onChange(t.key);
                setOpen(false);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
