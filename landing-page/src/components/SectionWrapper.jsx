export default function SectionWrapper({ id, label, heading, children }) {
  return (
    <section id={id} className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {label && <p className="section-label">{label}</p>}
        {heading && <h2 className="section-heading">{heading}</h2>}
        {children}
      </div>
    </section>
  );
}
