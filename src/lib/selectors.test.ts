import { describe, expect, it } from 'vitest';
import { SEED_APPLICANTS } from '../data/seed';
import {
  buildQueue,
  calibrationSnapshot,
  duplicatePartner,
  emptyFilters,
  sortApplicants,
} from './selectors';

const byId = (id: string) => SEED_APPLICANTS.find((a) => a.id === id)!;

describe('queue filtering', () => {
  it('returns every seeded application when no filters are set', () => {
    expect(buildQueue(SEED_APPLICANTS, emptyFilters, 'date')).toHaveLength(SEED_APPLICANTS.length);
  });

  it('filters by duplicate signal, which is what the reviewer chases most', () => {
    const dupes = buildQueue(SEED_APPLICANTS, { ...emptyFilters, duplicateOnly: true }, 'date');
    expect(dupes.length).toBeGreaterThan(0);
    expect(dupes.every((a) => a.duplicateOfId !== null)).toBe(true);
  });

  it('maps search onto both name and email', () => {
    const byName = buildQueue(SEED_APPLICANTS, { ...emptyFilters, search: 'ahmad' }, 'date');
    expect(byName.map((a) => a.id).sort()).toEqual(['1', '2']);

    const byEmail = buildQueue(
      SEED_APPLICANTS,
      { ...emptyFilters, search: 'k.weber@email.com' },
      'date',
    );
    expect(byEmail.map((a) => a.id)).toEqual(['18']);
  });

  it('excludes unscored applicants from a deliberate score range', () => {
    const ranged = buildQueue(SEED_APPLICANTS, { ...emptyFilters, scoreMin: '80' }, 'score');
    expect(ranged.map((a) => a.id)).toEqual(['11', '16', '3', '13', '19']);
    expect(ranged.every((a) => a.assessmentScore !== null && a.assessmentScore >= 80)).toBe(true);
  });
});

describe('queue sorting', () => {
  it('sorts by score descending and sinks unscored applicants to the bottom', () => {
    const sorted = sortApplicants(SEED_APPLICANTS, 'score');
    const scored = sorted.filter((a) => a.assessmentScore !== null);
    const unscored = sorted.filter((a) => a.assessmentScore === null);

    expect(scored[0].assessmentScore).toBe(91);
    expect(scored.map((a) => a.assessmentScore)).toEqual(
      [...scored].map((a) => a.assessmentScore).sort((x, y) => (y ?? 0) - (x ?? 0)),
    );
    // Unscored records must be contiguous at the end, not interleaved.
    expect(sorted.slice(scored.length)).toEqual(unscored);
    expect(sorted.slice(0, scored.length)).toEqual(scored);
  });

  it('sorts by applied date with the newest first', () => {
    const sorted = sortApplicants(SEED_APPLICANTS, 'date');
    expect(sorted[0].applicationDate).toBe('2026-09-05');
    const dates = sorted.map((a) => a.applicationDate);
    expect(dates).toEqual([...dates].sort((x, y) => y.localeCompare(x)));
  });
});

describe('duplicate pairing', () => {
  it('resolves the pair in both directions', () => {
    const academy = byId('1');
    const institute = byId('2');
    expect(duplicatePartner(SEED_APPLICANTS, academy)?.id).toBe('2');
    expect(duplicatePartner(SEED_APPLICANTS, institute)?.id).toBe('1');
  });

  it('returns nothing for an unpaired applicant', () => {
    expect(duplicatePartner(SEED_APPLICANTS, byId('3'))).toBeUndefined();
  });

  it('keeps the pair honest when one side is already rejected', () => {
    const partner = duplicatePartner(SEED_APPLICANTS, byId('11'));
    expect(partner?.status).toBe('Rejected');
  });
});

describe('calibration snapshot', () => {
  it('counts the whole pool by status', () => {
    const snapshot = calibrationSnapshot(SEED_APPLICANTS, '2026-09-09');
    const total = snapshot.byStatus.reduce((sum, s) => sum + s.count, 0);
    expect(snapshot.asOf).toBe('2026-09-09');
    expect(snapshot.poolSize).toBe(SEED_APPLICANTS.length);
    expect(total).toBe(SEED_APPLICANTS.length);
    expect(snapshot.byStatus.find((s) => s.status === 'Shortlisted')?.count).toBe(3);
    expect(snapshot.newestApplication).toBe('2026-09-05');
  });
});
