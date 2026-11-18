import { roundAccuracy } from '@/lib/scoreComparison';

export default function RoundTable({ rounds }) {
  if (!rounds.length) return <p>No rounds match these filters yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead><tr><th className="p-2">Date</th><th className="p-2">Accuracy</th>
          <th className="p-2">Reaction time</th><th className="p-2">Score</th></tr></thead>
        <tbody>{rounds.map(round => {
          const accuracy = roundAccuracy(round);
          const typical = round.median_reaction_time ?? (round.avg_reaction_time > 0 ? round.avg_reaction_time : null);
          return <tr className="border-t" key={round.id}>
            <td className="p-2">{new Date(round.created_date).toLocaleString()}</td>
            <td className="p-2">{accuracy == null ? '\u2014' : accuracy + '%'}</td>
            <td className="p-2">{typical == null ? '\u2014' : Math.round(typical) + ' ms' + (round.median_reaction_time == null ? ' (avg)' : ' (median)')}</td>
            <td className="p-2">{round.score}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>
  );
}
