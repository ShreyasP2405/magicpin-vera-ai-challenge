import { Cpu, Sparkles, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32 px-4 sm:px-6 lg:px-8">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-brand-100), transparent)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-accent-100), transparent)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm">
            <Cpu size={16} className="text-brand-700" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
              AI Coding Challenge
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50/80">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-700">Open for submissions</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] max-w-5xl mb-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Build the message
          <br />
          engine behind{' '}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-brand-900 to-brand-700 bg-clip-text text-transparent">
              Vera
            </span>
            <Sparkles size={24} className="absolute -top-2 -right-6 text-amber-400 animate-pulse" />
          </span>
          <span className="text-brand-900">.</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed">
          Craft an AI that writes push notifications so compelling, users can't help but tap.
          Compete on decision quality, specificity, and real conversion metrics.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <a href="#submission" className="btn-primary group">
            Start your journey
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#task"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-300 bg-white/60 backdrop-blur-sm"
          >
            Read the brief
          </a>
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
          {[
            { value: '4', label: 'Scoring dimensions' },
            { value: '1000+', label: 'Test scenarios' },
            { value: '40', label: 'Points possible' },
            { value: 'Open', label: 'Submission status' },
          ].map((stat, i) => (
            <div key={i} className="text-center md:text-left">
              <div className="text-2xl md:text-3xl font-extrabold text-brand-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
