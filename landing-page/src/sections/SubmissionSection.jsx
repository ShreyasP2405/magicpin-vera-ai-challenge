import { useState } from 'react';
import SectionWrapper from '../components/SectionWrapper';
import { Download, Code2, Link, Send, ArrowRight, ChevronDown } from 'lucide-react';

const steps = [
  {
    icon: Download,
    num: '01',
    title: 'Download pack',
    desc: 'Clone the challenge repository. Get the dataset, judge simulator, briefs, and example case studies.',
  },
  {
    icon: Code2,
    num: '02',
    title: 'Build engine',
    desc: 'Implement your compose() function. Use the 4-context framework to craft high-compulsion messages.',
  },
  {
    icon: Link,
    num: '03',
    title: 'Set URL',
    desc: 'Deploy your bot with a public URL exposing all 5 required HTTP endpoints.',
  },
  {
    icon: Send,
    num: '04',
    title: 'Submit entry',
    desc: 'Submit bot.py, submission.jsonl, and README.md. Optionally add conversation_handlers.py for bonus.',
  },
];

const faqs = [
  {
    q: 'Can I use LLMs (GPT-4, Claude, etc.) in my compose function?',
    a: 'Yes. You can use any model, API, or approach. We evaluate the output quality, not the method. However, your bot must respond within 30 seconds per call, so design your pipeline accordingly.',
  },
  {
    q: 'What happens if my bot goes down during testing?',
    a: 'The evaluation harness will retry failed requests up to 3 times. If your bot is consistently unresponsive, those test pairs will score 0. We recommend deploying to a reliable platform and testing your uptime before submitting.',
  },
  {
    q: 'Can I participate solo?',
    a: 'Yes. Teams can be solo or pairs. There\'s no advantage or penalty either way — we evaluate the output quality equally.',
  },
  {
    q: 'Is the data real?',
    a: 'The dataset is synthetic but realistic — modeled on real merchant categories, pricing patterns, and customer behaviors from the magicpin platform. No real PII is included.',
  },
  {
    q: 'How do I know if my messages are good enough?',
    a: 'Run the judge_simulator.py locally. It uses the same 5-dimension rubric as the final evaluation. Aim for consistent scores above 7/10 in each dimension.',
  },
  {
    q: 'What language should messages be in?',
    a: 'Hindi-English code-mixing (Hi-en mix) is encouraged and reflects real communication patterns with Indian merchants. Pure English is also fine. Match the merchant\'s language preference when available.',
  },
];

function FAQItem({ faq }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all">
      <button
        className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-gray-900 text-sm leading-relaxed">{faq.q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 mt-0.5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 -mt-1 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
          <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
        </div>
      )}
    </div>
  );
}

export default function SubmissionSection() {
  return (
    <>
      <SectionWrapper
        id="submission"
        label="OPEN SUBMISSIONS"
        heading="Start your challenge journey in 4 steps."
      >
        {/* 4-step cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {steps.map((step, i) => (
            <div key={i} className="card group relative">
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-extrabold text-gray-300 tracking-widest">{step.num}</span>
                <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700 group-hover:bg-brand-100 transition-colors">
                  <step.icon size={20} />
                </div>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-gray-300">
                  <ArrowRight size={16} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mb-20">
          <button className="btn-primary text-lg px-10 py-4 group">
            Start your journey
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </button>
          <p className="text-xs text-gray-400 mt-4">
            Open to individuals and pairs · No registration fee · AI-judged for fairness
          </p>
        </div>

        {/* FAQ */}
        <div>
          <p className="section-label">FAQ</p>
          <h3 className="section-heading">Straight answers before you submit.</h3>
          <div className="space-y-3 max-w-4xl">
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} />
            ))}
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
