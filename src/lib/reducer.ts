import type { Applicant, AuditEntry, Decision, View } from '../types';
import { SEED_APPLICANTS, REVIEWER_NAME } from '../data/seed';
import { DECISION_STATUS } from './selectors';

/**
 * Single source of truth for the prototype session: applications, the comparison
 * set, the active view and the selected record. Decisions recorded here appear in
 * the queue immediately — no reload, which is the direct answer to "no decision
 * capture, reviewers work from a spreadsheet built off a nightly CSV export".
 */

export interface WorkspaceState {
  applicants: Applicant[];
  comparisonIds: string[];
  view: View;
  selectedId: string | null;
}

export type WorkspaceAction =
  | { type: 'select'; id: string | null }
  | { type: 'setView'; view: View }
  | { type: 'decide'; id: string; decision: Decision }
  | { type: 'reverse'; id: string }
  | { type: 'finalize'; id: string }
  | { type: 'saveNotes'; id: string; notes: string }
  | { type: 'addToComparison'; id: string }
  | { type: 'removeFromComparison'; id: string }
  | { type: 'reset' };

export function createInitialState(): WorkspaceState {
  // Selection opens on the newest application, which is what the queue shows first.
  const newest = [...SEED_APPLICANTS].sort((a, b) =>
    b.applicationDate.localeCompare(a.applicationDate),
  )[0];
  return {
    applicants: SEED_APPLICANTS,
    comparisonIds: SEED_APPLICANTS.filter((a) => a.status === 'Shortlisted').map((a) => a.id),
    view: 'screening',
    selectedId: newest ? newest.id : null,
  };
}

const stamp = (): string => new Date().toISOString();

const withHistory = (applicant: Applicant, action: string, actor = REVIEWER_NAME): AuditEntry[] => [
  ...applicant.history,
  { id: `${applicant.id}-${applicant.history.length + 1}-${Date.now()}`, action, actor, at: stamp() },
];

const update = (
  state: WorkspaceState,
  id: string,
  change: (applicant: Applicant, at: string) => Applicant,
): WorkspaceState => {
  const at = stamp();
  return {
    ...state,
    applicants: state.applicants.map((a) => (a.id === id ? change(a, at) : a)),
  };
};

export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction,
): WorkspaceState {
  switch (action.type) {
    case 'select':
      return { ...state, selectedId: action.id };

    case 'setView':
      return { ...state, view: action.view };

    case 'decide': {
      const applicant = state.applicants.find((a) => a.id === action.id);
      // A finalized decision is locked — that is what "finalized" means here.
      if (!applicant || applicant.finalizedAt) return state;
      const decision = action.decision;
      const next = update(state, action.id, (a, at) => ({
        ...a,
        status: DECISION_STATUS[decision],
        decision,
        decidedBy: REVIEWER_NAME,
        decidedAt: at,
        finalizedAt: null,
        history: withHistory(a, `Decision recorded: ${decision}`),
      }));
      // Shortlisting is what puts a candidate in front of the director, so it also
      // populates the comparison set (PRD §7.1). Done here, in one place, so the
      // behaviour is not hidden inside a view.
      if (decision !== 'Shortlist' || state.comparisonIds.includes(action.id)) return next;
      return { ...next, comparisonIds: [...next.comparisonIds, action.id] };
    }

    case 'reverse':
      return update(state, action.id, (applicant) => {
        if (!applicant.decision || applicant.finalizedAt) return applicant;
        const previous = applicant.decision;
        return {
          ...applicant,
          status: 'In Review',
          decision: null,
          decidedBy: null,
          decidedAt: null,
          finalizedAt: null,
          history: withHistory(applicant, `Decision reversed (was ${previous})`),
        };
      });

    case 'finalize':
      return update(state, action.id, (applicant, at) => {
        if (!applicant.decision || applicant.finalizedAt) return applicant;
        return {
          ...applicant,
          finalizedAt: at,
          history: withHistory(applicant, 'Decision finalized'),
        };
      });

    case 'saveNotes':
      return update(state, action.id, (applicant) => {
        if (applicant.notes === action.notes) return applicant;
        return {
          ...applicant,
          notes: action.notes,
          history: withHistory(applicant, 'Reviewer note updated'),
        };
      });

    case 'addToComparison':
      return state.comparisonIds.includes(action.id)
        ? state
        : { ...state, comparisonIds: [...state.comparisonIds, action.id] };

    case 'removeFromComparison':
      // Deliberately does NOT touch the application's decision, status or history.
      // Removing someone from a comparison view is not an undo of their screening
      // decision — the predecessor prototype conflated the two and silently reset
      // rejected applicants back to "In Review".
      return {
        ...state,
        comparisonIds: state.comparisonIds.filter((id) => id !== action.id),
      };

    case 'reset':
      return createInitialState();

    default:
      return state;
  }
}

