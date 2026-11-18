import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Circle, Diamond, Square, Triangle } from 'lucide-react';
import { saveGameResult } from '@/components/game/GameResultSaver';
import { sounds } from '@/components/utils/sounds';
import { median } from '@/lib/scoreComparison';

const phases = ['Find the matching shape', 'Repeat the sequence', 'Wait for the signal'];
const shapes = [
  { name: 'Circle', Icon: Circle },
  { name: 'Triangle', Icon: Triangle },
  { name: 'Square', Icon: Square },
  { name: 'Diamond', Icon: Diamond },
];
const trialDuration = 6000;
const revealDuration = 2000;
const trialCount = 15;

function trialPattern(trial, offset) {
  const first = (trial + offset) % shapes.length;
  return trial < 5 ? [first] : [first, (first + 1 + trial % 2) % 4, (first + 3) % 4];
}

export default function RobotMission() {
  const [practice, setPractice] = useState(false);
  const [quiet, setQuiet] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [screen, setScreen] = useState('intro');
  const [elapsed, setElapsed] = useState(0);
  const [practiceTrial, setPracticeTrial] = useState(0);
  const [practiceReveal, setPracticeReveal] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState('');
  const run = useRef(null);
  const finishLock = useRef(false);
  const trial = practice ? practiceTrial : Math.min(trialCount - 1, Math.floor(elapsed / trialDuration));
  const phase = Math.floor(trial / 5);
  const withinTrial = elapsed % trialDuration;
  const pattern = trialPattern(trial, run.current?.offset ?? 0);
  const revealing = practice ? phase === 1 && !practiceReveal : phase === 1 && withinTrial < revealDuration;
  const ready = practice || withinTrial >= revealDuration;

  function start() {
    run.current = { start: performance.now(), offset: Math.floor(Math.random() * 4), outcomes: new Map(), inputs: new Set() };
    finishLock.current = false;
    setElapsed(0);
    setPracticeTrial(0);
    setPracticeReveal(false);
    setAnswers([]);
    setFeedback('');
    setScreen('playing');
  }

  function finish() {
    if (finishLock.current) return;
    finishLock.current = true;
    setScreen('finished');
    if (practice) return;

    const { outcomes, inputs } = run.current;
    const correct = [...outcomes.values()].filter(result => result.correct);
    const reactionTimes = correct.flatMap(result => result.reaction == null ? [] : [result.reaction]);
    saveGameResult({
      game_type: 37, difficulty: 1,
      player_name: localStorage.getItem('loopybrainPlayerName') || 'Player',
      score: correct.length, correct_hits: correct.length, wrong_hits: trialCount - correct.length,
      total_time: trialDuration * trialCount,
      avg_reaction_time: reactionTimes.length ? reactionTimes.reduce((sum, value) => sum + value, 0) / reactionTimes.length : 0,
      median_reaction_time: median(reactionTimes),
      input_mode: inputs.size > 1 ? 'mixed' : [...inputs][0] ?? 'unknown',
    });
  }

  useEffect(() => {
    if (screen !== 'playing' || practice) return;
    const timer = setInterval(() => {
      const time = performance.now() - run.current.start;
      setElapsed(time);
      if (time >= trialCount * trialDuration) finish();
    }, 50);
    return () => clearInterval(timer);
  }, [screen, practice]);

  useEffect(() => {
    setAnswers([]);
    setFeedback('');
    setPracticeReveal(false);
  }, [trial]);

  function respond(choice, mode) {
    if (screen !== 'playing' || revealing || run.current.outcomes.has(trial)) return;
    const now = performance.now() - run.current.start;
    if (!practice && Math.floor(now / trialDuration) !== trial) return;
    run.current.inputs.add(mode);
    const next = [...answers, choice];
    if (phase === 1 && next.length < pattern.length) {
      setAnswers(next);
      return;
    }
    const correct = phase === 2 ? ready : pattern.every((value, index) => value === next[index]);
    const reaction = phase === 2 && correct && !practice ? Math.max(0, now % trialDuration - revealDuration) : null;
    run.current.outcomes.set(trial, { correct, reaction });
    setFeedback(phase === 2 && !ready ? 'A little early' : correct ? 'Got it!' : 'Keep going');
    if (!quiet) {
      if (correct) sounds.correctHit();
      else sounds.wrongHit();
    }
  }

  useEffect(() => {
    function onKey(event) {
      if (screen !== 'playing' || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      if (phase === 2 && event.code === 'Space' && !document.activeElement?.closest('button:not([data-signal])')) {
        event.preventDefault();
        respond(0, 'keyboard');
      } else if (phase !== 2 && /^[1-4]$/.test(event.key)) {
        respond(Number(event.key) - 1, 'keyboard');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const controls = 'rounded-lg border border-slate-300 px-4 py-2 font-medium focus-visible:outline focus-visible:outline-offset-4';
  const primary = controls + ' bg-indigo-700 text-white';
  const correctCount = [...(run.current?.outcomes.values() ?? [])].filter(result => result.correct).length;
  const pointerMode = event => event.detail === 0 ? 'keyboard' : event.nativeEvent.pointerType || 'mouse';

  return (
    <main className="min-h-screen bg-indigo-50 px-5 py-8 pb-24 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link className="text-indigo-700 underline dark:text-indigo-300" to="/">Back to games</Link>
        <header className="flex items-center gap-4">
          <Bot className={screen === 'finished' && !reducedMotion ? 'size-12 motion-safe:animate-bounce' : 'size-12'} aria-hidden="true" />
          <div><h1 className="text-3xl font-bold">Robot Mission</h1><p>Help the robot collect three parts.</p></div>
        </header>
        <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
          {screen === 'intro' && <>
            <p>Match shapes, repeat patterns and respond when the signal says Go.</p>
            <div className="grid gap-3">
              <label><input type="checkbox" checked={practice} onChange={event => setPractice(event.target.checked)} /> Untimed practice</label>
              <label><input type="checkbox" checked={quiet} onChange={event => setQuiet(event.target.checked)} /> Quiet mode</label>
              <label><input type="checkbox" checked={reducedMotion} onChange={event => setReducedMotion(event.target.checked)} /> Reduced motion</label>
            </div>
            <button className={primary} onClick={start}>{practice ? 'Start practice' : 'Start 90-second mission'}</button>
          </>}
          {screen === 'playing' && <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">{phases[phase]}</h2>
              <p>Part {phase + 1} of 3{!practice && ' ? ' + Math.max(0, Math.ceil((90000 - elapsed) / 1000)) + ' s'}</p>
            </div>
            <p>Trial {trial % 5 + 1} of 5</p>
            {phase === 0 && <p className="text-lg">Find <strong>{shapes[pattern[0]].name}</strong></p>}
            {phase === 1 && (revealing ? <div className="flex flex-wrap items-center gap-3">
              {pattern.map((value, index) => {
                const { Icon, name } = shapes[value];
                return <span className="inline-flex items-center gap-1" key={index}><Icon aria-hidden="true" />{name}</span>;
              })}
              {practice && <button className={controls} onClick={() => setPracticeReveal(true)}>I?m ready</button>}
            </div> : <p>Repeat the shapes in order. {answers.length} of 3 selected.</p>)}
            {phase !== 2 && !revealing && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {shapes.map(({ Icon, name }, index) => <button key={name} className={controls}
                disabled={Boolean(feedback)} onClick={event => respond(index, pointerMode(event))}>
                <Icon className="mx-auto" aria-hidden="true" />{name} <span aria-hidden="true">({index + 1})</span>
              </button>)}
            </div>}
            {phase === 2 && <button className={(ready ? primary : controls) + ' w-full min-h-24 text-xl'}
              data-signal disabled={Boolean(feedback)} onClick={event => respond(0, pointerMode(event))}>{ready ? 'Go' : 'Wait'}</button>}
            <p className="min-h-6" aria-live="polite">{feedback}</p>
            {practice && feedback && <button className={primary} onClick={() => {
              if (trial + 1 === trialCount) finish();
              else setPracticeTrial(trial + 1);
            }}>{trial + 1 === trialCount ? 'Finish' : 'Next trial'}</button>}
            <button className={controls} onClick={() => setScreen('intro')}>Stop mission</button>
          </>}
          {screen === 'finished' && <>
            <h2 className="text-xl font-bold">All three robot parts collected</h2>
            <p>{correctCount} correct out of {trialCount}{practice && ' ? practice'}</p>
            <button className={primary} onClick={() => setScreen('intro')}>Play again</button>
          </>}
        </section>
      </div>
    </main>
  );
}
