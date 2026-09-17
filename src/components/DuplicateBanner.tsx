import type { Applicant } from '../types';
import { PROGRAM_LABEL, formatDate, otherProgram } from '../lib/selectors';

interface DuplicateBannerProps {
  applicant: Applicant;
  partner: Applicant | undefined;
  onOpenPartner: (id: string) => void;
}

/**
 * Duplicates are caught at screening instead of at interview stage (Requirement #3).
 * The banner is only rendered when the detector flagged a pair, and it links straight
 * to the paired record so the reviewer can compare them without hunting the queue.
 */
export function DuplicateBanner({ applicant, partner, onOpenPartner }: DuplicateBannerProps) {
  if (!applicant.duplicateOfId) return null;

  const other = PROGRAM_LABEL[otherProgram(applicant.program)];

  return (
    <div className="dup-banner" role="status">
      <span className="dup-icon" aria-hidden="true">
        ⚠
      </span>
      <div className="dup-body">
        <strong>Possible duplicate</strong>
        <span>
          {partner ? (
            <>
              Also applied to the <strong>{other}</strong> programme on{' '}
              {formatDate(partner.applicationDate)} — currently{' '}
              <em>{partner.status}</em>
              {partner.decision ? <> ({partner.decision} by {partner.decidedBy})</> : null}.
            </>
          ) : (
            <>Paired record flagged but not visible in this view.</>
          )}
        </span>
      </div>
      {partner && (
        <button className="btn small" onClick={() => onOpenPartner(partner.id)}>
          Open paired record
        </button>
      )}
    </div>
  );
}
