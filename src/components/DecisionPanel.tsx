import type { Applicant, Decision } from '../types';
import { DECISIONS, PROGRAM_LABEL, formatDate, otherProgram, scoreTone } from '../lib/selectors';

interface DecisionPanelProps {
  applicant: Applicant;
  comparisonIds: string[];
  onDecide: (id: string, decision: Decision) => void;
  onReverse: (id: string) => void;
  onFinalize: (id: string) => void;
  onAddToComparison: (id: string) => void;
  onOpenComparison: () => void;
}

const DECISION_HINT: Record<Decision, string> = {
  Shortlist: 'Puts the candidate in the comparison set for the director.',
  Hold: 'Keeps the application open for calibration against the wider pool.',
  Reject: 'Closes the application. Still reversible until finalized.',
};

export function DecisionPanel({
  applicant,
  comparisonIds,
  onDecide,
  onReverse,
  onFinalize,
  onAddToComparison,
  onOpenComparison,
}: DecisionPanelProps) {
  const locked = Boolean(applicant.finalizedAt);
  const inComparison = comparisonIds.includes(applicant.id);
  const tone = scoreTone(applicant.assessmentScore);

  return (
    <aside className="decision-panel" aria-label="Decision and signals">
      <section className="panel-section">
        <h3>Screening decision</h3>
        <div className="decision-buttons">
          {DECISIONS.map((decision) => (
            <button
              key={decision}
              className={`btn decision decision-${decision.toLowerCase()} ${
                applicant.decision === decision ? 'active' : ''
              }`}
              disabled={locked}
              title={DECISION_HINT[decision]}
              onClick={() => onDecide(applicant.id, decision)}
            >
              {decision}
            </button>
          ))}
        </div>
        {locked ? (
          <p className="muted small">
            Finalized on {formatDate(applicant.finalizedAt)} — a finalized decision is locked.
          </p>
        ) : applicant.decision ? (
          <div className="decision-actions">
            <button className="btn small" onClick={() => onFinalize(applicant.id)}>
              Finalize decision
            </button>
            <button className="btn small ghost" onClick={() => onReverse(applicant.id)}>
              Reverse
            </button>
            <p className="muted small">
              Recorded by {applicant.decidedBy} on {formatDate(applicant.decidedAt)}. Reversible
              until finalized.
            </p>
          </div>
        ) : (
          <p className="muted small">
            Nothing recorded yet. Decisions are captured in-platform, not in a spreadsheet.
          </p>
        )}
      </section>

      <section className="panel-section">
        <h3>Signals</h3>
        <ul className="signal-list">
          <li className={applicant.duplicateOfId ? 'signal-warn' : ''}>
            <span className="signal-name">Duplicate</span>
            <span className="signal-value">
              {applicant.duplicateOfId
                ? `Flagged — also applied to ${PROGRAM_LABEL[otherProgram(applicant.program)]}`
                : 'None detected'}
            </span>
          </li>
          <li className={tone === 'low' ? 'signal-warn' : ''}>
            <span className="signal-name">Assessment</span>
            <span className="signal-value">
              {applicant.assessmentScore === null
                ? `${applicant.assessmentStatus} — no score yet`
                : `${applicant.assessmentScore} · ${applicant.assessmentStatus}`}
            </span>
          </li>
          <li>
            <span className="signal-name">Portfolio</span>
            <span className="signal-value">
              {applicant.portfolio ? applicant.portfolio.fileName : 'Not attached'}
            </span>
          </li>
          <li>
            <span className="signal-name">Country</span>
            <span className="signal-value">
              {applicant.country} · {PROGRAM_LABEL[applicant.program]}
            </span>
          </li>
        </ul>
      </section>

      <section className="panel-section">
        <h3>Comparison set</h3>
        <p className="muted small">
          {comparisonIds.length === 0
            ? 'Empty. Shortlisting a candidate adds them automatically.'
            : `${comparisonIds.length} candidate${comparisonIds.length === 1 ? '' : 's'} ready for the director.`}
        </p>
        <div className="decision-actions">
          <button
            className="btn primary"
            disabled={inComparison}
            onClick={() => onAddToComparison(applicant.id)}
          >
            {inComparison ? 'Already in comparison set' : 'Add to comparison set'}
          </button>
          <button
            className="btn"
            onClick={onOpenComparison}
            disabled={comparisonIds.length === 0}
          >
            Open comparison dashboard
          </button>
        </div>
      </section>
    </aside>
  );
}
