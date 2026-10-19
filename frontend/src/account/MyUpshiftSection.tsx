import { ArrowRight, CalendarClock, CheckCircle2, GraduationCap, Lightbulb, Rocket, Video } from 'lucide-react';
import type { ReactNode } from 'react';
import { Reveal } from '../components/Reveal';
import type { Account } from './account';

/**
 * "My Upshift": shown on the main page and the Idea Challenge page once logged in. Everything the person has done on
 * the site in one place: ideas sent, evening Zoom calls, hackathon team and the workshops they looked at.
 */

const ACTION_LABEL: Record<string, string> = {
  reserve_whatsapp: 'Seat requested on WhatsApp',
  join_class: 'Asked to join the free class',
  enquire: 'Enquired',
  pay_whatsapp: 'Payment started on WhatsApp',
  browse: 'Viewed',
};
const dateOf = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
const base = import.meta.env.BASE_URL;

function Card({ Icon, title, action, children }: { Icon: typeof Video; title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border border-ink/5 shadow-card p-5 flex flex-col">
      <h3 className="flex items-center gap-2 font-display font-bold text-lg text-ink">
        <span className="h-8 w-8 rounded-lg bg-sun/10 text-sun flex items-center justify-center">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h3>
      <div className="mt-3 flex-1 text-sm text-ink-soft">{children}</div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

const linkCls = 'group inline-flex items-center gap-1.5 text-sm font-semibold text-sun hover:underline';
const Go = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} className={linkCls}>
    {children} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
  </a>
);

export default function MyUpshiftSection({ account, page }: { account: Account; page: 'main' | 'idea-challenge' }) {
  const { ideaChallenge: ic, zoomCalls, hackathon, products } = account;
  const workshops = products.filter((p) => p.productKey !== 'hackathon');

  return (
    <section id="my-upshift" className="relative z-10 py-14 scroll-mt-24">
      <div className="container-px">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-sun">My Upshift</p>
              <h2 className="mt-1 font-display font-bold text-3xl sm:text-4xl tracking-tight text-ink">Welcome back, {account.user.firstName}</h2>
            </div>
            <p className="text-sm text-ink-muted">Your ideas, calls, hackathon and workshops in one place.</p>
          </div>
        </Reveal>

        <div className="mt-8 grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* Idea Challenge */}
          <Card
            Icon={Lightbulb}
            title="Idea Challenge"
            action={page === 'main' ? <Go href={`${base}idea-challenge`}>{ic.entries.length ? "Send today's idea" : 'Send your first idea'}</Go> : null}
          >
            <p>
              <b className="font-display text-2xl text-ink">{ic.points}</b> Arc Points · {ic.entries.length} {ic.entries.length === 1 ? 'idea' : 'ideas'} sent
            </p>
            {ic.entries.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1.5">
                {ic.entries.slice(-4).reverse().map((e) => (
                  <li key={e.code} className="leading-snug">
                    <span className="font-mono text-[11px] text-sun">DAY {String(e.day).padStart(2, '0')}</span> <span className="text-ink">{e.title}</span>
                    {e.rank && <span className="ml-1 rounded-full bg-sun/10 px-1.5 text-[11px] font-bold text-sun">{e.rank === 1 ? 'Winner' : `Top 10 · #${e.rank}`}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Evening Zoom calls */}
          <Card Icon={Video} title="Evening Zoom calls">
            {zoomCalls.length === 0 ? (
              <p className="text-ink-muted">
                Each day our team shortlists the most promising ideas for a live evening Zoom discussion. If your idea is picked, the call shows up here.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {zoomCalls.map((z) => (
                  <li key={z.day} className="rounded-xl bg-paper/60 px-3 py-2.5">
                    <p className="font-semibold text-ink leading-snug">
                      Day {z.day} · {z.category}
                    </p>
                    <p className="text-xs text-ink-muted truncate">{z.title}</p>
                    {z.attended ? (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-leaf">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Attended
                      </p>
                    ) : z.invited ? (
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        {z.time && (
                          <span className="inline-flex items-center gap-1 font-semibold text-ink">
                            <CalendarClock className="h-3.5 w-3.5 text-sun" /> {z.time}
                          </span>
                        )}
                        {z.link ? (
                          <a href={z.link} target="_blank" rel="noopener noreferrer" className="rounded-full bg-sun px-2.5 py-1 font-semibold text-white hover:brightness-110">
                            Join Zoom
                          </a>
                        ) : (
                          <span className="text-ink-muted">Meeting link coming on WhatsApp</span>
                        )}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs font-semibold text-sun">Shortlisted · we'll send the meeting details</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Hackathon */}
          <Card Icon={Rocket} title="Hackathon" action={hackathon.length === 0 ? <Go href={`${base}hackathon`}>Register a team</Go> : null}>
            {hackathon.length === 0 ? (
              <p className="text-ink-muted">Not registered yet. Teams of 1, 2 or 4 build an AI agent online, and the winners go to the Hyderabad finale.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {hackathon.map((t) => (
                  <li key={t.id}>
                    <p className="font-semibold text-ink">
                      {t.teamName} <span className="font-mono text-xs text-ink-muted">#{t.id}</span>
                    </p>
                    <p className="text-xs text-ink-muted">
                      {t.members} {t.members === 1 ? 'member' : 'members'} · registered {dateOf(t.registeredAt)}
                    </p>
                    <p className={`mt-0.5 text-xs font-semibold ${t.paid ? 'text-leaf' : 'text-sun'}`}>{t.paid ? 'Payment confirmed' : 'Payment pending on WhatsApp'}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Workshops */}
          <Card Icon={GraduationCap} title="Your workshops" action={<Go href={`${base}#workshops`}>Explore workshops</Go>}>
            {workshops.length === 0 ? (
              <p className="text-ink-muted">Workshops and classes you reserve or ask about show up here.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {workshops.slice(0, 5).map((p) => (
                  <li key={p.productKey}>
                    <p className="font-semibold text-ink">
                      {p.productName}
                      {p.price != null && <span className="ml-1 font-normal text-ink-muted">· ₹{p.price}</span>}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {ACTION_LABEL[p.actions[0]] ?? p.actions[0]} · {dateOf(p.lastAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
