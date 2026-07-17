import SectionWrapper from '../components/SectionWrapper';
import TerminalBlock from '../components/TerminalBlock';
import { FileText, Upload, BookOpen } from 'lucide-react';

export default function DatasetSection() {
  return (
    <SectionWrapper
      id="dataset"
      label="DATASET"
      heading="Every team starts from the same base data."
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Terminal - wider */}
        <div className="lg:col-span-3">
          <TerminalBlock title="~/magicpin-ai-challenge">
            <code>
              <span style={{ color: '#9ca3af' }}>$ </span>
              <span style={{ color: '#34d399' }}>tree</span>
              <span style={{ color: '#a5f3fc' }}> magicpin-ai-challenge/</span>
              {'\n\n'}
              <span style={{ color: '#f59e0b' }}>{'magicpin-ai-challenge/'}</span>
              {'\n'}
              <span style={{ color: '#6b7280' }}>{'├── '}</span>
              <span style={{ color: '#a5f3fc' }}>{'challenge-brief.md'}</span>
              {'\n'}
              <span style={{ color: '#6b7280' }}>{'├── '}</span>
              <span style={{ color: '#a5f3fc' }}>{'challenge-testing-brief.md'}</span>
              {'\n'}
              <span style={{ color: '#6b7280' }}>{'├── '}</span>
              <span style={{ color: '#a5f3fc' }}>{'engagement-design.md'}</span>
              {'\n'}
              <span style={{ color: '#6b7280' }}>{'├── '}</span>
              <span style={{ color: '#a5f3fc' }}>{'engagement-research.md'}</span>
              {'\n'}
              <span style={{ color: '#6b7280' }}>{'├── '}</span>
              <span style={{ color: '#34d399' }}>{'judge_simulator.py'}</span>
              {'\n'}
              <span style={{ color: '#6b7280' }}>{'├── '}</span>
              <span style={{ color: '#f59e0b' }}>{'dataset/'}</span>
              {'\n'}
              <span style={{ color: '#6b7280' }}>{'│   ├── '}</span>
              <span style={{ color: '#f59e0b' }}>{'categories/'}</span>
              {'\n'}
              <span style={{ color: '#6b7280' }}>{'│   │   ├── '}</span>
              <span style={{ color: '#a5f3fc' }}>{'dentists.json'}</span>
              {'\n'}
              <span style={{ color: '#6b7280' }}>{'│   │   ├── '}</span>
              <span style={{ color: '#a5f3fc' }}>{'gyms.json'}</span>
              {'\n'}
              <span style={{ color: '#6b7280' }}>{'│   │   ├── '}</span>
              <span style={{ color: '#a5f3fc' }}>{'pharmacies.json'}</span>
              {'\n'}
              <span style={{ color: '#6b7280' }}>{'│   │   ├── '}</span>
              <span style={{ color: '#a5f3fc' }}>{'restaurants.json'}</span>
              {'\n'}
              <span style={{ color: '#6b7280' }}>{'│   │   └── '}</span>
              <span style={{ color: '#a5f3fc' }}>{'salons.json'}</span>
              {'\n'}
              <span style={{ color: '#6b7280' }}>{'│   ├── '}</span>
              <span style={{ color: '#a5f3fc' }}>{'customers_seed.json'}</span>
              {'\n'}
              <span style={{ color: '#6b7280' }}>{'│   ├── '}</span>
              <span style={{ color: '#34d399' }}>{'generate_dataset.py'}</span>
              {'\n'}
              <span style={{ color: '#6b7280' }}>{'│   ├── '}</span>
              <span style={{ color: '#a5f3fc' }}>{'merchants_seed.json'}</span>
              {'\n'}
              <span style={{ color: '#6b7280' }}>{'│   └── '}</span>
              <span style={{ color: '#a5f3fc' }}>{'triggers_seed.json'}</span>
              {'\n'}
              <span style={{ color: '#6b7280' }}>{'└── '}</span>
              <span style={{ color: '#f59e0b' }}>{'examples/'}</span>
              {'\n'}
              <span style={{ color: '#6b7280' }}>{'    ├── '}</span>
              <span style={{ color: '#a5f3fc' }}>{'api-call-examples.md'}</span>
              {'\n'}
              <span style={{ color: '#6b7280' }}>{'    └── '}</span>
              <span style={{ color: '#a5f3fc' }}>{'case-studies.md'}</span>
              {'\n\n'}
              <span style={{ color: '#34d399' }}>{'5 categories • 50 merchants • 200 customers • 100 triggers'}</span>
            </code>
          </TerminalBlock>
        </div>

        {/* What you submit card */}
        <div className="lg:col-span-2">
          <div className="card h-full flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700">
                <Upload size={22} />
              </div>
              <h3 className="font-bold text-lg text-gray-900">What you submit</h3>
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <FileText size={18} className="text-brand-700 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-gray-900">bot.py</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Your compose() function — the core message engine
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <FileText size={18} className="text-brand-700 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-gray-900">submission.jsonl</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    30 lines — one generated message per canonical test pair
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <BookOpen size={18} className="text-brand-700 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-gray-900">README.md</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    1 page explaining your approach and tradeoffs
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                <FileText size={18} className="text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    conversation_handlers.py
                    <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      optional
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Multi-turn conversation handling (tiebreaker bonus)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
