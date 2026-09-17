import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState, workspaceReducer, type WorkspaceState } from './reducer';

let state: WorkspaceState;

beforeEach(() => {
  state = createInitialState();
});

const find = (s: WorkspaceState, id: string) => s.applicants.find((a) => a.id === id)!;

describe('decision capture (G1)', () => {
  it('records the decision with reviewer and timestamp, and updates the queue status', () => {
    const before = find(state, '5');
    expect(before.decision).toBeNull();

    const next = workspaceReducer(state, { type: 'decide', id: '5', decision: 'Hold' });
    const after = find(next, '5');

    expect(after.decision).toBe('Hold');
    expect(after.status).toBe('On Hold');
    expect(after.decidedBy).toBe('Dian');
    expect(after.decidedAt).not.toBeNull();
    expect(after.history.at(-1)?.action).toBe('Decision recorded: Hold');
    // The record the reviewer was looking at is untouched.
    expect(find(next, '3')).toEqual(find(state, '3'));
  });

  it('routes each decision to the matching screening status', () => {
    const shortlist = workspaceReducer(state, { type: 'decide', id: '5', decision: 'Shortlist' });
    expect(find(shortlist, '5').status).toBe('Shortlisted');

    const reject = workspaceReducer(state, { type: 'decide', id: '5', decision: 'Reject' });
    expect(find(reject, '5').status).toBe('Rejected');
  });

  it('adds shortlisted candidates to the comparison set', () => {
    const next = workspaceReducer(state, { type: 'decide', id: '5', decision: 'Shortlist' });
    expect(next.comparisonIds).toContain('5');

    const held = workspaceReducer(state, { type: 'decide', id: '5', decision: 'Hold' });
    expect(held.comparisonIds).not.toContain('5');
  });

  it('is reversible until finalized, then locked', () => {
    const decided = workspaceReducer(state, { type: 'decide', id: '7', decision: 'Shortlist' });
    const reversed = workspaceReducer(decided, { type: 'reverse', id: '7' });
    const after = find(reversed, '7');

    expect(after.decision).toBeNull();
    expect(after.status).toBe('In Review');
    expect(after.decidedBy).toBeNull();
    // The reversal is part of the audit trail, not an erasure of it.
    expect(after.history.some((h) => h.action === 'Decision reversed (was Shortlist)')).toBe(true);

    const refired = workspaceReducer(reversed, { type: 'decide', id: '7', decision: 'Hold' });
    const finalized = workspaceReducer(refired, { type: 'finalize', id: '7' });
    expect(find(finalized, '7').finalizedAt).not.toBeNull();

    const tampered = workspaceReducer(finalized, { type: 'decide', id: '7', decision: 'Reject' });
    expect(find(tampered, '7').decision).toBe('Hold');
    const unreversed = workspaceReducer(finalized, { type: 'reverse', id: '7' });
    expect(find(unreversed, '7').decision).toBe('Hold');
  });

  it('will not finalize a decision that does not exist', () => {
    const next = workspaceReducer(state, { type: 'finalize', id: '8' });
    expect(find(next, '8').finalizedAt).toBeNull();
  });
});

describe('reviewer notes', () => {
  it('saves notes onto the record with an audit entry, and ignores no-op saves', () => {
    const saved = workspaceReducer(state, { type: 'saveNotes', id: '5', notes: 'Worth a second look.' });
    expect(find(saved, '5').notes).toBe('Worth a second look.');
    expect(find(saved, '5').history.at(-1)?.action).toBe('Reviewer note updated');

    const unchanged = workspaceReducer(saved, { type: 'saveNotes', id: '5', notes: 'Worth a second look.' });
    expect(find(unchanged, '5').history).toHaveLength(find(saved, '5').history.length);
  });
});

describe('comparison set', () => {
  it('starts from the shortlisted records so the director has something to compare', () => {
    expect(state.comparisonIds.sort()).toEqual(['11', '13', '3']);
  });

  it('removing from the comparison set does not undo the screening decision', () => {
    // Regression guard: the predecessor prototype reset the applicant to "In Review"
    // when removed from the comparison view, which silently destroyed their decision.
    const before = find(state, '12');
    const next = workspaceReducer(
      workspaceReducer(state, { type: 'addToComparison', id: '12' }),
      { type: 'removeFromComparison', id: '12' },
    );

    expect(next.comparisonIds).not.toContain('12');
    expect(find(next, '12').status).toBe(before.status);
    expect(find(next, '12').decision).toBe(before.decision);
    expect(find(next, '12').history).toEqual(before.history);
  });

  it('does not add the same candidate twice', () => {
    const once = workspaceReducer(state, { type: 'addToComparison', id: '3' });
    const twice = workspaceReducer(once, { type: 'addToComparison', id: '3' });
    expect(twice.comparisonIds.filter((id) => id === '3')).toHaveLength(1);
  });
});

describe('session controls', () => {
  it('switch view and selection without touching application data', () => {
    const next = workspaceReducer(state, { type: 'setView', view: 'comparison' });
    expect(next.view).toBe('comparison');
    expect(next.applicants).toEqual(state.applicants);

    const selected = workspaceReducer(next, { type: 'select', id: '11' });
    expect(selected.selectedId).toBe('11');
  });

  it('reset restores the seeded demo data', () => {
    const dirty = workspaceReducer(state, { type: 'decide', id: '5', decision: 'Reject' });
    const clean = workspaceReducer(dirty, { type: 'reset' });
    expect(find(clean, '5').decision).toBeNull();
    expect(clean.comparisonIds.sort()).toEqual(['11', '13', '3']);
  });
});
