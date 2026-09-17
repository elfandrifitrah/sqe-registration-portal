import type { Status } from '../types';
import { scoreTone } from '../lib/selectors';

const slug = (value: string) => value.toLowerCase().replace(/\s+/g, '-');

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`status-badge status-${slug(status)}`}>{status}</span>;
}

export function ScoreBar({ score, width = 64 }: { score: number | null; width?: number }) {
  if (score === null) {
    return <span className="score-empty">No score</span>;
  }
  const tone = scoreTone(score);
  return (
    <span className="score-cell" title={`Assessment score ${score} / 100`}>
      <span className="score-track" style={{ width }}>
        <span className={`score-fill tone-${tone}`} style={{ width: `${score}%` }} />
      </span>
      <span className="score-value">{score}</span>
    </span>
  );
}
