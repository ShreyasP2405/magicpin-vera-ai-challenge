import SectionWrapper from '../components/SectionWrapper';
import { Bot, Wrench, Trophy, LayoutGrid, Store, Zap, User } from 'lucide-react';

const topCards = [
  {
    icon: Bot,
    title: 'What Vera is',
    content:
      'Vera is magicpin\'s AI messaging engine — she writes hyper-personalized push notifications that drive users back to local merchants. She understands context, timing, and tone.',
  },
  {
    icon: Wrench,
    title: 'What you build',
    content:
      'A bot endpoint that receives structured context (category, merchant, trigger, customer data) and returns a single, high-compulsion push notification message under 160 characters.',
  },
  {
    icon: Trophy,
    title: 'What strong entries do',
    content:
      'They go beyond templates. They weave in merchant-specific facts, time-sensitive triggers, and customer behavior patterns to craft messages that feel personal, not programmatic.',
  },
];

const contextCards = [
  {
    num: '01',
    icon: LayoutGrid,
    title: 'Category',
    desc: 'The vertical the merchant belongs to — restaurants, salons, gyms, spas, and more. Each has distinct user psychology and messaging norms.',
  },
  {
    num: '02',
    icon: Store,
    title: 'Merchant',
    desc: 'Real merchant data including name, locality, rating, cuisine/type, price-for-two, and unique selling points distilled from reviews.',
  },
  {
    num: '03',
    icon: Zap,
    title: 'Trigger',
    desc: 'The reason to send a message right now — a new offer, trending status, a revisit nudge, or an abandoned cart. Timing is everything.',
  },
  {
    num: '04',
    icon: User,
    title: 'Customer',
    desc: 'User history and preferences including visit frequency, average spend, favorite categories, last seen, and preferred price range.',
  },
];

export default function TaskSection() {
  return (
    <SectionWrapper id="task" label="THE TASK" heading="Build the message engine behind Vera.">
      {/* Row 1 – 3 equal cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {topCards.map((card, i) => (
          <div key={i} className="card group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700 group-hover:bg-brand-100 transition-colors">
                <card.icon size={22} />
              </div>
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">{card.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{card.content}</p>
          </div>
        ))}
      </div>

      {/* Row 2 – 4 context cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {contextCards.map((card, i) => (
          <div key={i} className="card-muted group relative">
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-bold text-gray-400 tracking-widest">{card.num}</span>
              <div className="p-2 rounded-lg bg-white text-gray-400 group-hover:text-brand-700 transition-colors shadow-sm">
                <card.icon size={18} />
              </div>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{card.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
