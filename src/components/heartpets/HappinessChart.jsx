import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const EVENT_META = {
  care: { color: '#10b981', label: 'Care' },
  game: { color: '#a855f7', label: 'Mini-game' },
  touch: { color: '#f59e0b', label: 'Pet' },
  daily: { color: '#ef4444', label: 'Daily' },
};

function fmtDay(t) {
  return new Date(t).toLocaleDateString(undefined, { weekday: 'short' });
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const d = new Date(p.t);
  const ev = p.event ? EVENT_META[p.event] : null;
  return (
    <div className="bg-white/95 rounded-lg shadow-lg p-2 text-xs border border-purple-100">
      <div className="font-bold text-purple-800">
        {d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
        {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-pink-500 font-semibold">Happiness: {p.happiness}</div>
      {ev && (
        <div className="font-semibold" style={{ color: ev.color }}>
          {ev.label}
        </div>
      )}
    </div>
  );
}

function EventDot(props) {
  const { cx, cy, payload } = props;
  if (!payload?.event) return <g />;
  const meta = EVENT_META[payload.event];
  return (
    <circle cx={cx} cy={cy} r={4} fill={meta?.color || '#888'} stroke="#fff" strokeWidth={1.5} />
  );
}

export default function HappinessChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/80 rounded-2xl p-4 mt-4 border border-purple-100">
        <h3 className="font-bold text-purple-800 text-sm mb-1">📈 Happiness Trend</h3>
        <p className="text-xs text-purple-400">
          No data yet — care for your companion to start tracking their mood!
        </p>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => a.t - b.t);

  return (
    <div className="bg-white/80 rounded-2xl p-3 mt-4 border border-purple-100">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-purple-800 text-sm">📈 Happiness Trend</h3>
        <span className="text-[10px] text-purple-400">past 7 days</span>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sorted} margin={{ top: 5, right: 8, bottom: 0, left: -22 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ede9fe" />
            <XAxis dataKey="t" tickFormatter={fmtDay} tick={{ fontSize: 10, fill: '#9333ea' }} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9333ea' }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="happiness"
              stroke="#ec4899"
              strokeWidth={2.5}
              dot={<EventDot />}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-1 justify-center">
        {Object.entries(EVENT_META).map(([k, m]) => (
          <span key={k} className="flex items-center gap-1 text-[10px] text-purple-600 font-medium">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: m.color }} />
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}