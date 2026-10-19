import type {ReactNode} from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {CampaignStat, DayStat} from '../data/analytics';
import {fmtDay, fmtDate} from '../data/format';
import type {ChartTheme} from '../theme';

export function ChartCard({
  title,
  subtitle,
  legend,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  legend?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`db-card p-4 sm:p-5 flex flex-col min-w-0 ${className}`}>
      <header className="mb-3">
        <h3 className="text-[15px] font-semibold">{title}</h3>
        {subtitle && <p className="text-[12px] db-faint mt-0.5">{subtitle}</p>}
      </header>
      {legend && <div className="mb-3">{legend}</div>}
      <div className="flex-1 min-h-0">{children}</div>
    </section>
  );
}

export function Legend({items}: {items: {name: string; color: string}[]}) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] db-muted">
      {items.map((i) => (
        <li key={i.name} className="flex items-center gap-1.5">
          <span className="db-swatch" style={{background: i.color}} />
          {i.name}
        </li>
      ))}
    </ul>
  );
}

function TooltipBox({title, rows, footer}: {title: string; rows: {name: string; color?: string; value: string}[]; footer?: {name: string; value: string}}) {
  return (
    <div className="db-tooltip">
      <div className="font-semibold mb-1.5">{title}</div>
      {rows.map((r) => (
        <div key={r.name} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 db-muted">
            {r.color && <span className="db-swatch" style={{background: r.color}} />}
            {r.name}
          </span>
          <span className="font-medium">{r.value}</span>
        </div>
      ))}
      {footer && (
        <div className="flex justify-between gap-4 pt-1.5 mt-1.5 border-t" style={{borderColor: 'var(--border)'}}>
          <span className="db-muted">{footer.name}</span>
          <span className="font-semibold">{footer.value}</span>
        </div>
      )}
    </div>
  );
}

const axisProps = (t: ChartTheme) => ({
  tick: {fill: t.textMuted, fontSize: 12},
  axisLine: {stroke: t.axis},
  tickLine: false,
});

/** Daily values stacked by campaign. */
export function StackedDaily({
  data,
  campaigns,
  colorOf,
  metric,
  format,
  formatAxis,
  theme,
  height = 280,
  highlight,
}: {
  data: DayStat[];
  campaigns: string[];
  /** ISO date to shade (the report day) */
  highlight?: string;
  colorOf: (c: string) => string;
  metric: 'leads' | 'spend';
  format: (n: number) => string;
  formatAxis: (n: number) => string;
  theme: ChartTheme;
  height?: number;
}) {
  const many = data.length > 12;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{top: 8, right: 8, left: 0, bottom: 0}} barCategoryGap={many ? '18%' : '28%'}>
        <CartesianGrid vertical={false} stroke={theme.grid} />
        {highlight && data.some((d) => d.date === highlight) && (
          <ReferenceArea x1={highlight} x2={highlight} fill={theme.accent} fillOpacity={0.12} />
        )}
        <XAxis
          dataKey="date"
          tickFormatter={many ? (d: string) => String(+d.slice(8)) : fmtDay}
          interval={many ? 'preserveStartEnd' : 0}
          minTickGap={4}
          {...axisProps(theme)}
        />
        <YAxis tickFormatter={formatAxis} width={52} {...axisProps(theme)} axisLine={false} />
        <Tooltip
          cursor={{fill: theme.grid, opacity: 0.6}}
          content={({active, payload, label}) =>
            active && payload?.length ? (
              <TooltipBox
                title={fmtDate(String(label))}
                rows={[...payload]
                  .reverse()
                  .filter((p) => p.value != null)
                  .map((p) => ({
                    name: String(p.name),
                    color: colorOf(String(p.name)),
                    value: format(Number(p.value)),
                  }))}
                footer={{name: 'Total', value: format(Number((payload[0].payload as DayStat)[metric]))}}
              />
            ) : null
          }
        />
        {campaigns.map((c, i) => (
          <Bar
            key={c}
            name={c}
            dataKey={`${metric}:${c}`}
            stackId="a"
            fill={colorOf(c)}
            stroke={theme.surface}
            strokeWidth={1}
            radius={i === campaigns.length - 1 ? [4, 4, 0, 0] : 0}
            maxBarSize={56}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Horizontal bars, one per campaign. */
export function CampaignBars({
  data,
  value,
  colorOf,
  format,
  theme,
  reference,
  referenceLabel,
  extra,
}: {
  data: CampaignStat[];
  value: (c: CampaignStat) => number | null;
  colorOf: (c: string) => string;
  format: (n: number) => string;
  theme: ChartTheme;
  reference?: number | null;
  referenceLabel?: string;
  extra?: (c: CampaignStat) => {name: string; value: string}[];
}) {
  const rows = data
    .map((c) => ({...c, v: value(c)}))
    .filter((c) => c.v != null)
    .sort((a, b) => b.v! - a.v!);
  return (
    <ResponsiveContainer width="100%" height={Math.max(140, rows.length * 44 + 24)}>
      <BarChart data={rows} layout="vertical" margin={{top: 4, right: 64, left: 0, bottom: 0}} barCategoryGap="24%">
        <CartesianGrid horizontal={false} stroke={theme.grid} />
        <XAxis type="number" tickFormatter={format} {...axisProps(theme)} axisLine={false} />
        <YAxis
          type="category"
          dataKey="campaign"
          width={150}
          {...axisProps(theme)}
          tick={{fill: theme.text, fontSize: 12}}
        />
        {reference != null && (
          <ReferenceLine
            x={reference}
            stroke={theme.textMuted}
            strokeDasharray="4 4"
            label={{value: referenceLabel, position: 'top', fill: theme.textMuted, fontSize: 11}}
          />
        )}
        <Tooltip
          cursor={{fill: theme.grid, opacity: 0.6}}
          content={({active, payload}) => {
            if (!active || !payload?.length) return null;
            const c = payload[0].payload as CampaignStat & {v: number};
            return (
              <TooltipBox
                title={c.campaign}
                rows={[{name: 'Value', color: colorOf(c.campaign), value: format(c.v)}, ...(extra?.(c) ?? [])]}
              />
            );
          }}
        />
        <Bar
          dataKey="v"
          radius={[0, 4, 4, 0]}
          maxBarSize={26}
          isAnimationActive={false}
          label={{position: 'right', fill: theme.text, fontSize: 12, formatter: (v: unknown) => format(Number(v))}}
        >
          {rows.map((r) => (
            <Cell key={r.campaign} fill={colorOf(r.campaign)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Blended cost per lead over time. */
export function CplTrend({
  data,
  theme,
  format,
  average,
}: {
  data: DayStat[];
  theme: ChartTheme;
  format: (n: number) => string;
  average: number | null;
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{top: 16, right: 16, left: 0, bottom: 0}}>
        <CartesianGrid vertical={false} stroke={theme.grid} />
        <XAxis dataKey="date" tickFormatter={fmtDay} {...axisProps(theme)} />
        <YAxis tickFormatter={format} width={52} {...axisProps(theme)} axisLine={false} />
        {average != null && (
          <ReferenceLine
            y={average}
            stroke={theme.textMuted}
            strokeDasharray="4 4"
            label={{value: `Avg ${format(average)}`, position: 'insideTopRight', fill: theme.textMuted, fontSize: 11}}
          />
        )}
        <Tooltip
          cursor={{stroke: theme.axis}}
          content={({active, payload, label}) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as DayStat;
            return (
              <TooltipBox
                title={fmtDate(String(label))}
                rows={[
                  {name: 'Cost per lead', color: theme.accent, value: d.cpl == null ? '—' : format(d.cpl)},
                  {name: 'Leads', value: String(d.leads)},
                  {name: 'Spend', value: format(d.spend)},
                ]}
              />
            );
          }}
        />
        <Line
          type="monotone"
          dataKey="cpl"
          stroke={theme.accent}
          strokeWidth={2}
          dot={{r: 4, fill: theme.accent, stroke: theme.surface, strokeWidth: 2}}
          activeDot={{r: 6, stroke: theme.surface, strokeWidth: 2}}
          connectNulls
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Tiny inline trend for KPI tiles. */
export function Sparkline({values, color}: {values: number[]; color: string}) {
  if (values.length < 2) return null;
  const w = 64;
  const h = 28;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (w - 4) + 2, h - 3 - ((v - min) / span) * (h - 6)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={3} fill={color} />
    </svg>
  );
}
