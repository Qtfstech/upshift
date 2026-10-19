import { Reveal } from '../../components/Reveal';
import SectionTag from '../../components/SectionTag';

export default function AboutSection() {
  return (
    <section id="about" className="relative py-24 lg:py-28">
      <div className="container-px max-w-3xl">
        <Reveal>
          <SectionTag label="About Us" />
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-5 font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight">
            Training built around how MNCs actually hire.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-5 text-lg text-ink-muted leading-relaxed">
            Quality Thought runs 100% live, instructor-led courses across AI, Cloud, Data and Full
            Stack development — with every track backed by mock interviews, mentor support and
            placement guidance until you land the role.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
