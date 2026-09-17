/**
 * Domain types for the Registration & Recruitment Workspace prototype.
 *
 * Mirrors the prototype-level data model in the Prototype PRD §8. Deliberately
 * narrow: no roles, permissions, tenancy or persistence concerns — this is a
 * front-end demonstration of product and UX decisions, not a systems prototype.
 */

export type Program = 'academy' | 'institute';

export type Country = 'Indonesia' | 'Japan' | 'Germany' | 'UAE';

export type Status = 'New' | 'In Review' | 'Shortlisted' | 'On Hold' | 'Rejected';

/** Reviewer-facing screening decision. Maps onto a status (§6.4 state model). */
export type Decision = 'Shortlist' | 'Hold' | 'Reject';

export type AssessmentStatus = 'Passed' | 'Failed' | 'In progress' | 'Not started';

/**
 * Where an assessment score came from. The prototype only ever holds seeded
 * scores, but the provenance is shown because eliminating Budi's manual retyping
 * (Requirement #7, automated score import) is part of the point being made.
 */
export type ScoreSource = 'automated-import' | 'awaiting-import';

export interface AuditEntry {
  id: string;
  /** Human-readable action, e.g. "Decision recorded: Shortlist". */
  action: string;
  actor: string;
  at: string;
}

export interface ApplicantAnswer {
  label: string;
  value: string;
  /** True when the field is irrelevant to this applicant's programme (Req #1). */
  ignored?: boolean;
}

export interface Portfolio {
  fileName: string;
  uploadedAt: string;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  program: Program;
  country: Country;
  /** ISO date, used for sort and the calibration-mode pool snapshot. */
  applicationDate: string;
  status: Status;
  assessmentScore: number | null;
  assessmentStatus: AssessmentStatus;
  scoreSource: ScoreSource;
  scoreImportedAt: string | null;
  /** Nullable — links the paired academy/institute record (Req #3). */
  duplicateOfId: string | null;
  notes: string;
  decision: Decision | null;
  decidedBy: string | null;
  decidedAt: string | null;
  /** A decision is reversible until it is finalized. */
  finalizedAt: string | null;
  portfolio: Portfolio | null;
  answers: ApplicantAnswer[];
  history: AuditEntry[];
}

export interface QueueFilters {
  search: string;
  country: Country | 'All';
  program: Program | 'All';
  status: Status | 'All';
  duplicateOnly: boolean;
  scoreMin: string;
  scoreMax: string;
}

export type SortBy = 'date' | 'score' | 'status';

/**
 * Calibration mode reconciles the Task 5 batch-vs-rolling tension in the UI:
 * rolling = continuous intake, snapshot = the full current pool for calibration.
 */
export type QueueMode = 'rolling' | 'snapshot';

export type View = 'screening' | 'comparison' | 'traceability';
