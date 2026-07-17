import Navbar from './sections/Navbar';
import HeroSection from './sections/HeroSection';
import TaskSection from './sections/TaskSection';
import MessageCraftSection from './sections/MessageCraftSection';
import ScoringSection from './sections/ScoringSection';
import DatasetSection from './sections/DatasetSection';
import TestingSection from './sections/TestingSection';
import SubmissionSection from './sections/SubmissionSection';
import Footer from './sections/Footer';

export default function App() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <Navbar />
      <main>
        <HeroSection />
        <div className="border-t border-gray-200/60" />
        <TaskSection />
        <div className="border-t border-gray-200/60" />
        <MessageCraftSection />
        <div className="border-t border-gray-200/60" />
        <ScoringSection />
        <div className="border-t border-gray-200/60" />
        <DatasetSection />
        <div className="border-t border-gray-200/60" />
        <TestingSection />
        <div className="border-t border-gray-200/60" />
        <SubmissionSection />
      </main>
      <Footer />
    </div>
  );
}
