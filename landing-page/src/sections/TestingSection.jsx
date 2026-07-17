import SectionWrapper from '../components/SectionWrapper';
import TerminalBlock from '../components/TerminalBlock';
import Accordion from '../components/Accordion';
import { Server, Clock, ShieldCheck, Rocket, ArrowRight, CheckCircle2 } from 'lucide-react';

const testingSteps = [
  {
    step: '01',
    title: 'Warmup',
    time: 'T-15 min',
    desc: 'Base dataset loaded — 5 categories, 50 merchants, 200 customers, 100 triggers pushed to your /v1/context endpoint.',
    icon: Server,
  },
  {
    step: '02',
    title: 'Test window',
    time: '60 sim. minutes',
    desc: 'Triggers fired at 5-minute ticks. Your bot receives /v1/tick and /v1/reply calls. Merchant replies simulated.',
    icon: Clock,
  },
  {
    step: '03',
    title: 'Adaptive injection',
    time: 'Mid-test',
    desc: 'New contexts pushed — updated digests, performance changes, new triggers. Bots that adapt score higher.',
    icon: Rocket,
  },
  {
    step: '04',
    title: 'Replay test',
    time: 'Top 10 only',
    desc: '3 deep-dive scenarios: auto-reply detection, intent transition handling, and hostile/off-topic response.',
    icon: ShieldCheck,
  },
  {
    step: '05',
    title: 'Scoring & report',
    time: 'Final',
    desc: 'Per-message scorecard with rationale. 5 dimensions scored 0-10 each. Total out of 50.',
    icon: CheckCircle2,
  },
];

const technicalConstraints = [
  { label: 'Response timeout', value: '30 seconds per API call' },
  { label: 'Rate limits', value: 'Max 10 req/s, max 20 actions per tick' },
  { label: 'Message length', value: '160 characters maximum' },
  { label: 'Session window', value: 'WhatsApp 24h session rules apply' },
  { label: 'Determinism', value: 'Same input → same output expected' },
  { label: 'Language', value: 'Python 3.10+ recommended' },
];

export default function TestingSection() {
  return (
    <SectionWrapper
      id="testing"
      label="TESTING SETUP"
      heading="Submit one public bot URL for evaluation."
    >
      {/* Curl terminal block */}
      <div className="mb-8">
        <TerminalBlock title="evaluation-harness">
          <code>
            <span style={{ color: '#9ca3af' }}>$ </span>
            <span style={{ color: '#34d399' }}>curl</span>
            <span style={{ color: '#a5f3fc' }}> -X POST https://your-bot-url.com/v1/reply \</span>
            {'\n'}
            <span style={{ color: '#a5f3fc' }}>{'  -H "Content-Type: application/json" \\'}</span>
            {'\n'}
            <span style={{ color: '#a5f3fc' }}>{'  -d \'{'}</span>
            {'\n'}
            <span style={{ color: '#f59e0b' }}>{'    "merchant_id"'}</span>
            <span style={{ color: '#a5f3fc' }}>{': '}</span>
            <span style={{ color: '#34d399' }}>{'"mx_rest_hauz_baohouse"'}</span>
            <span style={{ color: '#a5f3fc' }}>{','}</span>
            {'\n'}
            <span style={{ color: '#f59e0b' }}>{'    "trigger"'}</span>
            <span style={{ color: '#a5f3fc' }}>{': {'}</span>
            {'\n'}
            <span style={{ color: '#f59e0b' }}>{'      "type"'}</span>
            <span style={{ color: '#a5f3fc' }}>{': '}</span>
            <span style={{ color: '#34d399' }}>{'"new_offer"'}</span>
            <span style={{ color: '#a5f3fc' }}>{','}</span>
            {'\n'}
            <span style={{ color: '#f59e0b' }}>{'      "data"'}</span>
            <span style={{ color: '#a5f3fc' }}>{': { '}</span>
            <span style={{ color: '#f59e0b' }}>{'"discount"'}</span>
            <span style={{ color: '#a5f3fc' }}>{': '}</span>
            <span style={{ color: '#34d399' }}>{'"40%"'}</span>
            <span style={{ color: '#a5f3fc' }}>{', '}</span>
            <span style={{ color: '#f59e0b' }}>{'"item"'}</span>
            <span style={{ color: '#a5f3fc' }}>{': '}</span>
            <span style={{ color: '#34d399' }}>{'"dim sum"'}</span>
            <span style={{ color: '#a5f3fc' }}>{' }'}</span>
            {'\n'}
            <span style={{ color: '#a5f3fc' }}>{'    },'}</span>
            {'\n'}
            <span style={{ color: '#f59e0b' }}>{'    "customer_id"'}</span>
            <span style={{ color: '#a5f3fc' }}>{': '}</span>
            <span style={{ color: '#34d399' }}>{'"cx_priya_0042"'}</span>
            <span style={{ color: '#a5f3fc' }}>{','}</span>
            {'\n'}
            <span style={{ color: '#f59e0b' }}>{'    "send_as"'}</span>
            <span style={{ color: '#a5f3fc' }}>{': '}</span>
            <span style={{ color: '#34d399' }}>{'"merchant_on_behalf"'}</span>
            {'\n'}
            <span style={{ color: '#a5f3fc' }}>{"  }'"}</span>
            {'\n\n'}
            <span style={{ color: '#6b7280' }}>{'# Response (200 OK):'}</span>
            {'\n'}
            <span style={{ color: '#a5f3fc' }}>{'{'}</span>
            {'\n'}
            <span style={{ color: '#f59e0b' }}>{'  "message"'}</span>
            <span style={{ color: '#a5f3fc' }}>{': '}</span>
            <span style={{ color: '#34d399' }}>{'"Bao House just dropped 40% off dim sum —'}</span>
            {'\n'}
            <span style={{ color: '#34d399' }}>{'   spicy wontons that earned them 4.8★ in Hauz Khas.'}</span>
            {'\n'}
            <span style={{ color: '#34d399' }}>{'   Sold out by 8pm last time 🥟"'}</span>
            {'\n'}
            <span style={{ color: '#a5f3fc' }}>{'}'}</span>
          </code>
        </TerminalBlock>
      </div>

      {/* Accordions */}
      <div className="space-y-3">
        <Accordion title="See full testing flow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {testingSteps.map((step, i) => (
              <div
                key={i}
                className="relative p-4 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-brand-50 text-brand-700">
                    <step.icon size={16} />
                  </div>
                  <span className="text-xs font-bold text-brand-700 tracking-wider">{step.step}</span>
                </div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">{step.title}</h4>
                <span className="inline-block text-[0.65rem] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mb-2">
                  {step.time}
                </span>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                {i < testingSteps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-gray-300">
                    <ArrowRight size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Accordion>

        <Accordion title="See technical constraints">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicalConstraints.map((c, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <span className="mt-0.5 w-2 h-2 rounded-full bg-brand-600 shrink-0"></span>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{c.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Accordion>

        <Accordion title="See deployment and local test notes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-3">Your bot must expose 5 endpoints</h4>
              <div className="space-y-2">
                {[
                  { method: 'POST', path: '/v1/context', desc: 'Receive context pushes' },
                  { method: 'POST', path: '/v1/tick', desc: 'Periodic wake-up calls' },
                  { method: 'POST', path: '/v1/reply', desc: 'Handle merchant/customer replies' },
                  { method: 'GET', path: '/v1/healthz', desc: 'Liveness probe' },
                  { method: 'GET', path: '/v1/metadata', desc: 'Bot identity info' },
                ].map((ep, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                      ep.method === 'POST' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-gray-700">{ep.path}</span>
                    <span className="text-gray-400">— {ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-3">Deployment options</h4>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                Deploy anywhere with a public URL. The evaluation harness hits your endpoints directly.
              </p>
              <div className="flex flex-wrap gap-2">
                {['AWS', 'GCP', 'Azure', 'Render', 'Fly.io', 'Railway', 'ngrok'].map((p, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Accordion>
      </div>
    </SectionWrapper>
  );
}
