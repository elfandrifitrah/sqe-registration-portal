import { useState } from 'react';
import type { Applicant } from '../types';
import { shortlistCandidates, STATUS_ORDER } from '../lib/selectors';
import { ComparisonCard } from '../components/ComparisonCard';

interface ComparisonDashboardProps {
  applicants: Applicant[];
  comparisonIds: string[];
  onRemove: (id: string) => void;
  onBackToScreening: () => void;
  onAddShortlisted: () => void;
}

/**
 * Screen B — Candidate Comparison Dashboard.
 *
 * A director's side-by-side view of the comparison set. Deliberately reads as an
 * upgrade of the PowerPoint deck Arief builds today — cards, side by side, sorted
 * by score — rather than a new concept to learn.
 */
export function ComparisonDashboard({
  applicants,
  comparisonIds,
  onRemove,
  onBackToScreening,
  onAddShortlisted,
}: ComparisonDashboardProps) {
  const [scoreSort, setScoreSort] = useState(false);
  const set = shortlistCandidates(applicants, comparisonIds);

  const cards = scoreSort
    ? [...set].sort((a, b) => (b.assessmentScore ?? -1) - (a.assessmentScore ?? -1))
    : set;

  const shortlisted = applicants.filter((a) => a.status === 'Shortlisted');
  const missing = shortlisted.filter((a) => !comparisonIds.includes(a.id));
  const averageScore =
    set.length === 0
      ? null
      : Math.round(
          set.reduce((sum, a) => sum + (a.assessmentScore ?? 0), 0) /
            set.filter((a) => a.assessmentScore !== null).length ||
            1,
        );

  return (
    <div className="comparison-screen">
      <header className="screen-head">
        <div>
          <h2>Candidate comparison</h2>
          <p className="pane-sub">
            {set.length} candidate{set.length === 1 ? '' : 's'} in the comparison set
            {averageScore !== null ? ` · average assessment score ${averageScore}` : ''}
          </p>
        </div>
        <div className="screen-actions">
          <label className="check">
            <input
              type="checkbox"
              checked={scoreSort}
              onChange={(e) => setScoreSort(e.target.checked)}
            />
            Sort by score
          </label>
          <button className="btn" onClick={onBackToScreening}>
            ← Back to screening
          </button>
          <button
            className="btn primary"
            onClick={() =>
              alert(
                'Export is a placeholder in this prototype.\n\n' +
                  'It represents the outcome Arief asked for — a side-by-side shortlist he no longer ' +
                  'rebuilds by hand in PowerPoint. A real export pipeline is out of prototype scope.',
              )
            }
          >
            Export comparison
          </button>
        </div>
      </header>

      <p className="caveat wide">
        Export is a labelled placeholder: it stands for the PowerPoint-replacement outcome
        (Requirement #9) without pretending a real export pipeline exists.
      </p>

      {missing.length > 0 && (
        <div className="notice-row">
          <span>
            {missing.length} shortlisted candidate{missing.length === 1 ? ' is' : 's are'} not in
            the comparison set yet: {missing.map((m) => m.name).join(', ')}
          </span>
          <button className="btn small" onClick={onAddShortlisted}>
            Add all shortlisted
          </button>
        </div>
      )}

      {cards.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing to compare yet</h3>
          <p>
            Shortlist candidates in the screening workspace, or add them to the comparison set
            directly — the director can also filter the queue by status
            {' '}
            {STATUS_ORDER[2]}.
          </p>
          <button className="btn primary" onClick={onBackToScreening}>
            Go to screening workspace
          </button>
        </div>
      ) : (
        <div className={`comparison-grid cols-${Math.min(cards.length, 4)}`}>
          {cards.map((applicant) => (
            <ComparisonCard key={applicant.id} applicant={applicant} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
