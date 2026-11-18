import { useState } from 'react';
import { Link } from 'react-router-dom';
import ColorReaction from '@/components/game/Game1ColorReaction';
import { inputLabels, recentRounds } from '@/lib/scoreComparison';
import RoundTable from '@/components/game/RoundTable';

const SESSION_KEY = 'loopybrain_school_session';
const SCORES_KEY = 'loopybrain_school_rounds';

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export default function School() {
  const [session, setSession] = useState(() => read(SESSION_KEY, null));
  const [rounds, setRounds] = useState(() => read(SCORES_KEY, []));
  const [code, setCode] = useState(() => read(SESSION_KEY, null)?.code ?? '');
  const [selectedCode, setSelectedCode] = useState(() => read(SESSION_KEY, null)?.code ?? '');
  const [difficulty, setDifficulty] = useState(1);
  const [inputMode, setInputMode] = useState('keyboard');
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState('');
  const [schoolError, setSchoolError] = useState('');

  function startSession(event) {
    event.preventDefault();
    const playerCode = code.trim().toUpperCase();
    if (!/^[A-Z0-9-]{3,16}$/.test(playerCode)) return;
    const next = { id: crypto.randomUUID(), code: playerCode };
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setSession(next);
    setSelectedCode(playerCode);
    setSaved('');
  }

  function saveRound(score) {
    try {
      const next = [...read(SCORES_KEY, []), {
        ...score, id: crypto.randomUUID(), created_date: new Date().toISOString(), session_id: session.id,
      }];
      localStorage.setItem(SCORES_KEY, JSON.stringify(next));
      setRounds(next);
      if (score.input_mode !== 'mixed') setInputMode(score.input_mode);
      setSaved('The round was saved on this device.');
    } catch {
      setSchoolError('This browser could not save the round.');
    }
  }

  const codes = [...new Set([...rounds.map(round => round.player_name), ...(session ? [session.code] : [])])].sort();
  const comparable = recentRounds(rounds.filter(round => round.player_name === selectedCode &&
    round.game_type === 1 && round.difficulty === difficulty && round.input_mode === inputMode && !['mixed', 'unknown'].includes(inputMode)));

  if (playing && session) {
    return <ColorReaction difficulty={difficulty} playerName={session.code} onSave={saveRound}
      schoolMode onMainMenu={() => setPlaying(false)} />;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 pb-24 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link className="text-indigo-700 underline dark:text-indigo-300" to="/">Back to games</Link>
        <header><h1 className="text-3xl font-bold">Classroom session</h1>
          <p className="mt-2">Use a short player code. Classroom results stay in this browser and appear here.</p></header>
        <section className="space-y-4 rounded-xl border border-slate-300 p-5">
          {session ? <>
            <p>Active player <strong>{session.code}</strong></p>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-lg bg-indigo-700 px-4 py-2 text-white" onClick={() => {
                setSaved(''); setSchoolError(''); setPlaying(true);
              }}>Play Color Reaction</button>
              <button className="rounded-lg border px-4 py-2" onClick={() => {
                localStorage.removeItem(SESSION_KEY); setSession(null);
              }}>End session</button>
            </div>
          </> : <form className="flex flex-wrap items-end gap-3" onSubmit={startSession}>
            <label className="grid gap-1">Player code
              <input className="rounded-lg border bg-white px-3 py-2 text-slate-900" value={code}
                onChange={event => setCode(event.target.value)} pattern="[A-Za-z0-9-]{3,16}" required maxLength={16} />
            </label>
            <button className="rounded-lg border px-4 py-2" type="button"
              onClick={() => setCode(crypto.randomUUID().slice(0, 8).toUpperCase())}>Generate code</button>
            <button className="rounded-lg bg-indigo-700 px-4 py-2 text-white">Start session</button>
          </form>}
          {saved && <p role="status">{saved}</p>}
          {schoolError && <p role="alert">{schoolError}</p>}
        </section>
        <section className="space-y-4 rounded-xl border border-slate-300 p-5">
          <h2 className="text-xl font-semibold">Color Reaction ? last five comparable rounds</h2>
          <div className="flex flex-wrap gap-4">
            <label className="grid gap-1">Player code
              <select className="rounded border bg-white p-2 text-slate-900" value={selectedCode} onChange={event => setSelectedCode(event.target.value)}>
                <option value="">Select player</option>
                {codes.map(value => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label className="grid gap-1">Difficulty
              <select className="rounded border bg-white p-2 text-slate-900" value={difficulty} onChange={event => setDifficulty(Number(event.target.value))}>
                {['Easy', 'Medium', 'Hard', 'Expert'].map((name, index) => <option value={index + 1} key={name}>{name}</option>)}
              </select>
            </label>
            <label className="grid gap-1">Controls
              <select className="rounded border bg-white p-2 text-slate-900" value={inputMode} onChange={event => setInputMode(event.target.value)}>
                {Object.entries(inputLabels).filter(([mode]) => !['unknown', 'mixed'].includes(mode)).map(([mode, label]) => <option value={mode} key={mode}>{label}</option>)}
              </select>
            </label>
          </div>
          <RoundTable rounds={comparable} />
        </section>
      </div>
    </main>
  );
}
