import type { Applicant } from '../types';
import { formatDate } from '../lib/selectors';
import { ScoreBar } from './Signals';

/**
 * Assessment results sit inline against the applicant (G3). The block also states
 * where the score came from, because removing Budi's manual retyping is the point
 * of the automated score import (Requirement #7) — the prototype shows the state,
 * not a HackerRank API call.
 */
export function AssessmentBlock({ applicant }: { applicant: Applicant }) {
  const { assessmentScore, assessmentStatus, scoreSource, scoreImportedAt } = applicant;

  return (
    <section className="panel-section" aria-label="Assessment">
      <h3>Assessment</h3>
      <div className="assessment-block">
        <div className="assessment-headline">
          <ScoreBar score={assessmentScore} width={140} />
          <span className={`assess-status assess-${assessmentStatus.toLowerCase().replace(/\s+/g, '-')}`}>
            {assessmentStatus}
          </span>
        </div>
        <p className="provenance">
          {scoreSource === 'automated-import' && (
            <>
              Imported automatically on {formatDate(scoreImportedAt)} — no manual entry
              (Requirement #7).
            </>
          )}
          {scoreSource === 'awaiting-import' && assessmentStatus === 'In progress' && (
            <>
              Candidate is sitting the assessment. The score will arrive by automated import —
              nobody retypes it.
            </>
          )}
          {scoreSource === 'awaiting-import' && assessmentStatus === 'Not started' && (
            <>Assessment invite not sent yet. Score will arrive by automated import.</>
          )}
        </p>
        <p className="caveat">
          Seeded score — stands in for the assessment vendor integration. No coding-assessment
          engine is built into this platform (Task 3 decision).
        </p>
      </div>
    </section>
  );
}
