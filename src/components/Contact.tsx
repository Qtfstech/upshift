import { useEffect, useState, FormEvent } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Reveal } from './Reveal';

const WORKSHOP_OPTIONS = ['Cybersecurity', 'Robotics', 'Spacetech', 'General Enquiry'];

// Replace with Upshift India's WhatsApp Business number (digits only, country code first, no +)
const WHATSAPP_NUMBER = '919876543210';

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.09c-.24.68-1.4 1.32-1.93 1.37-.5.05-1 .25-3.32-.7-2.8-1.15-4.6-3.98-4.74-4.16-.14-.19-1.13-1.51-1.13-2.88 0-1.37.72-2.04.97-2.32.25-.28.55-.34.73-.34.18 0 .37 0 .53.01.17.01.4-.06.62.48.24.58.8 2 .87 2.15.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.19 1.53 1.93 1.05.95 1.94 1.25 2.22 1.39.28.14.44.12.6-.07.17-.19.7-.82.89-1.1.19-.28.37-.23.62-.14.25.09 1.6.76 1.87.9.28.14.46.21.53.32.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}

interface ContactProps {
  selectedWorkshop?: string;
}

export default function Contact({ selectedWorkshop }: ContactProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    workshop: 'General Enquiry',
    message: '',
  });

  useEffect(() => {
    if (selectedWorkshop) {
      setForm((f) => ({ ...f, workshop: selectedWorkshop }));
    }
  }, [selectedWorkshop]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const lines = [
      'Hi Upshift India! I’d like to reserve a workshop seat.',
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      `Interested in: ${form.workshop}`,
      form.message && `Message: ${form.message}`,
    ].filter(Boolean);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="contact" className="relative py-24 lg:py-28 bg-paper/60">
      <div className="container-px grid lg:grid-cols-[0.9fr_1.1fr] gap-14">
        <Reveal>
          <span className="section-tag mb-5">Get Started</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight">
            Ready to <span className="text-sun">Upshift</span>?
          </h2>
          <p className="mt-5 text-ink-muted text-lg leading-relaxed max-w-md">
            Reserve your ₹499 demo seat in Cybersecurity, Robotics or Spacetech — or just
            ask us anything about Workplace-Integrated Learning.
          </p>

          <div className="mt-9 space-y-4">
            <div className="flex items-center gap-3 text-ink-soft">
              <span className="h-10 w-10 rounded-xl bg-white shadow-card flex items-center justify-center">
                <Mail className="h-4.5 w-4.5 text-sun" />
              </span>
              <span className="font-medium">hello@upshiftindia.com</span>
            </div>
            <div className="flex items-center gap-3 text-ink-soft">
              <span className="h-10 w-10 rounded-xl bg-white shadow-card flex items-center justify-center">
                <Phone className="h-4.5 w-4.5 text-sun" />
              </span>
              <span className="font-medium">+91 00000 00000</span>
            </div>
            <div className="flex items-center gap-3 text-ink-soft">
              <span className="h-10 w-10 rounded-xl bg-white shadow-card flex items-center justify-center">
                <MapPin className="h-4.5 w-4.5 text-sun" />
              </span>
              <span className="font-medium">Hyderabad, India</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-3xl bg-white border border-ink/5 shadow-soft p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Full Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-ink/10 bg-cream/50 px-4 py-3 text-ink outline-none focus:border-sun focus:ring-2 focus:ring-sun/20 transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Phone</label>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-ink/10 bg-cream/50 px-4 py-3 text-ink outline-none focus:border-sun focus:ring-2 focus:ring-sun/20 transition-all"
                    placeholder="+91"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-ink/10 bg-cream/50 px-4 py-3 text-ink outline-none focus:border-sun focus:ring-2 focus:ring-sun/20 transition-all"
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Interested in</label>
                <select
                  value={form.workshop}
                  onChange={(e) => setForm({ ...form, workshop: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-ink/10 bg-cream/50 px-4 py-3 text-ink outline-none focus:border-sun focus:ring-2 focus:ring-sun/20 transition-all cursor-pointer"
                >
                  {WORKSHOP_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">
                  Message (optional)
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-ink/10 bg-cream/50 px-4 py-3 text-ink outline-none focus:border-sun focus:ring-2 focus:ring-sun/20 transition-all resize-none"
                  placeholder="Anything you'd like us to know"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white font-semibold py-3.5 hover:bg-[#1ebe5a] hover:-translate-y-0.5 transition-all duration-300 shadow-soft cursor-pointer"
              >
                Reserve My Seat on WhatsApp <WhatsAppIcon className="h-4 w-4" />
              </button>
              <p className="text-center text-xs text-ink-muted">
                Opens WhatsApp with your details pre-filled — we'll confirm your seat there.
              </p>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
