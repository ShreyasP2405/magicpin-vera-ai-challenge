import SectionWrapper from '../components/SectionWrapper';
import TerminalBlock from '../components/TerminalBlock';
import Accordion from '../components/Accordion';
import { Target, Search, Fingerprint, Clock, Flame } from 'lucide-react';

const scores = [
  {
    value: '/10',
    label: 'Decision quality',
    desc: 'Does the message choose the right thing to say given the context?',
    icon: Target,
  },
  {
    value: '/10',
    label: 'Specificity',
    desc: 'Concrete, verifiable facts — numbers, dates, real data points.',
    icon: Search,
  },
  {
    value: '/10',
    label: 'Category & merchant fit',
    desc: 'Voice, vocabulary, and offer format matching the vertical.',
    icon: Fingerprint,
  },
  {
    value: '/10',
    label: 'Trigger relevance',
    desc: 'Clearly communicates "why now" — timing and urgency.',
    icon: Clock,
  },
  {
    value: '/10',
    label: 'Engagement compulsion',
    desc: 'Would a real user want to tap? Uses compulsion levers.',
    icon: Flame,
  },
];

const judgingCriteria = [
  {
    title: 'Specificity',
    details: [
      'Uses concrete numbers, not vague claims',
      'References real merchant attributes',
      'Includes verifiable data points',
      'Penalty for generic framings',
    ],
  },
  {
    title: 'Category Fit',
    details: [
      'Matches vertical voice & vocabulary',
      'Appropriate offer format for category',
      'Respects domain norms (clinical vs casual)',
      'Correct pricing/service framing',
    ],
  },
  {
    title: 'Trigger Relevance',
    details: [
      'Clear "why now" signal',
      'Time-sensitive hooks when appropriate',
      'Connects trigger to merchant benefit',
      'Avoids fake urgency',
    ],
  },
  {
    title: 'Compulsion',
    details: [
      'Social proof from real data',
      'Loss aversion when warranted',
      'Curiosity-driven hooks',
      'Single, clear call-to-action',
    ],
  },
];

export default function ScoringSection() {
  return (
    <SectionWrapper
      id="scoring"
      label="HOW SCORING WORKS"
      heading="Our AI scores decisions, not just writing style."
    >
      {/* Score cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {scores.map((s, i) => (
          <div key={i} className="score-card group">
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700 mb-4 group-hover:bg-brand-100 transition-colors">
              <s.icon size={22} />
            </div>
            <div className="score-number">
              <span className="text-4xl md:text-5xl">10</span>
            </div>
            <div className="score-label font-semibold text-gray-800 mt-2">{s.label}</div>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Terminal + Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="flex flex-col justify-center">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Test before you submit</h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            Run the judge simulator locally to see how your messages score across all 5 dimensions.
            The simulator uses the same rubric as the final evaluation — no surprises.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            Each message gets a per-dimension breakdown with rationale explaining why points were
            awarded or deducted. Use this feedback loop to iterate on your compose function.
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="px-2 py-1 rounded-md bg-gray-100 font-mono">Python 3.10+</span>
            <span className="px-2 py-1 rounded-md bg-gray-100 font-mono">&lt; 30s per call</span>
            <span className="px-2 py-1 rounded-md bg-gray-100 font-mono">Deterministic</span>
          </div>
        </div>
        <TerminalBlock title="judge_simulator.py">
          <code>
            <span style={{ color: '#9ca3af' }}>$ </span>
            <span style={{ color: '#34d399' }}>python</span>
            <span style={{ color: '#a5f3fc' }}> judge_simulator.py</span>
            {'\n\n'}
            <span style={{ color: '#6b7280' }}>{'# Loading test pairs...'}</span>
            {'\n'}
            <span style={{ color: '#a5f3fc' }}>{'▸ Loaded 30 canonical test pairs'}</span>
            {'\n'}
            <span style={{ color: '#a5f3fc' }}>{'▸ Running compose() for each pair...'}</span>
            {'\n\n'}
            <span style={{ color: '#f59e0b' }}>{'═══ Test Pair 01 ═══════════════════════'}</span>
            {'\n'}
            <span style={{ color: '#9ca3af' }}>{'Merchant: '}</span>
            <span style={{ color: '#34d399' }}>{'Bao House (Hauz Khas)'}</span>
            {'\n'}
            <span style={{ color: '#9ca3af' }}>{'Trigger:  '}</span>
            <span style={{ color: '#f59e0b' }}>{'new_offer (40% off dim sum)'}</span>
            {'\n\n'}
            <span style={{ color: '#9ca3af' }}>{'Message → '}</span>
            <span style={{ color: '#ffffff' }}>{'"Bao House just dropped 40% off dim '}</span>
            {'\n'}
            <span style={{ color: '#ffffff' }}>{'sum — spicy wontons that earned them '}</span>
            {'\n'}
            <span style={{ color: '#ffffff' }}>{'4.8★ in Hauz Khas. Sold out by 8pm 🥟"'}</span>
            {'\n\n'}
            <span style={{ color: '#34d399' }}>{'  Specificity:    8/10  ✓'}</span>
            {'\n'}
            <span style={{ color: '#34d399' }}>{'  Category fit:   9/10  ✓'}</span>
            {'\n'}
            <span style={{ color: '#34d399' }}>{'  Merchant fit:   9/10  ✓'}</span>
            {'\n'}
            <span style={{ color: '#f59e0b' }}>{'  Trigger rel.:   7/10  ~'}</span>
            {'\n'}
            <span style={{ color: '#34d399' }}>{'  Compulsion:     8/10  ✓'}</span>
            {'\n'}
            <span style={{ color: '#6b7280' }}>{'  ─────────────────────'}</span>
            {'\n'}
            <span style={{ color: '#a5f3fc' }}>{'  TOTAL:         41/50'}</span>
          </code>
        </TerminalBlock>
      </div>

      {/* Accordion */}
      <Accordion title="Read judging guidance">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {judgingCriteria.map((criteria, i) => (
            <div key={i}>
              <h4 className="font-bold text-gray-900 mb-3 text-sm">{criteria.title}</h4>
              <ul className="space-y-2">
                {criteria.details.map((d, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-gray-500">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0"></span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Accordion>
    </SectionWrapper>
  );
}
