import Link from "next/link";
import { Instagram, Youtube } from "lucide-react";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.52V6.75a4.85 4.85 0 0 1-1.02-.06z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sektion 1: Logo och Brand */}
          <div className="space-y-4">
            <Link href={"/"} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-semibold">OTV-Rankings</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Ultimate Source for serious and fair TV series Rankings.
            </p>
          </div>

          {/* Sektion 2: Navigation (Samma som Navbar) */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-semibold text-lg">Navigate</h3>
            <Link 
              href="/rankings" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
            >
              Rankings
            </Link>
            <Link 
              href="/support-us" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
            >
              Support Us
            </Link>
            <Link 
              href="/methodology" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
            >
              Our Methodology
            </Link>
          </div>

          {/* Sektion 3: Legal / Extra */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-semibold text-lg">Legal</h3>
            <Link 
              href="/privacy" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
            >
              Terms of Service
            </Link>
            <Link 
              href="/cookies" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
            >
              Cookie Policy
            </Link>
          </div>

          {/* Sektion 4: Socials */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-semibold text-lg">Connect</h3>
            <div className="flex items-center gap-4">
              <Link href="#" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                <TikTokIcon className="w-5 h-5" />
                <span className="sr-only">TikTok</span>
              </Link>
              <Link href="#" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="w-5 h-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} OTV-Rankings. All rights reserved.
          </p>
          <div className="flex gap-6">
            {/* Extra länkar i botten om man vill, annars tomt */}
          </div>
        </div>
      </div>
    </footer>
  );
}