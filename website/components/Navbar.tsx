"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-lg py-3 shadow-md"
          : "bg-transparent py-5"
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-foreground font-bold text-2xl">
          CollabNext
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <NavItem href="/" label="Home" />
          <NavItem href="/image-generator" label="Image Generator" />
          <NavItem href="/comic-generator" label="Comic Generator" />
          <NavItem href="/sketch-generator" label="Sketch Generator" />
          <NavItem href="#about" label="About" />
          <div className="flex space-x-3">
            <Link href="/login">
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              Log In
            </Button>
            </Link>
            <Link href="/signup">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Sign Up
            </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-5 flex flex-col space-y-4">
              <MobileNavItem
                href="/"
                label="Home"
                onClick={() => setMobileMenuOpen(false)}
              />
              <MobileNavItem
                href="/image-generator"
                label="Image Generator"
                onClick={() => setMobileMenuOpen(false)}
              />
              <MobileNavItem
                href="/comic-generator"
                label="Comic Generator"
                onClick={() => setMobileMenuOpen(false)}
              />
              <MobileNavItem
                href="/sketch-generator"
                label="Sketch Generator"
                onClick={() => setMobileMenuOpen(false)}
              />
              <MobileNavItem
                href="#about"
                label="About"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="pt-4 flex flex-col space-y-3">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 w-full"
                >
                  Log In
                </Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full">
                  Sign Up
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const NavItem = ({ href, label }: { href: string; label: string }) => {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-foreground transition-colors relative group"
    >
      {label}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );
};

const MobileNavItem = ({ href, label, onClick }: { href: string; label: string; onClick: () => void }) => {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-foreground py-2 transition-colors block border-b border-border"
      onClick={onClick}
    >
      {label}
    </Link>
  );
};

export default Navbar;
