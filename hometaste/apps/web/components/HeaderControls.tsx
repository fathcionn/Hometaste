"use client";

import { useEffect, useRef, useState } from "react";

const languages = [
  { locale: "en", label: "English" },
  { locale: "ar", label: "Arabic" },
  { locale: "tr", label: "Turkish" }
];

export function HeaderControls({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    function close(event: MouseEvent): void {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="header-controls">
      <div className="language-menu" ref={menuRef}>
        <button className="icon-button" type="button" aria-label="Choose language" onClick={() => setOpen((value) => !value)}>
          <span aria-hidden="true">🌐</span>
        </button>
        {open ? (
          <div className="language-dropdown">
            {languages.map((item) => (
              <a key={item.locale} className={item.locale === locale ? "active-language" : ""} href={`/${item.locale}`}>
                {item.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
      <button
        className="icon-button"
        type="button"
        aria-label="Toggle dark mode"
        onClick={() => setTheme((value) => (value === "light" ? "dark" : "light"))}
      >
        <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
      </button>
    </div>
  );
}
