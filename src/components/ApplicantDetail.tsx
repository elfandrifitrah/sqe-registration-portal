import { useState } from 'react';
import type { Applicant } from '../types';
import { PROGRAM_LABEL, formatDate, formatDateTime } from '../lib/selectors';
import { AssessmentBlock } from './AssessmentBlock';
import { DuplicateBanner } from './DuplicateBanner';
import { StatusBadge } from './Signals';

interface ApplicantDetailProps {
  applicant: Applicant;
  partner: Applicant | undefined;
  onOpenPartner: (id: string) => void;
  onSaveNotes: (id: string, notes: string) => void;
}

export function ApplicantDetail({
  applicant,
  partner,
  onOpenPartner,
  onSaveNotes,
}: ApplicantDetailProps) {
  // Mounted with key={applicant.id} by the parent, so the draft resets per record.
  const [draft, setDraft] = useState(applicant.notes);
  const notesDirty = draft !== applicant.notes;

  return (
    <article className="detail-panel">
      <header className="detail-header">
        <div>
          <h2>{applicant.name}</h2>
          <span className="detail-email">{applicant.email}</span>
        </div>
        <StatusBadge status={applicant.status} />
      </header>

      <DuplicateBanner applicant={applicant} partner={partner} onOpenPartner={onOpenPartner} />

      <div className="detail-grid">
        <div className="detail-field">
          <label>Program</label>
          <div>{PROGRAM_LABEL[applicant.program]}</div>
        </div>
        <div className="detail-field">
          <label>Country</label>
          <div>
            <span className={`country country-${applicant.country.toLowerCase()}`}>
              {applicant.country}
            </span>
          </div>
        </div>
        <div className="detail-field">
          <label>Applied</label>
          <div>{formatDate(applicant.applicationDate)}</div>
        </div>
        <div className="detail-field">
          <label>Application ID</label>
          <div>APP-{applicant.id.padStart(5, '0')}</div>
        </div>
      </div>

      <section className="panel-section" aria-label="Application answers">
        <h3>Application</h3>
        <dl className="answer-list">
          {applicant.answers.map((answer) => (
            <div
              key={answer.label}
              className={`answer-row ${answer.ignored ? 'answer-ignored' : ''}`}
            >
              <dt>
                {answer.label}
                {answer.ignored && <span className="ignored-tag">not relevant</span>}
              </dt>
              <dd>{answer.value}</dd>
            </div>
          ))}
        </dl>
        <p className="caveat">
          Academy and institute still share one intake form, so a few fields on every record are
          irrelevant to that programme. Configurable per-country forms (Requirement #1) are
          described, not built here.
        </p>
      </section>

      <section className="panel-section" aria-label="Portfolio">
        <h3>Portfolio</h3>
        {applicant.portfolio ? (
          <div className="portfolio-row">
            <span className="file-icon" aria-hidden="true">
              📎
            </span>
            <span className="file-name">{applicant.portfolio.fileName}</span>
            <span className="file-meta">
              uploaded {formatDate(applicant.portfolio.uploadedAt)}
            </span>
            <button className="btn small" disabled title="File preview is not part of the prototype">
              Preview
            </button>
          </div>
        ) : (
          <p className="muted">No portfolio attached to this application.</p>
        )}
      </section>

      <AssessmentBlock applicant={applicant} />

      <section className="panel-section" aria-label="Reviewer notes">
        <h3>Reviewer notes</h3>
        <textarea
          className="notes-input"
          rows={4}
          value={draft}
          placeholder="Notes are saved with the record and visible to the director in the comparison view."
          onChange={(e) => setDraft(e.target.value)}
        />
        <div className="notes-actions">
          <button
            className="btn primary"
            disabled={!notesDirty}
            onClick={() => onSaveNotes(applicant.id, draft)}
          >
            {notesDirty ? 'Save notes' : 'Saved'}
          </button>
          {notesDirty && (
            <button className="btn ghost" onClick={() => setDraft(applicant.notes)}>
              Discard
            </button>
          )}
        </div>
      </section>

      <section className="panel-section" aria-label="Audit trail">
        <h3>Decision &amp; audit trail</h3>
        {applicant.decision ? (
          <div className="decision-summary">
            <div>
              <span className="decision-label">{applicant.decision}</span>
              <span className="decision-meta">
                by {applicant.decidedBy} on {formatDate(applicant.decidedAt)}
                {applicant.finalizedAt ? ' · finalized' : ' · reversible'}
              </span>
            </div>
          </div>
        ) : (
          <p className="muted">
            No screening decision recorded yet. Every decision is captured with the reviewer's
            name and a timestamp.
          </p>
        )}
        <ol className="history-list">
          {[...applicant.history].reverse().map((h) => (
            <li key={h.id}>
              <span className="history-action">{h.action}</span>
              <span className="history-meta">
                {h.actor} · {formatDateTime(h.at)}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
