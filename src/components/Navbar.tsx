"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/explorers", label: "WDARL Rankings" },
    { href: "/orbs", label: "Skill Orbs" },
    { href: "/contribute", label: "Contribute" },
  ];

  return (
    <nav className="navbar" id="main-nav">
      <div className="container">
        <Link href="/" className="navbar-brand">
          D-Genesis Stats
        </Link>
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="mobile-menu-toggle"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
        <ul className={`navbar-links${menuOpen ? " open" : ""}`}>
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={pathname === link.href ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href="https://j-novel.club/series/d-genesis"
              target="_blank"
              rel="noopener noreferrer"
              className="external-link"
            >
              Read @ J-Novel Club ↗
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
