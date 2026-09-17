import type { Applicant, AuditEntry } from '../types';

/**
 * Seeded prototype data (Prototype PRD §8).
 *
 * In-memory only — no backend, no nightly CSV export, no HackerRank call. Scores
 * are seeded and stand in for the automated score import (Requirement #7) so the
 * screening workspace can be demonstrated without a vendor integration.
 *
 * Weighted toward Indonesia academy/institute because that is where the duplicate
 * problem and the volume problem actually live, with Japan, Germany and UAE records
 * for country variety. Every status, assessment state and the duplicate case has at
 * least one record so the filters and calibration mode are demonstrable.
 */

/** Signed-in reviewer, modelled on Dian's role (PRD §4). No real auth. */
export const REVIEWER_NAME = 'Dian';

/** Case-study context date: Wednesday 9 September, Week 4 of 8. */
export const TODAY = '2026-09-09';

export const CYCLE_LABEL = '2027 intake cycle';

// Most seeded events are the platform's own (receipt, status moves, score import), so the
// default actor is the system; decisions and finalizations name the reviewer explicitly.
const entry = (id: string, action: string, at: string, actor = 'System'): AuditEntry => ({
  id,
  action,
  actor,
  at,
});
const decided = (id: string, action: string, at: string): AuditEntry =>
  entry(id, action, at, REVIEWER_NAME);

type Seed = Partial<Applicant> &
  Pick<Applicant, 'id' | 'name' | 'email' | 'program' | 'country' | 'applicationDate'>;

const app = (over: Seed): Applicant => ({
  status: 'New',
  assessmentScore: null,
  assessmentStatus: 'Not started',
  scoreSource: 'awaiting-import',
  scoreImportedAt: null,
  duplicateOfId: null,
  notes: '',
  decision: null,
  decidedBy: null,
  decidedAt: null,
  finalizedAt: null,
  portfolio: null,
  answers: [],
  history: [],
  ...over,
});

export const SEED_APPLICANTS: Applicant[] = [
  // ── Indonesia, academy ────────────────────────────────────────────────────
  app({
    id: '1',
    name: 'Ahmad Rizky Pratama',
    email: 'ahmad.rizky@email.com',
    program: 'academy',
    country: 'Indonesia',
    applicationDate: '2026-08-12',
    status: 'In Review',
    assessmentScore: 74,
    assessmentStatus: 'Passed',
    scoreSource: 'automated-import',
    scoreImportedAt: '2026-08-20',
    duplicateOfId: '2',
    portfolio: { fileName: 'ahmad-rizky-portfolio.pdf', uploadedAt: '2026-08-12' },
    answers: [
      { label: 'Track applied for', value: 'Full-stack engineering' },
      { label: 'Years of experience', value: '3 years' },
      { label: 'Motivation', value: 'Wants to move from agency work into product teams.' },
      { label: 'Specialisation (institute form)', value: '—', ignored: true },
    ],
    history: [
      entry('1-a', 'Application received', '2026-08-12'),
      entry('1-b', 'Moved to In Review', '2026-08-14'),
      entry('1-c', 'Assessment score imported automatically', '2026-08-20', 'System'),
    ],
  }),
  app({
    id: '2',
    name: 'Ahmad Rizky Pratama',
    email: 'a.rizky.pratama@email.com',
    program: 'institute',
    country: 'Indonesia',
    applicationDate: '2026-08-14',
    duplicateOfId: '1',
    answers: [
      { label: 'Specialisation', value: 'Applied software engineering' },
      { label: 'Current institution', value: 'Universitas Indonesia' },
      { label: 'Supervisor reference', value: 'Pending' },
      { label: 'Track applied for (academy form)', value: '—', ignored: true },
    ],
    history: [entry('2-a', 'Application received', '2026-08-14')],
  }),
  app({
    id: '3',
    name: 'Sarah Putri Dewi',
    email: 'sarah.putri@email.com',
    program: 'academy',
    country: 'Indonesia',
    applicationDate: '2026-08-18',
    status: 'Shortlisted',
    assessmentScore: 87,
    assessmentStatus: 'Passed',
    scoreSource: 'automated-import',
    scoreImportedAt: '2026-08-26',
    notes: 'Strong portfolio, especially the frontend work. Worth a technical interview.',
    decision: 'Shortlist',
    decidedBy: REVIEWER_NAME,
    decidedAt: '2026-09-05',
    finalizedAt: '2026-09-05',
    portfolio: { fileName: 'sarah-putri-portfolio.pdf', uploadedAt: '2026-08-18' },
    answers: [
      { label: 'Track applied for', value: 'Frontend engineering' },
      { label: 'Years of experience', value: '4 years' },
      { label: 'Motivation', value: 'Wants structured mentoring; self-taught so far.' },
    ],
    history: [
      entry('3-a', 'Application received', '2026-08-18'),
      entry('3-b', 'Moved to In Review', '2026-08-22'),
      entry('3-c', 'Assessment score imported automatically', '2026-08-26', 'System'),
      decided('3-d', 'Decision recorded: Shortlist', '2026-09-05'),
      decided('3-e', 'Decision finalized', '2026-09-05'),
    ],
  }),
  app({
    id: '4',
    name: 'Budi Santoso',
    email: 'budi.santoso@email.com',
    program: 'academy',
    country: 'Indonesia',
    applicationDate: '2026-08-20',
    status: 'On Hold',
    assessmentScore: 62,
    assessmentStatus: 'Passed',
    scoreSource: 'automated-import',
    scoreImportedAt: '2026-08-29',
    notes: 'Decent, not standout. Holding until we see the rest of the Indonesia academy pool.',
    decision: 'Hold',
    decidedBy: REVIEWER_NAME,
    decidedAt: '2026-09-06',
    portfolio: { fileName: 'budi-santoso-work.zip', uploadedAt: '2026-08-20' },
    answers: [
      { label: 'Track applied for', value: 'Backend engineering' },
      { label: 'Years of experience', value: '2 years' },
      { label: 'Motivation', value: 'Career switch from data entry.' },
    ],
    history: [
      entry('4-a', 'Application received', '2026-08-20'),
      entry('4-b', 'Assessment score imported automatically', '2026-08-29', 'System'),
      decided('4-c', 'Decision recorded: Hold', '2026-09-06'),
    ],
  }),
  app({
    id: '6',
    name: 'Devi Lestari',
    email: 'devi.lestari@email.com',
    program: 'academy',
    country: 'Indonesia',
    applicationDate: '2026-08-25',
    status: 'Rejected',
    assessmentScore: 45,
    assessmentStatus: 'Failed',
    scoreSource: 'automated-import',
    scoreImportedAt: '2026-09-01',
    notes: 'Assessment below threshold. Rejected on the score, not the application.',
    decision: 'Reject',
    decidedBy: REVIEWER_NAME,
    decidedAt: '2026-09-07',
    finalizedAt: '2026-09-07',
    answers: [
      { label: 'Track applied for', value: 'Frontend engineering' },
      { label: 'Years of experience', value: '1 year' },
      { label: 'Motivation', value: 'Recent graduate, building a portfolio.' },
    ],
    history: [
      entry('6-a', 'Application received', '2026-08-25'),
      entry('6-b', 'Assessment score imported automatically', '2026-09-01', 'System'),
      decided('6-c', 'Decision recorded: Reject', '2026-09-07'),
      decided('6-d', 'Decision finalized', '2026-09-07'),
    ],
  }),
  app({
    id: '7',
    name: 'Eko Prasetyo',
    email: 'eko.prasetyo@email.com',
    program: 'academy',
    country: 'Indonesia',
    applicationDate: '2026-08-28',
    assessmentStatus: 'In progress',
    scoreSource: 'awaiting-import',
    portfolio: { fileName: 'eko-prasetyo-portfolio.pdf', uploadedAt: '2026-08-28' },
    answers: [
      { label: 'Track applied for', value: 'Mobile engineering' },
      { label: 'Years of experience', value: '2 years' },
      { label: 'Motivation', value: 'Wants to specialise in Android.' },
    ],
    history: [
      entry('7-a', 'Application received', '2026-08-28'),
      entry('7-b', 'Assessment invite sent', '2026-09-02', 'System'),
    ],
  }),
  app({
    id: '8',
    name: 'Fajar Muhammad',
    email: 'fajar.muhammad@email.com',
    program: 'academy',
    country: 'Indonesia',
    applicationDate: '2026-09-01',
    answers: [
      { label: 'Track applied for', value: 'Data engineering' },
      { label: 'Years of experience', value: 'Fresh graduate' },
      { label: 'Motivation', value: 'Interested in analytics pipelines.' },
    ],
    history: [entry('8-a', 'Application received', '2026-09-01')],
  }),
  app({
    id: '10',
    name: 'Hendra Gunawan',
    email: 'hendra.gunawan@email.com',
    program: 'academy',
    country: 'Indonesia',
    applicationDate: '2026-09-03',
    status: 'In Review',
    assessmentScore: 55,
    assessmentStatus: 'Passed',
    scoreSource: 'automated-import',
    scoreImportedAt: '2026-09-07',
    notes: 'Borderline score, strong motivation statement.',
    portfolio: { fileName: 'hendra-gunawan-portfolio.pdf', uploadedAt: '2026-09-03' },
    answers: [
      { label: 'Track applied for', value: 'Backend engineering' },
      { label: 'Years of experience', value: '3 years' },
      { label: 'Motivation', value: 'Self-taught, wants formal grounding.' },
    ],
    history: [
      entry('10-a', 'Application received', '2026-09-03'),
      entry('10-b', 'Assessment score imported automatically', '2026-09-07', 'System'),
    ],
  }),
  app({
    id: '11',
    name: 'Indah Permatasari',
    email: 'indah.permatasari@email.com',
    program: 'academy',
    country: 'Indonesia',
    applicationDate: '2026-08-21',
    status: 'Shortlisted',
    assessmentScore: 91,
    assessmentStatus: 'Passed',
    scoreSource: 'automated-import',
    scoreImportedAt: '2026-08-30',
    duplicateOfId: '12',
    notes: 'Top score in the Indonesia pool so far.',
    decision: 'Shortlist',
    decidedBy: REVIEWER_NAME,
    decidedAt: '2026-09-04',
    portfolio: { fileName: 'indah-permatasari-portfolio.pdf', uploadedAt: '2026-08-21' },
    answers: [
      { label: 'Track applied for', value: 'Full-stack engineering' },
      { label: 'Years of experience', value: '5 years' },
      { label: 'Motivation', value: 'Looking for a structured transition into a product team.' },
    ],
    history: [
      entry('11-a', 'Application received', '2026-08-21'),
      entry('11-b', 'Assessment score imported automatically', '2026-08-30', 'System'),
      decided('11-c', 'Decision recorded: Shortlist', '2026-09-04'),
    ],
  }),
  app({
    id: '12',
    name: 'Indah Permatasari',
    email: 'i.permatasari@email.com',
    program: 'institute',
    country: 'Indonesia',
    applicationDate: '2026-08-23',
    status: 'Rejected',
    assessmentScore: 41,
    assessmentStatus: 'Failed',
    scoreSource: 'automated-import',
    scoreImportedAt: '2026-09-02',
    duplicateOfId: '11',
    notes: 'Same person as the academy record. Institute assessment failed — rejected here.',
    decision: 'Reject',
    decidedBy: REVIEWER_NAME,
    decidedAt: '2026-09-04',
    answers: [
      { label: 'Specialisation', value: 'Applied software engineering' },
      { label: 'Current institution', value: 'Institut Teknologi Bandung' },
      { label: 'Supervisor reference', value: 'Provided' },
    ],
    history: [
      entry('12-a', 'Application received', '2026-08-23'),
      entry('12-b', 'Assessment score imported automatically', '2026-09-02', 'System'),
      decided('12-c', 'Decision recorded: Reject', '2026-09-04'),
    ],
  }),

  // ── Indonesia, institute ──────────────────────────────────────────────────
  app({
    id: '5',
    name: 'Chandra Wijaya',
    email: 'chandra.w@email.com',
    program: 'institute',
    country: 'Indonesia',
    applicationDate: '2026-08-22',
    answers: [
      { label: 'Specialisation', value: 'Cloud infrastructure' },
      { label: 'Current institution', value: 'Universitas Gadjah Mada' },
      { label: 'Supervisor reference', value: 'Provided' },
    ],
    history: [entry('5-a', 'Application received', '2026-08-22')],
  }),
  app({
    id: '9',
    name: 'Gita Nuraini',
    email: 'gita.nuraini@email.com',
    program: 'institute',
    country: 'Indonesia',
    applicationDate: '2026-09-02',
    status: 'In Review',
    assessmentScore: 78,
    assessmentStatus: 'Passed',
    scoreSource: 'automated-import',
    scoreImportedAt: '2026-09-08',
    answers: [
      { label: 'Specialisation', value: 'Data science' },
      { label: 'Current institution', value: 'Universitas Airlangga' },
      { label: 'Supervisor reference', value: 'Provided' },
    ],
    history: [
      entry('9-a', 'Application received', '2026-09-02'),
      entry('9-b', 'Assessment score imported automatically', '2026-09-08', 'System'),
    ],
  }),

  // ── Japan ────────────────────────────────────────────────────────────────
  app({
    id: '13',
    name: 'Akiko Tanaka',
    email: 'akiko.tanaka@email.com',
    program: 'academy',
    country: 'Japan',
    applicationDate: '2026-08-19',
    status: 'Shortlisted',
    assessmentScore: 83,
    assessmentStatus: 'Passed',
    scoreSource: 'automated-import',
    scoreImportedAt: '2026-08-27',
    notes: 'Tokyo coordinator flagged her as a strong local candidate.',
    decision: 'Shortlist',
    decidedBy: REVIEWER_NAME,
    decidedAt: '2026-09-03',
    portfolio: { fileName: 'akiko-tanaka-portfolio.pdf', uploadedAt: '2026-08-19' },
    answers: [
      { label: 'Track applied for', value: 'Frontend engineering' },
      { label: 'Years of experience', value: '3 years' },
      { label: 'Japanese language level', value: 'Native' },
    ],
    history: [
      entry('13-a', 'Application received', '2026-08-19'),
      decided('13-b', 'Decision recorded: Shortlist', '2026-09-03'),
    ],
  }),
  app({
    id: '14',
    name: 'Ren Sato',
    email: 'ren.sato@email.com',
    program: 'academy',
    country: 'Japan',
    applicationDate: '2026-08-27',
    status: 'In Review',
    assessmentScore: 69,
    assessmentStatus: 'Passed',
    scoreSource: 'automated-import',
    scoreImportedAt: '2026-09-04',
    answers: [
      { label: 'Track applied for', value: 'Backend engineering' },
      { label: 'Years of experience', value: '2 years' },
      { label: 'Japanese language level', value: 'Native' },
    ],
    history: [
      entry('14-a', 'Application received', '2026-08-27'),
      entry('14-b', 'Assessment score imported automatically', '2026-09-04', 'System'),
    ],
  }),
  app({
    id: '15',
    name: 'Yuki Nakamura',
    email: 'yuki.nakamura@email.com',
    program: 'institute',
    country: 'Japan',
    applicationDate: '2026-09-04',
    answers: [
      { label: 'Specialisation', value: 'Applied machine learning' },
      { label: 'Current institution', value: 'Waseda University' },
      { label: 'Supervisor reference', value: 'Pending' },
    ],
    history: [entry('15-a', 'Application received', '2026-09-04')],
  }),

  // ── Germany ──────────────────────────────────────────────────────────────
  app({
    id: '16',
    name: 'Lukas Brandt',
    email: 'lukas.brandt@email.com',
    program: 'academy',
    country: 'Germany',
    applicationDate: '2026-08-15',
    status: 'In Review',
    assessmentScore: 88,
    assessmentStatus: 'Passed',
    scoreSource: 'automated-import',
    scoreImportedAt: '2026-08-23',
    notes: 'Highest Germany score. Works council question on assessment data still open.',
    portfolio: { fileName: 'lukas-brandt-portfolio.pdf', uploadedAt: '2026-08-15' },
    answers: [
      { label: 'Track applied for', value: 'Full-stack engineering' },
      { label: 'Years of experience', value: '6 years' },
      { label: 'Work authorisation', value: 'EU citizen' },
    ],
    history: [
      entry('16-a', 'Application received', '2026-08-15'),
      entry('16-b', 'Assessment score imported automatically', '2026-08-23', 'System'),
    ],
  }),
  app({
    id: '17',
    name: 'Karl Weber',
    email: 'karl.weber@email.com',
    program: 'academy',
    country: 'Germany',
    applicationDate: '2026-08-24',
    duplicateOfId: '18',
    answers: [
      { label: 'Track applied for', value: 'Backend engineering' },
      { label: 'Years of experience', value: '4 years' },
      { label: 'Work authorisation', value: 'EU citizen' },
    ],
    history: [entry('17-a', 'Application received', '2026-08-24')],
  }),
  app({
    id: '18',
    name: 'Karl Weber',
    email: 'k.weber@email.com',
    program: 'institute',
    country: 'Germany',
    applicationDate: '2026-08-26',
    duplicateOfId: '17',
    answers: [
      { label: 'Specialisation', value: 'Distributed systems' },
      { label: 'Current institution', value: 'TU München' },
      { label: 'Supervisor reference', value: 'Provided' },
    ],
    history: [entry('18-a', 'Application received', '2026-08-26')],
  }),

  // ── UAE ──────────────────────────────────────────────────────────────────
  app({
    id: '19',
    name: 'Layla Al-Rashidi',
    email: 'layla.alrashidi@email.com',
    program: 'academy',
    country: 'UAE',
    applicationDate: '2026-08-30',
    status: 'In Review',
    assessmentScore: 80,
    assessmentStatus: 'Passed',
    scoreSource: 'automated-import',
    scoreImportedAt: '2026-09-06',
    answers: [
      { label: 'Track applied for', value: 'Data engineering' },
      { label: 'Years of experience', value: '4 years' },
      { label: 'UAE residency', value: 'Resident' },
    ],
    history: [
      entry('19-a', 'Application received', '2026-08-30'),
      entry('19-b', 'Assessment score imported automatically', '2026-09-06', 'System'),
    ],
  }),
  app({
    id: '20',
    name: 'Omar Hassan',
    email: 'omar.hassan@email.com',
    program: 'institute',
    country: 'UAE',
    applicationDate: '2026-09-05',
    answers: [
      { label: 'Specialisation', value: 'Cybersecurity' },
      { label: 'Current institution', value: 'Khalifa University' },
      { label: 'Supervisor reference', value: 'Pending' },
    ],
    history: [entry('20-a', 'Application received', '2026-09-05')],
  }),
];
