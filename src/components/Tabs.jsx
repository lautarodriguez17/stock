import React, { useEffect, useState } from "react";
import useMediaQuery from "../hooks/useMediaQuery.js";

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
            className={`tab ${value === t.key ? "tabActive" : ""}`}
            onClick={() => onChange(t.key)}
          >
            {t.label}
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
