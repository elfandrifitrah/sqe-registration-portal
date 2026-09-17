import type { Applicant } from '../types';
import { PROGRAM_LABEL, formatDate } from '../lib/selectors';
import { ScoreBar, StatusBadge } from './Signals';

interface QueueTableProps {
  applicants: Applicant[];
  selectedId: string | null;
  comparisonIds: string[];
  onSelect: (id: string) => void;
}

export function QueueTable({
  applicants,
  selectedId,
  comparisonIds,
  onSelect,
}: QueueTableProps) {
  if (applicants.length === 0) {
    return (
      <div className="queue-empty">
        No applications match these filters. Widen the country, program or score range.
      </div>
    );
  }

  return (
    <table className="queue-table">
      <thead>
        <tr>
          <th className="col-mark" aria-label="In comparison set" />
          <th>Applicant</th>
          <th>Program</th>
          <th>Country</th>
          <th>Applied</th>
          <th>Status</th>
          <th>Assessment</th>
          <th className="col-flag">Signals</th>
        </tr>
      </thead>
      <tbody>
        {applicants.map((a) => (
          <tr
            key={a.id}
            className={`queue-row ${selectedId === a.id ? 'selected' : ''}`}
            tabIndex={0}
            aria-selected={selectedId === a.id}
            onClick={() => onSelect(a.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(a.id);
              }
            }}
          >
            <td className="col-mark">
              {comparisonIds.includes(a.id) ? (
                <span className="cmp-chip" title="In the comparison set">
                  ✓
                </span>
              ) : null}
            </td>
            <td className="col-name">
              <span className="name" title={a.name}>
                {a.name}
              </span>
              <span className="email" title={a.email}>
                {a.email}
              </span>
            </td>
            <td>{PROGRAM_LABEL[a.program]}</td>
            <td>
              <span className={`country country-${a.country.toLowerCase()}`}>{a.country}</span>
            </td>
            <td className="col-date">{formatDate(a.applicationDate)}</td>
            <td>
              <StatusBadge status={a.status} />
            </td>
            <td>
              <ScoreBar score={a.assessmentScore} width={34} />
            </td>
            <td className="col-flag">
              {a.duplicateOfId ? (
                <span
                  className="dup-flag"
                  title="Possible duplicate — the same person has an academy and an institute application"
                >
                  ⚠ Dup
                </span>
              ) : (
                <span className="no-flag">—</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
