import { ExternalLink, MessageCircle, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-900 flex items-center justify-center">
                <span className="text-white font-black text-sm">V</span>
              </div>
              <span className="font-bold text-lg text-gray-900">Vera Challenge</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
              An open AI coding challenge by magicpin. Build the next generation of
              hyper-personalized merchant messaging.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-3">Resources</h4>
            <ul className="space-y-2">
              {['Challenge Brief', 'Testing Brief', 'Case Studies', 'API Examples'].map((link, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-brand-700 transition-colors inline-flex items-center gap-1"
                  >
                    {link}
                    <ArrowUpRight size={12} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-3">Connect</h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-brand-700 hover:border-brand-200 transition-all"
                aria-label="GitHub"
              >
                <ExternalLink size={18} />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-brand-700 hover:border-brand-200 transition-all"
                aria-label="Twitter"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} magicpin. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Built with ♥ for the AI community
          </p>
        </div>
      </div>
    </footer>
  );
}
