import SectionWrapper from '../components/SectionWrapper';
import { X, Check, Lightbulb, ShieldAlert, Eye } from 'lucide-react';

const genericTags = [
  { label: 'No trigger context', icon: X },
  { label: 'No merchant fact', icon: X },
  { label: 'Generic template', icon: X },
];

const strongTags = [
  { label: 'Specific benchmark', icon: Check },
  { label: 'Real offer woven in', icon: Check },
  { label: 'Time-sensitive hook', icon: Check },
];

const bottomCards = [
  {
    icon: Lightbulb,
    title: 'Levers that work',
    items: [
      'Social proof from reviews and ratings',
      'Scarcity & urgency triggers',
      'Personalized price anchors',
      'Locality-aware references',
      'Behavioral pattern callbacks',
    ],
  },
  {
    icon: ShieldAlert,
    title: 'Hard constraints',
    items: [
      'Max 160 characters per message',
      'No ALL CAPS words (except brand)',
      'No misleading claims or fake urgency',
      'No excessive punctuation (!!!)',
      'Must feel human, not robotic',
    ],
  },
  {
    icon: Eye,
    title: 'What judges change',
    items: [
      'Trigger type (new offer, revisit, etc.)',
      'Customer spending patterns',
      'Merchant category & attributes',
      'Time and day of the message',
      'Customer visit recency',
    ],
  },
];

export default function MessageCraftSection() {
  return (
    <SectionWrapper
      id="message-craft"
      label="MESSAGE CRAFT"
      heading="What a strong message looks like."
    >
      {/* Comparison cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Generic card */}
        <div className="card border-red-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <h3 className="font-bold text-lg text-gray-900">Generic</h3>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
            <p className="text-sm text-gray-700 italic leading-relaxed font-mono">
              "Hey! Check out amazing deals near you. Great restaurants, incredible offers. Don't miss out on savings! 🎉"
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {genericTags.map((tag, i) => (
              <span key={i} className="tag tag-red">
                <tag.icon size={12} />
                {tag.label}
              </span>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              This message could be sent to anyone, about any merchant. No personalization, no context, no reason to act now.
            </p>
          </div>
        </div>

        {/* Strong card */}
        <div className="card border-emerald-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            <h3 className="font-bold text-lg text-gray-900">High compulsion</h3>
          </div>
          <div className="bg-emerald-50/50 rounded-lg p-4 mb-4 border border-emerald-100">
            <p className="text-sm text-gray-700 italic leading-relaxed font-mono">
              "Bao House just dropped 40% off dim sum — the spicy wontons that earned them 4.8★ in Hauz Khas. Last time sold out by 8pm 🥟"
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {strongTags.map((tag, i) => (
              <span key={i} className="tag tag-green">
                <tag.icon size={12} />
                {tag.label}
              </span>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Specific merchant, real offer, social proof (4.8★), locality (Hauz Khas), scarcity (sold out by 8pm). Every word earns attention.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {bottomCards.map((card, i) => (
          <div key={i} className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-brand-50 text-brand-700">
                <card.icon size={20} />
              </div>
              <h3 className="font-bold text-gray-900">{card.title}</h3>
            </div>
            <ul className="space-y-2">
              {card.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-gray-500">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
