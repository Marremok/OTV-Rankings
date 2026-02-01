'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import SignUpPage from '@/app/sign-up/page';
import SignInPage from '@/app/log-in/page';
import { useSession } from '@/lib/auth-client';
import { NavbarAuthButtons } from './NavbarAuthButtons';

export default function Navbar() {

  const [isSignUpDialogOpen, setIsSignUpDialogOpen] = useState(false);
  const [isLogInDialogOpen, setIsLogInDialogOpen] = useState(false);
  const {data: sessions} = useSession()



  return (
    <nav className="border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Vänster: Logo och namn */}
          <Link href={"/"}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-semibold text-foreground">OTV-Rankings</span>
            </div>
          </Link>

          {/* Mitten: Navigation links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href={"/rankings"}>
              <button className="text-foreground hover:text-primary transition-colors font-medium">
                Rankings
              </button>
            </Link>
            <Link href={"/support-us"}>
              <button className="text-foreground hover:text-primary transition-colors font-medium">
                Support Us 
              </button>
            </Link>
            <Link href={"/methodology"}>
              <button className="text-foreground hover:text-primary transition-colors font-medium">
                Our Methodology
              </button>
            </Link>
            
            
          </div>

          {/* Höger: Sign Up och Log In knappar */}
          <NavbarAuthButtons 
          setIsLogInDialogOpen={setIsLogInDialogOpen}
          setIsSignUpDialogOpen={setIsSignUpDialogOpen}
          />
        </div>
      </div>
      <SignUpPage isOpen={isSignUpDialogOpen} onClose={() => setIsSignUpDialogOpen(false)} />
      <SignInPage isOpen={isLogInDialogOpen} onClose={() => setIsLogInDialogOpen(false)} />
    </nav>
  );
}