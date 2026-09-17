import type {
  Applicant,
  Country,
  Decision,
  Program,
  QueueFilters,
  SortBy,
  Status,
} from '../types';

export const PROGRAM_LABEL: Record<Program, string> = {
  academy: 'Academy',
  institute: 'Institute',
};

export const PROGRAMS: Program[] = ['academy', 'institute'];

export const STATUS_ORDER: Status[] = ['New', 'In Review', 'Shortlisted', 'On Hold', 'Rejected'];

/** Which status a screening decision moves the application to (§6.4). */
export const DECISION_STATUS: Record<Decision, Status> = {
  Shortlist: 'Shortlisted',
  Hold: 'On Hold',
  Reject: 'Rejected',
};

export const DECISIONS: Decision[] = ['Shortlist', 'Hold', 'Reject'];

export const emptyFilters: QueueFilters = {
  search: '',
  country: 'All',
  program: 'All',
  status: 'All',
  duplicateOnly: false,
  scoreMin: '',
  scoreMax: '',
};

export function otherProgram(program: Program): Program {
  return program === 'academy' ? 'institute' : 'academy';
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const toDate = (value: string): Date | null => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/** Tolerant date formatter: accepts "2026-08-12" and full ISO timestamps. */
export function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = toDate(value);
  if (!date) return value;
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatDateTime(value: string | null): string {
  if (!value) return '—';
  // Date-only stamps are calendar facts, not moments — do not invent a 00:00 time.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return formatDate(value);
  const date = toDate(value);
  if (!date) return value;
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  return `${formatDate(value)}, ${hh}:${mm} UTC`;
}

/** Paired academy/institute record, if the duplicate detector flagged one. */
export function duplicatePartner(
  applicants: Applicant[],
  applicant: Applicant,
): Applicant | undefined {
  if (!applicant.duplicateOfId) return undefined;
  return applicants.find((a) => a.id === applicant.duplicateOfId);
}

export function matchSearch(applicant: Applicant, search: string): boolean {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return (
    applicant.name.toLowerCase().includes(needle) ||
    applicant.email.toLowerCase().includes(needle)
  );
}

export function matchesFilters(applicant: Applicant, filters: QueueFilters): boolean {
  if (!matchSearch(applicant, filters.search)) return false;
  if (filters.country !== 'All' && applicant.country !== filters.country) return false;
  if (filters.program !== 'All' && applicant.program !== filters.program) return false;
  if (filters.status !== 'All' && applicant.status !== filters.status) return false;
  if (filters.duplicateOnly && !applicant.duplicateOfId) return false;

  const min = filters.scoreMin === '' ? null : Number(filters.scoreMin);
  const max = filters.scoreMax === '' ? null : Number(filters.scoreMax);
  if (min !== null || max !== null) {
    // A score range is a deliberate filter: unscored applicants cannot satisfy it.
    if (applicant.assessmentScore === null) return false;
    if (min !== null && Number.isFinite(min) && applicant.assessmentScore < min) return false;
    if (max !== null && Number.isFinite(max) && applicant.assessmentScore > max) return false;
  }
  return true;
}

export function sortApplicants(applicants: Applicant[], sortBy: SortBy): Applicant[] {
  const byDateDesc = (a: Applicant, b: Applicant) =>
    b.applicationDate.localeCompare(a.applicationDate);

  const sorted = [...applicants];
  switch (sortBy) {
    case 'score':
      // Highest score first; applicants without an imported score sink to the bottom.
      sorted.sort((a, b) => {
        if (a.assessmentScore === null && b.assessmentScore === null) return byDateDesc(a, b);
        if (a.assessmentScore === null) return 1;
        if (b.assessmentScore === null) return -1;
        return b.assessmentScore - a.assessmentScore || byDateDesc(a, b);
      });
      break;
    case 'status':
      sorted.sort(
        (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || byDateDesc(a, b),
      );
      break;
    case 'date':
    default:
      sorted.sort(byDateDesc);
      break;
  }
  return sorted;
}

export function buildQueue(
  applicants: Applicant[],
  filters: QueueFilters,
  sortBy: SortBy,
): Applicant[] {
  return sortApplicants(
    applicants.filter((a) => matchesFilters(a, filters)),
    sortBy,
  );
}

export function countriesInUse(applicants: Applicant[]): Country[] {
  return [...new Set(applicants.map((a) => a.country))].sort();
}

export interface CalibrationSnapshot {
  /** Context date the snapshot is taken as of. */
  asOf: string;
  poolSize: number;
  cycleSize: number;
  byStatus: { status: Status; count: number }[];
  newestApplication: string | null;
  decided: number;
}

/**
 * The pool snapshot behind "calibration mode" — the UI reconciliation of the
 * Task 5 batch-vs-rolling tension (G5). Same data, framed as a pool to calibrate
 * against rather than a rolling intake queue.
 */
export function calibrationSnapshot(applicants: Applicant[], asOf: string): CalibrationSnapshot {
  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    count: applicants.filter((a) => a.status === status).length,
  }));
  const dates = applicants.map((a) => a.applicationDate).sort();
  return {
    asOf,
    poolSize: applicants.length,
    cycleSize: applicants.length,
    byStatus,
    newestApplication: dates.length ? dates[dates.length - 1] : null,
    decided: applicants.filter((a) => a.decision !== null).length,
  };
}

export type ScoreTone = 'high' | 'mid' | 'low' | 'none';

/**
 * Display-only banding for the score bar. Real thresholds are per-country and
 * per-programme and are not settled — flagged as an open question, not modelled.
 */
export function scoreTone(score: number | null): ScoreTone {
  if (score === null) return 'none';
  if (score >= 80) return 'high';
  if (score >= 60) return 'mid';
  return 'low';
}

export function shortlistCandidates(applicants: Applicant[], ids: string[]): Applicant[] {
  return ids
    .map((id) => applicants.find((a) => a.id === id))
    .filter((a): a is Applicant => Boolean(a));
}
