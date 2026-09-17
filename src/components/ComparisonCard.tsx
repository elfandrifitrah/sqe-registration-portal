import type { Applicant } from '../types';
import { PROGRAM_LABEL, formatDate, scoreTone } from '../lib/selectors';
import { ScoreBar, StatusBadge } from './Signals';

interface ComparisonCardProps {
  applicant: Applicant;
  onRemove: (id: string) => void;
}

export function ComparisonCard({ applicant, onRemove }: ComparisonCardProps) {
  const tone = scoreTone(applicant.assessmentScore);

  return (
    <article className="comparison-card">
      <header className="card-header">
        <div>
          <h3>{applicant.name}</h3>
          <span className="card-sub">
            {PROGRAM_LABEL[applicant.program]} · {applicant.country} · applied{' '}
            {formatDate(applicant.applicationDate)}
          </span>
        </div>
        <button
          className="btn small ghost"
          onClick={() => onRemove(applicant.id)}
          aria-label={`Remove ${applicant.name} from the comparison set`}
        >
          Remove
        </button>
      </header>

      <div className={`card-score tone-${tone}`}>
        <span className="card-score-label">Assessment</span>
        <ScoreBar score={applicant.assessmentScore} width={120} />
        <span className="card-score-status">{applicant.assessmentStatus}</span>
      </div>

      <dl className="card-answers">
        {applicant.answers
          .filter((answer) => !answer.ignored)
          .map((answer) => (
            <div key={answer.label}>
              <dt>{answer.label}</dt>
              <dd>{answer.value}</dd>
            </div>
          ))}
      </dl>

      <div className="card-decision">
        <StatusBadge status={applicant.status} />
        <span className="decision-meta">
          {applicant.decision
            ? `${applicant.decision} by ${applicant.decidedBy} on ${formatDate(applicant.decidedAt)}`
            : 'No decision recorded'}
        </span>
      </div>

      <div className="card-notes">
        <span className="card-notes-label">Reviewer notes</span>
        <p>{applicant.notes || <em className="muted">No notes recorded.</em>}</p>
      </div>
    </article>
  );
}
