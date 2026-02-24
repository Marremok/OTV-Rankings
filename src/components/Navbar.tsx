'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthDialog } from '@/components/auth';
import { useSession } from '@/lib/auth-client';
import { NavbarAuthButtons } from './NavbarAuthButtons';
import { SearchContainer } from './search';
import { ChevronDown, Menu, X } from 'lucide-react';

const rankingLinks = [
  { label: 'TV Series', href: '/rankings/tv-series' },
  { label: 'Characters', href: '/rankings/characters' },
];

function RankingsDropdown() {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href="/rankings"
        className="flex items-center gap-1 text-foreground hover:text-primary transition-colors font-medium"
      >
        Rankings
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Link>

      {open && (
        <div className="absolute left-0 top-full pt-2 z-50">
          <div className="bg-background border border-border rounded-md shadow-md py-1 min-w-35">
            {rankingLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [menuOpen, setMenuOpen] = useState(false);
  const [rankingsExpanded, setRankingsExpanded] = useState(false);
  const { data: sessions } = useSession();
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setRankingsExpanded(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const openSignIn = () => {
    setAuthMode("sign-in");
    setIsAuthDialogOpen(true);
    setMenuOpen(false);
  };

  const openSignUp = () => {
    setAuthMode("sign-up");
    setIsAuthDialogOpen(true);
    setMenuOpen(false);
  };

  const switchMode = () => {
    setAuthMode(authMode === "sign-in" ? "sign-up" : "sign-in");
  };

  return (
    <nav className="border-b border-border bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link href={"/"}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-semibold text-foreground">OTV-Rankings</span>
            </div>
          </Link>

          {/* Center: Desktop navigation links */}
          <div className="hidden md:flex items-center gap-8">
            <RankingsDropdown />
            <Link href={"/support-us"} className="text-foreground hover:text-primary transition-colors font-medium">
              Support Us
            </Link>
            <Link href={"/methodology"} className="text-foreground hover:text-primary transition-colors font-medium">
              Our Methodology
            </Link>
            <SearchContainer />
          </div>

          {/* Right: Hamburger (mobile) + Auth buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-md text-foreground hover:bg-muted transition-colors"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <NavbarAuthButtons
              setIsLogInDialogOpen={openSignIn}
              setIsSignUpDialogOpen={openSignUp}
            />
          </div>
        </div>
      </div>

      {/* Mobile backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile slide-in panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-background border-l border-border flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-base">L</span>
              </div>
              <span className="text-lg font-semibold text-foreground">OTV-Rankings</span>
            </div>
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border shrink-0">
          <SearchContainer className="w-full" />
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-1">
          {/* Rankings accordion */}
          <div>
            <button
              onClick={() => setRankingsExpanded(prev => !prev)}
              className="flex items-center justify-between w-full px-3 py-3 rounded-lg text-foreground hover:bg-muted transition-colors font-medium"
            >
              <span>Rankings</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${rankingsExpanded ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-200 ${rankingsExpanded ? 'max-h-48' : 'max-h-0'}`}>
              <div className="pl-4 pb-1 flex flex-col gap-1">
                <Link
                  href="/rankings"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  All Rankings
                </Link>
                {rankingLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/support-us"
            onClick={() => setMenuOpen(false)}
            className="flex items-center px-3 py-3 rounded-lg text-foreground hover:bg-muted transition-colors font-medium"
          >
            Support Us
          </Link>

          <Link
            href="/methodology"
            onClick={() => setMenuOpen(false)}
            className="flex items-center px-3 py-3 rounded-lg text-foreground hover:bg-muted transition-colors font-medium"
          >
            Our Methodology
          </Link>
        </nav>

        {/* Bottom: Auth */}
        <div className="shrink-0 border-t border-border px-4 py-4">
          <NavbarAuthButtons
            setIsLogInDialogOpen={openSignIn}
            setIsSignUpDialogOpen={openSignUp}
          />
        </div>
      </div>

      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        mode={authMode}
        onModeSwitch={switchMode}
      />
    </nav>
  );
}
