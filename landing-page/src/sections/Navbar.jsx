import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

const navLinks = [
  { label: 'The Task', href: '#task' },
  { label: 'Message Craft', href: '#message-craft' },
  { label: 'Scoring', href: '#scoring' },
  { label: 'Dataset', href: '#dataset' },
  { label: 'Testing', href: '#testing' },
  { label: 'Submit', href: '#submission' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-900 flex items-center justify-center shadow-md">
              <span className="text-white font-black text-sm">V</span>
            </div>
            <span className="font-bold text-gray-900 hidden sm:inline">Vera Challenge</span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100/60 transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#submission"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-900 rounded-lg hover:bg-brand-800 transition-all shadow-sm"
            >
              Start journey
              <ArrowRight size={14} />
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="block px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-gray-100 mt-2">
              <a
                href="#submission"
                className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-brand-900 rounded-lg"
                onClick={() => setIsMobileOpen(false)}
              >
                Start your journey
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
